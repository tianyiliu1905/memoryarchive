import * as THREE from 'three';
import type { MemoryCluster } from '@/data/types';

/** 盆的世界半径 */
export const BASIN_RADIUS = 4.2;

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

/** 光斑在群内的分布半径 */
export const MOTE_SPREAD = 0.58;

/**
 * 计算某个群内所有光斑的基准偏移。
 * 用黄金角分布，保证任意数量（3/4/5 个）都均匀且互不贴近。
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

  for (let i = 0; i < count; i++) {
    const ang = i * GOLDEN + rnd() * 0.5;
    const radial = MOTE_SPREAD * (0.62 + 0.38 * Math.sqrt((i + 0.6) / count));

    out.push(
      new THREE.Vector3(
        Math.cos(ang) * radial + (rnd() - 0.5) * 0.06,
        (rnd() - 0.5) * 0.18,
        Math.sin(ang) * radial + (rnd() - 0.5) * 0.06
      )
    );
  }

  return out;
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
