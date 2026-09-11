import { useEffect, useRef } from 'react';

export interface PointerState {
  /** 归一化到 -1 ~ 1 的即时位置 */
  x: number;
  y: number;
  /** 带惯性的平滑位置 */
  sx: number;
  sy: number;
  /** 屏幕像素坐标 */
  px: number;
  py: number;
  /** 移动速度，用于水波扰动强度 */
  speed: number;
  /** 指针是否在窗口内 */
  inside: boolean;
}

/**
 * 全局指针追踪，带惯性平滑。
 * 用 ref 而非 state，避免每帧重渲染整棵树。
 */
export function usePointer() {
  const pointer = useRef<PointerState>({
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
    px: 0,
    py: 0,
    speed: 0,
    inside: false,
  });

  useEffect(() => {
    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    const onMove = (e: PointerEvent) => {
      const p = pointer.current;
      p.px = e.clientX;
      p.py = e.clientY;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = -((e.clientY / window.innerHeight) * 2 - 1);
      p.inside = true;
    };

    const onLeave = () => {
      pointer.current.inside = false;
    };

    const tick = () => {
      const p = pointer.current;
      // 惯性平滑
      p.sx += (p.x - p.sx) * 0.055;
      p.sy += (p.y - p.sy) * 0.055;

      const dx = p.sx - lastX;
      const dy = p.sy - lastY;
      const v = Math.sqrt(dx * dx + dy * dy);
      p.speed += (v * 22 - p.speed) * 0.1;
      lastX = p.sx;
      lastY = p.sy;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return pointer;
}
