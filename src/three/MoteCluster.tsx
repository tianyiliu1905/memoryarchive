import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createMotesMaterial } from './motesMaterial';
import type { MemoryCluster, Project } from '@/data/types';
import { useArchive } from '@/store/archive';
import type { PointerState } from '@/hooks/usePointer';
import { moteOffsets } from './layout';

interface Props {
  cluster: MemoryCluster;
  projects: Project[];
  pointer: React.MutableRefObject<PointerState>;
  diveCharge: React.MutableRefObject<number>;
  /** 盆平面上的世界坐标锚点 */
  anchor: THREE.Vector3;
}

/**
 * 每颗光斑由多少个节点组成（含头部）。
 *
 * 节点越多尾巴越连续，但粒子总数是它的倍数。
 * 项目最多 6 个 × 3 群 = 18 颗光斑，7 节点即 126 个粒子，
 * 对 point sprite 来说微不足道，却足以让尾巴看起来是连的。
 */
const TRAIL_NODES = 7;

/**
 * 一组荧光光斑。
 *
 * 粒子分两类：
 *   - 项目粒子：围绕某个项目的 offset 聚集，是「可进入」的实体
 *   - 氛围粒子：自由散布在群内，只负责营造墨水 / 浮游生物的质感
 *
 * 分布用的是「聚集式随机」而非均匀随机：先选一个吸引核，
 * 再按幂次衰减的半径散开，这样才像墨水在水中扩散。
 */
export function MoteCluster({ cluster, projects, pointer, diveCharge, anchor }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  const focusedCluster = useArchive((s) => s.focusedCluster);
  const depth = useArchive((s) => s.depth);
  const hoveredCluster = useArchive((s) => s.hoveredCluster);
  const hoveredProject = useArchive((s) => s.hoveredProject);

  // ---- 生成粒子属性 ----
  const { geometry, material } = useMemo(() => {
    /**
     * 一个项目 = 一颗光斑。
     *
     * 不再使用「粒子云 + 氛围粒子」的堆叠方式——那会让每个作品
     * 失去可辨识的实体感。现在每颗光斑都是一个明确的、可以被
     * 指向和进入的对象，大小统一，只靠位置与悬停状态区分。
     */
    const projCount = projects.length;
    /* 每个项目不再只有一颗光斑，而是一串「拖尾节点」。

       拖尾不缓存历史帧，而是解析式求得：光斑的位置是时间的
       纯函数（几条正弦的叠加），所以把时间往回拨一点代进同一个
       函数，得到的就是它过去所在的位置。第 n 个节点回拨 n 步，
       串起来正好是这颗光斑刚刚走过的轨迹。

       好处是尾巴长度自动跟随速度：摆得快时相邻采样点拉得开，
       尾巴自然变长；几乎静止时各节点重叠成一点，尾巴消失。 */
    const count = projCount * TRAIL_NODES;

    const offsets = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const brights = new Float32Array(count);
    const projectIdx = new Float32Array(count);
    // 0 = 头部（真实位置），1 = 尾端（最久以前）
    const trail = new Float32Array(count);

    // 位置来自 layout.ts 的共享函数，保证与命中区完全一致
    const positions = moteOffsets(cluster.id, projCount);

    /* 群自身的种子偏移。

       原本 seed 只由项目索引 pi 决定，而三个群都从 pi=0 开始编号，
       于是绿/紫/黄的第 n 颗光斑拿到的是同一个 seed——摆动和呼吸
       完全同步。画面上就是三处遥相呼应的同步脉动，比同群内部的
       同步更扎眼。

       把群的身份也混进去，三个群的序列就此错开。 */
    const clusterSeed = { green: 0.0, purple: 0.37, yellow: 0.71 }[cluster.id] ?? 0;

    projects.forEach((_proj, pi) => {
      const p = positions[pi];
      /* 用索引生成稳定的相位，让每颗光斑的摆动互不同步。

         黄金比的小数部分是最「不可通约」的无理数，
         连续取模后能把 [0,1) 填得最均匀——任意前 n 项都不会
         扎堆，这正是需要的性质。 */
      const seed = (pi * 0.6180339887 + clusterSeed) % 1.0;

      for (let n = 0; n < TRAIL_NODES; n++) {
        const i = pi * TRAIL_NODES + n;

        offsets[i * 3] = p.x;
        offsets[i * 3 + 1] = p.y;
        offsets[i * 3 + 2] = p.z;

        /* 统一直径、统一亮度——差异只由悬停状态体现。

           这个值决定精灵的屏幕尺寸，也就决定了弥散范围。

           从 3.0 提到 4.6：要的正是「相邻光斑的弥散区彼此重叠」。
           精灵放大后外圈的长尾能够到邻居，叠加混合（见
           motesMaterial 的 CustomBlending）会在交叠处累出更浓的
           色，整群于是连成一片流动的光。

           注意这与 MOTE_MIN_SEP 不冲突：那个最小间距管的是「光斑
           核心不能叠在一起」，保证每个作品仍可被单独指向；这里放大
           的是核心之外的弥散尾巴。核心依旧是分得开的。 */
        sizes[i] = 4.6;
        brights[i] = 1.0;
        seeds[i] = seed;
        projectIdx[i] = pi;
        // 均分到 [0,1]，单节点时退化为纯头部
        trail[i] = TRAIL_NODES > 1 ? n / (TRAIL_NODES - 1) : 0;
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aBright', new THREE.BufferAttribute(brights, 1));
    geo.setAttribute('aProjectIdx', new THREE.BufferAttribute(projectIdx, 1));
    geo.setAttribute('aTrail', new THREE.BufferAttribute(trail, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);

    const mat = createMotesMaterial(cluster.color);
    mat.uniforms.uClusterPos.value.copy(anchor);

    return { geometry: geo, material: mat };
  }, [cluster, projects, anchor]);

  // ---- 每帧更新 uniforms ----
  const focusV = useRef(0);
  const dimV = useRef(0);
  const forceV = useRef(0);
  /* 悬停状态：当前项（索引 + 亮度）与正在消退的上一项。
     分成两组才能让「旧的淡出」与「新的淡入」同时进行。 */
  const hoverIdxV = useRef(-1);
  const hoverAmtV = useRef(0);
  const hoverPrevIdx = useRef(-1);
  const hoverPrevAmt = useRef(0);
  const diveV = useRef(0);

  useFrame((state, delta) => {
    const m = matRef.current;
    if (!m) return;
    const d = Math.min(delta, 0.05);
    const u = m.uniforms;

    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);

    // 指针 → 盆平面坐标（相机俯视，近似映射）
    const px = pointer.current.sx * viewport.width * 0.5;
    const pz = -pointer.current.sy * viewport.height * 0.5;
    u.uPointer.value.set(px - anchor.x, pz - anchor.z);

    // 指针影响强度：盆全景时最强，聚焦后减弱
    const isRelevant = depth === 'basin' || focusedCluster === cluster.id;
    const targetForce = pointer.current.inside && isRelevant ? 0.55 + pointer.current.speed * 0.35 : 0;
    forceV.current += (targetForce - forceV.current) * d * 4.5;
    u.uPointerForce.value = forceV.current;

    // 聚焦 / 退散
    const isFocused = focusedCluster === cluster.id;
    const inCluster = depth === 'cluster' || depth === 'diving' || depth === 'surfacing';
    const targetFocus = inCluster && isFocused ? 1 : 0;
    const targetDim = inCluster && !isFocused ? 1 : 0;

    focusV.current += (targetFocus - focusV.current) * d * 2.1;
    dimV.current += (targetDim - dimV.current) * d * 2.1;
    u.uFocus.value = focusV.current;
    u.uDim.value = dimV.current;

    /* ---- 悬停：索引硬切，亮度插值 ----

       曾经这里把索引本身做指数插值再送进 shader，那是错的：
       从 3 号渐变到 7 号会依次经过 4/5/6，沿途每个光斑都被
       点亮一瞬。现在索引直接赋值，只让亮度连续变化。

       另外保留一个「正在消退」的槽位：切换到新光斑时，把旧的
       索引与当前亮度挪过去继续衰减，于是旧光斑是淡下去的，
       而不是瞬间掉回底色——这正是之前颜色变化显得生硬的原因。 */
    const hIdx = hoveredProject ? projects.findIndex((p) => p.id === hoveredProject) : -1;

    if (hIdx !== hoverIdxV.current) {
      // 目标换人：旧目标连同它此刻的亮度一起转入消退槽
      if (hoverIdxV.current >= 0 && hoverAmtV.current > 0.001) {
        hoverPrevIdx.current = hoverIdxV.current;
        hoverPrevAmt.current = hoverAmtV.current;
      }
      hoverIdxV.current = hIdx;
      // 新目标从 0 起亮；若消退槽正好是它，接着原亮度继续，避免回跳
      hoverAmtV.current = hIdx >= 0 && hoverPrevIdx.current === hIdx ? hoverPrevAmt.current : 0;
      if (hoverPrevIdx.current === hIdx) hoverPrevIdx.current = -1;
    }

    /* 亮起比消退快：进入时要跟手，离开时要留恋。
       5.5 / 3.0 大约对应 0.35s 与 0.65s 的观感。 */
    const targetAmt = hIdx >= 0 ? 1 : 0;
    const amtSpeed = targetAmt > hoverAmtV.current ? 5.5 : 3.0;
    hoverAmtV.current += (targetAmt - hoverAmtV.current) * Math.min(1, d * amtSpeed);

    // 消退槽单向衰减，归零后释放
    if (hoverPrevIdx.current >= 0) {
      hoverPrevAmt.current += (0 - hoverPrevAmt.current) * Math.min(1, d * 3.0);
      if (hoverPrevAmt.current < 0.004) {
        hoverPrevAmt.current = 0;
        hoverPrevIdx.current = -1;
      }
    }

    u.uHoverProject.value = hIdx;
    u.uHoverAmount.value = hoverAmtV.current;
    u.uHoverPrev.value = hoverPrevIdx.current;
    u.uHoverPrevAmount.value = hoverPrevAmt.current;

    // 盆全景时，被悬停的群整体提亮
    const hoverBoost = depth === 'basin' && hoveredCluster === cluster.id ? 1.22 : 1.0;
    const targetOpacity = depth === 'diving' ? 0.35 : hoverBoost;
    u.uOpacity.value += (targetOpacity - u.uOpacity.value) * d * 3.4;

    /* 下潜蓄力：必须插值，不能直接赋值。

       跃迁发生时 useDiveGesture 会把 chargeRef 硬切为 0。若这里直接
       赋值，光斑「被吸向中心」的位移就会在一帧内消失，看起来就是
       所有光斑猛地弹一下再回位。用指数衰减把这个归零过程摊开，
       弹跳就变成了自然的回弹。 */
    const targetDive = isFocused ? Math.max(0, diveCharge.current) : 0;
    diveV.current += (targetDive - diveV.current) * d * 5.5;
    u.uDive.value = diveV.current;
  });

  // 用 size 触发 pixelRatio 更新
  void size;

  return (
    <points geometry={geometry} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}
