import { useEffect, useRef } from 'react';
import { useArchive } from '@/store/archive';
import { CLUSTERS } from '@/data/clusters';
import type { PointerState } from '@/hooks/usePointer';
import './memory-cursor.css';

/**
 * 自定义光标：一个跟随的柔焦光点 + 滞后的外环。
 * 悬停可进入的记忆时，外环收紧并染上该记忆的颜色。
 */
export function MemoryCursor({ pointer }: { pointer: React.MutableRefObject<PointerState> }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isTouch = useArchive((s) => s.isTouch);
  const hoveredCluster = useArchive((s) => s.hoveredCluster);
  const hoveredProject = useArchive((s) => s.hoveredProject);
  const focusedCluster = useArchive((s) => s.focusedCluster);
  const depth = useArchive((s) => s.depth);

  const activeColor = (() => {
    if (hoveredProject && focusedCluster) return CLUSTERS[focusedCluster].color;
    if (hoveredCluster && depth === 'basin') return CLUSTERS[hoveredCluster].color;
    return null;
  })();

  useEffect(() => {
    if (isTouch) return;
    let raf = 0;
    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;

    const tick = () => {
      const p = pointer.current;
      // 外环带明显滞后，形成液体中的拖影
      rx += (p.px - rx) * 0.12;
      ry += (p.py - ry) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.px}px, ${p.py}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pointer, isTouch]);

  if (isTouch) return null;

  return (
    <div className={`memory-cursor ${activeColor ? 'is-active' : ''}`}>
      <div
        ref={ringRef}
        className="memory-cursor__ring"
        style={activeColor ? { borderColor: activeColor, color: activeColor } : undefined}
      />
      <div
        ref={dotRef}
        className="memory-cursor__dot"
        style={activeColor ? { background: activeColor } : undefined}
      />
    </div>
  );
}
