import * as THREE from 'three';
import type { MemoryCluster } from '@/data/types';

/** 盆的世界半径 */
export const BASIN_RADIUS = 4.2;

/* ============================================================
   盆外缘点圈的几何

   放在这里而不是 BasinRing 内部，是因为盆的着色器也要用：
   盆必须在点圈所在的半径上压出一道浅浅的暗带，白点才看得见
   （纸面 0.965，纯白只高出 0.035，不压暗就是隐形的）。
   两边共用同一组常量，暗带才不会和点错位——和上面 moteOffsets
   同时服务于 MoteCluster 与 HitZones 是一个道理。
   ============================================================ */

/** 点带的中心半径（世界单位） */
export const RING_RADIUS = 3.05;

/** 点带的径向半宽。点在带内近高斯分布，中间密、边缘疏 */
export const RING_THICKNESS = 0.15;

/**
 * 点的最大半径与 RING_RADIUS 之比。
 * 由低频起伏（最大 +5.7%）、厚度与游离点共同决定，实测取整。
 */
const RING_OUTER_RATIO = 1.12;

/** 点圈的最外缘 */
export const RING_OUTER = RING_RADIUS * RING_OUTER_RATIO;

/**
 * 窄屏收拢系数。
 *
 * 盆全景下相机固定在 y=9.2 / fov 42，盆平面上的可见半高是
 * 9.2·tan21° ≈ 3.53，点圈的最外缘 3.42 正好占 97%——宽屏下
 * 几乎不收，撑满画面。
 *
 * 但竖屏时可见宽度会短于高度，按原半径画就会被左右裁掉两块，
 * 圈立刻断成上下两段弧。所以按较短的那一边等比收拢，留 6% 余量。
 *
 * @param viewW 盆平面上的可见宽度（useThree 的 viewport.width）
 * @param viewH 盆平面上的可见高度
 */
export function ringFitScale(viewW: number, viewH: number): number {
  const halfMin = Math.min(viewW, viewH) * 0.5;
  return Math.min(1, (halfMin * 0.94) / RING_OUTER);
}

/** 把归一化的 anchor 映射到盆平面的世界坐标 */
export function clusterAnchor(cluster: MemoryCluster) {
  return new THREE.Vector3(
    cluster.anchor[0] * BASIN_RADIUS * 0.62,
    0,
    -cluster.anchor[1] * BASIN_RADIUS * 0.62
  );
}

/* ============================================================
   光斑基准布局

   一个项目 = 一颗光斑。这里是光斑位置的唯一来源：
   MoteCluster 用它写入 geometry，HitZones 用它放置命中区。
   两边必须共用同一个函数，否则「看到的」和「点到的」会错位。
   ============================================================ */

/** 光斑在群内的分布半径。每群到 6 颗后适当放大，避免盆全景下挤成一团 */
export const MOTE_SPREAD = 0.66;

/**
 * 任意两颗光斑在盆平面上必须保持的最小间距。
 *
 * 下限由三件事共同决定：
 *   - 命中球半径 0.2（HitZones），两球不相交就需要 0.4
 *   - 远景摆动幅度 0.11（motesMaterial），最坏情况两颗相向而摆
 *   - 视觉上还要留一点空气，否则外圈的长尾会粘连
 * 取 0.46 略高于 0.4，把摆动的一半余量也吃掉。
 */
export const MOTE_MIN_SEP = 0.46;

/**
 * 计算某个群内所有光斑的基准偏移。
 *
 * 角度用黄金角打底，保证分布是有机的、不像钟面那样规整；
 * 但黄金角只在数量很大时才接近最优——n=6 时第 0 与第 5 颗
 * 恰好落在相邻角度上，叠加随机扰动后间距一度只有 0.207，
 * 比命中球的直径还小，于是「Nocode 产品重构」和邻居粘在了一起。
 *
 * 所以后面补一道松弛：靠得太近的点沿着各自的环互相推开。
 * 半径每轮都被拉回原值，推开只改变角度，环状结构因此保持不变。
 *
 * @param clusterId 群 id，用于生成确定性的随机扰动
 * @param count     该群的光斑数量
 */
export function moteOffsets(clusterId: string, count: number): THREE.Vector3[] {
  let seed = clusterId.charCodeAt(0) * 977 + count * 31;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const GOLDEN = 2.399963; // 黄金角，天然的低差异分布
  const out: THREE.Vector3[] = [];
  // 记录每颗光斑的目标环半径，松弛时据此把点拉回自己的环
  const radii: number[] = [];

  for (let i = 0; i < count; i++) {
    const ang = i * GOLDEN + rnd() * 0.5;
    const radial = MOTE_SPREAD * (0.62 + 0.38 * Math.sqrt((i + 0.6) / count));

    const x = Math.cos(ang) * radial + (rnd() - 0.5) * 0.06;
    const z = Math.sin(ang) * radial + (rnd() - 0.5) * 0.06;

    out.push(new THREE.Vector3(x, (rnd() - 0.5) * 0.18, z));
    radii.push(Math.hypot(x, z));
  }

  /* 松弛 + 必要时整体扩环。

     松弛只让点沿圆周滑动，不改变环半径；当数量多到一圈排不下时
     （实测 n≥8），无论怎么滑都满足不了最小间距。这时唯一的出路
     是把整个群摊得更开一点，所以失败就放大 6% 再试。
     上限 6 次≈1.42 倍，足够撑到十几颗，也不至于涨出盆外。 */
  for (let attempt = 0; attempt < 6; attempt++) {
    if (relaxSeparation(out, radii)) break;

    for (let i = 0; i < out.length; i++) {
      radii[i] *= 1.06;
      const r = Math.hypot(out[i].x, out[i].z);
      if (r < 1e-6) continue;
      const k = radii[i] / r;
      out[i].x *= k;
      out[i].z *= k;
    }
  }

  return out;
}

/**
 * 最小间距松弛。
 *
 * 每轮：把距离小于 MOTE_MIN_SEP 的点对沿连线各推开一半，
 * 然后把每个点拉回它原本的环半径——于是点只能沿圆周滑动，
 * 不会越挤越往外扩，群的整体尺寸得以保持。
 *
 * 只看 XZ 平面：相机是俯视的，y 方向的差异（±0.09）不足以
 * 把两颗光斑在屏幕上分开，按 XZ 判定才是保守且正确的。
 *
 * @returns 是否已满足所有间距要求
 */
function relaxSeparation(pts: THREE.Vector3[], radii: number[]): boolean {
  const n = pts.length;
  if (n < 2) return true;

  for (let iter = 0; iter < 64; iter++) {
    let collided = false;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pts[j].x - pts[i].x;
        const dz = pts[j].z - pts[i].z;
        let d = Math.hypot(dx, dz);
        if (d >= MOTE_MIN_SEP) continue;

        collided = true;

        // 完全重合时给一个确定性的方向，避免除以 0
        let ux: number, uz: number;
        if (d < 1e-6) {
          const a = (i * 1.7 + j) % (Math.PI * 2);
          ux = Math.cos(a);
          uz = Math.sin(a);
          d = 1e-6;
        } else {
          ux = dx / d;
          uz = dz / d;
        }

        const push = (MOTE_MIN_SEP - d) * 0.5;
        pts[i].x -= ux * push;
        pts[i].z -= uz * push;
        pts[j].x += ux * push;
        pts[j].z += uz * push;
      }
    }

    if (!collided) return true;

    // 拉回各自的环：推开的效果只保留角度分量
    for (let i = 0; i < n; i++) {
      const r = Math.hypot(pts[i].x, pts[i].z);
      if (r < 1e-6) continue;
      const k = radii[i] / r;
      pts[i].x *= k;
      pts[i].z *= k;
    }
  }

  // 迭代用尽仍未收敛：这一圈确实排不下
  return false;
}

/* ============================================================
   聚焦外扩
   必须与 motesMaterial.ts 顶点着色器中的第 4 步保持完全一致，
   否则不可见的命中区会与肉眼看到的光斑错位。
   ============================================================ */

export const FOCUS_R_REF = 0.75;
export const FOCUS_K = 0.55;
export const FOCUS_SCALE = 1.85;
export const FOCUS_MIN_R = 0.2;

/**
 * 把粒子在群内的基准偏移，换算成聚焦状态下的实际位置。
 * @param offset 项目在群内的基准偏移（已乘过 0.7 / 0.5 的分量）
 * @param focus  0 = 远景, 1 = 完全聚焦
 */
export function focusedOffset(
  offset: THREE.Vector3,
  focus: number
): THREE.Vector3 {
  const r = offset.length();
  if (r < 0.0001) return offset.clone();

  const dir = offset.clone().divideScalar(r);
  const nr = Math.min(r / FOCUS_R_REF, 1.6);
  const k = 1 + (FOCUS_K - 1) * focus;
  let expanded = Math.pow(nr, k) * FOCUS_R_REF;

  expanded = Math.max(expanded, FOCUS_MIN_R * focus);
  expanded *= 1 + (FOCUS_SCALE - 1) * focus;

  return dir.multiplyScalar(expanded);
}
