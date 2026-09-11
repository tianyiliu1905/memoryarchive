import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useArchive } from '@/store/archive';
import { CLUSTERS } from '@/data/clusters';
import { clusterAnchor } from './layout';
import type { PointerState } from '@/hooks/usePointer';

interface Props {
  pointer: React.MutableRefObject<PointerState>;
  diveCharge: React.MutableRefObject<number>;
  /** 横向平移蓄力 -1~1，用于拖拽时的跟手反馈 */
  panAmount: React.MutableRefObject<number>;
}

/**
 * 相机运镜。
 *
 * basin   : 高空俯视整个盆，指针带来极微弱视差
 * cluster : 平滑推进到被聚焦的光斑群上方，视角略微下压
 * diving  : 急速贴近，配合转场的白光
 *
 * 所有插值都用帧率无关的指数衰减，且刻意偏慢——
 * 相机移动本身就是叙事的一部分。
 */
export function CameraRig({ pointer, diveCharge, panAmount }: Props) {
  const { camera } = useThree();
  const depth = useArchive((s) => s.depth);
  const focusedCluster = useArchive((s) => s.focusedCluster);
  const reducedMotion = useArchive((s) => s.reducedMotion);

  const target = useRef(new THREE.Vector3(0, 0, 0));
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  const current = useRef(new THREE.Vector3(0, 9.2, 0.001));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const lerp = (rate: number) => 1 - Math.exp(-rate * d);

    // ---- 计算目标位姿 ----
    let tx = 0;
    let ty = 9.2;
    let tz = 0.001;
    let lx = 0;
    let lz = 0;
    let speed = 1.35;

    if (depth === 'cluster' || depth === 'surfacing') {
      if (focusedCluster) {
        const a = clusterAnchor(CLUSTERS[focusedCluster]);
        tx = a.x * 0.86;
        tz = a.z * 0.86 + 1.95;
        ty = 4.3;
        lx = a.x;
        lz = a.z;
        speed = 1.15;
      }
    } else if (depth === 'diving') {
      if (focusedCluster) {
        const a = clusterAnchor(CLUSTERS[focusedCluster]);
        tx = a.x * 0.96;
        tz = a.z * 0.96 + 0.42;
        ty = 1.15;
        lx = a.x;
        lz = a.z;
        speed = 2.9;
      }
    }

    // ---- 下潜蓄力：相机提前微微前倾，形成「即将坠入」的张力 ----
    const charge = diveCharge.current;
    if (charge > 0 && (depth === 'basin' || depth === 'cluster')) {
      ty -= charge * (depth === 'basin' ? 1.5 : 0.72);
      tz -= charge * 0.18;
    } else if (charge < 0 && depth !== 'basin') {
      ty += -charge * 0.9;
    }

    // ---- 横向拖拽：相机跟手偏移，松手未达阈值则弹回 ----
    // 这是拖拽手感的关键：画面必须实时响应，而不是等达阈值后才突变。
    if ((depth === 'cluster' || depth === 'surfacing') && !reducedMotion) {
      const pan = panAmount.current;
      if (Math.abs(pan) > 0.001) {
        // 水平偏移：拖动方向与画面移动方向一致
        tx -= pan * 1.55;
        lx -= pan * 1.15;
        // 轻微抬升，像在液面上滑行
        ty += Math.abs(pan) * 0.32;
      }
    }

    /* ---- 指针视差 ----
       只在群近景下保留，且只平移相机、不动注视点。

       之所以不再改 lookAt：相机位置与注视点同时跟随指针时，
       视线方向会绕着盆心摆动，观感就是「整个盆跟着鼠标转」。
       纯平移只产生轻微的视差位移，空间感还在，但盆是静止的。

       盆全景（basin）下完全关闭——那是俯视构图，任何摆动都会
       被读作旋转。 */
    if (!reducedMotion && depth !== 'basin') {
      const amt = 0.14;
      tx += pointer.current.sx * amt;
      tz += -pointer.current.sy * amt * 0.72;
    }

    target.current.set(tx, ty, tz);
    lookAt.current.set(lx, 0, lz);

    const k = lerp(speed);
    current.current.lerp(target.current, k);
    currentLook.current.lerp(lookAt.current, k);

    camera.position.copy(current.current);
    camera.lookAt(currentLook.current);
  });

  return null;
}
