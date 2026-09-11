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
    const count = projects.length;

    const offsets = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const brights = new Float32Array(count);
    const projectIdx = new Float32Array(count);

    // 位置来自 layout.ts 的共享函数，保证与命中区完全一致
    const positions = moteOffsets(cluster.id, count);

    projects.forEach((_proj, pi) => {
      const p = positions[pi];
      offsets[pi * 3] = p.x;
      offsets[pi * 3 + 1] = p.y;
      offsets[pi * 3 + 2] = p.z;

      /* 统一直径、统一亮度——差异只由悬停状态体现。

         这个值决定精灵的屏幕尺寸。注意它必须和片元里的渐变色标
         配合调整：新色标在 r=60% 处仍有约 0.1 的不透明度（比之前
         收紧的长尾可见得多），因此精灵要相应缩小，否则相邻光斑
         的外圈会彼此粘连，糊成一团。 */
      sizes[pi] = 3.0;
      brights[pi] = 1.0;
      // 用索引生成稳定的相位，让每颗光斑的摆动互不同步
      seeds[pi] = ((pi * 0.6180339887) % 1.0);
      projectIdx[pi] = pi;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aBright', new THREE.BufferAttribute(brights, 1));
    geo.setAttribute('aProjectIdx', new THREE.BufferAttribute(projectIdx, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);

    const mat = createMotesMaterial(cluster.color);
    mat.uniforms.uClusterPos.value.copy(anchor);

    return { geometry: geo, material: mat };
  }, [cluster, projects, anchor]);

  // ---- 每帧更新 uniforms ----
  const focusV = useRef(0);
  const dimV = useRef(0);
  const forceV = useRef(0);
  const hoverIdxV = useRef(-1);
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

    // 悬停项目索引
    const hIdx = hoveredProject ? projects.findIndex((p) => p.id === hoveredProject) : -1;
    hoverIdxV.current += (hIdx - hoverIdxV.current) * d * 12;
    u.uHoverProject.value = hIdx >= 0 ? hIdx : -1;

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
