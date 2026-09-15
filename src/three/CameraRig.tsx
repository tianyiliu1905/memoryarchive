import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useArchive } from '@/store/archive';
import { CLUSTERS } from '@/data/clusters';
import { clusterAnchor } from './layout';
import type { PointerState } from '@/hooks/usePointer';

/** 世界竖直方向。仅在视线离开垂直区间后才用它校正取向 */
const WORLD_UP = new THREE.Vector3(0, 1, 0);

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
  const current = useRef(new THREE.Vector3(0, 9.2, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  /* 相机自身的「上」方向。盆全景是垂直俯视，世界竖直方向在那里是退化的，
     所以这里不用默认的 (0,1,0)，而是盆平面内的 -Z——它与垂直视线始终正交。 */
  const up = useRef(new THREE.Vector3(0, 0, -1));

  // 首帧之前就摆正，避免第一帧用默认 up 渲染出一帧错误取向
  useLayoutEffect(() => {
    camera.up.copy(up.current);
  }, [camera]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const lerp = (rate: number) => 1 - Math.exp(-rate * d);

    // ---- 计算目标位姿 ----
    let tx = 0;
    let ty = 9.2;
    let tz = 0;
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

    /* ---- 取向：沿视线平行移动 up，而不是每帧从世界竖直方向重新求解 ----

       盆全景下视线几乎正对着 -Y，与默认 up (0,1,0) 近乎平行。
       此时 lookAt 内部的叉乘接近奇异：水平分量哪怕只是从 +0.001
       变到 -0.001（下潜蓄力会把 tz 往负方向推），求出的右向量就会
       整个翻号，画面瞬间横滚 180°。

       解法是自己维护 up：把上一帧的 up 投影到新视线的垂直平面上，
       取向便随相机连续变化，不存在可翻转的分支。 */
    const view = currentLook.current.clone().sub(current.current);
    const len = view.length();
    if (len > 1e-6) {
      view.divideScalar(len);

      // 去掉 up 在视线方向上的分量，得到正交且与上一帧最接近的新 up
      const next = up.current.clone().addScaledVector(view, -up.current.dot(view));
      if (next.lengthSq() > 1e-8) {
        up.current.copy(next.normalize());
      }

      /* 平行移动是增量式的，长时间来回会累积极缓慢的旋转漂移。
         一旦视线离开近乎垂直的区间（俯角够小，世界竖直方向重新可靠），
         就轻轻把 up 拉回由世界竖直方向解出的标准取向，保证地平线是平的。 */
      const horiz = Math.hypot(view.x, view.z);
      const settle = THREE.MathUtils.smoothstep(horiz, 0.25, 0.6);
      if (settle > 0) {
        const canonical = WORLD_UP.clone().addScaledVector(view, -WORLD_UP.dot(view));
        if (canonical.lengthSq() > 1e-8) {
          up.current.lerp(canonical.normalize(), settle * lerp(2.2)).normalize();
        }
      }

      camera.up.copy(up.current);
    }

    camera.lookAt(currentLook.current);
  });

  return null;
}
