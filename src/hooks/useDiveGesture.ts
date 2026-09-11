import { useEffect, useRef } from 'react';
import { useArchive } from '@/store/archive';
import { CLUSTERS, CLUSTER_ORDER } from '@/data/clusters';
import { PROJECTS_BY_CLUSTER } from '@/data/projects';

/**
 * 把滚轮 / 触摸拖拽解释成「潜入意图」。
 *
 * 设计要点：
 * 1. 滚轮不是连续滚动，而是累积成一个 0~1 的「下潜蓄力值」；
 *    到达 1 时触发一次层级跃迁，然后清零。这避免了一次滚动误穿两层。
 * 2. 蓄力值不满时会缓慢回落，形成「阻尼感」——你必须有意识地持续下潜。
 * 3. 聚焦对象由指针悬停决定；若没有悬停任何群，下潜会指向盆中央最近的一组。
 * 4. 在群近景（cluster），横向拖拽会平移到相邻分类，与纵向的下潜互不干扰。
 */

const CHARGE_PER_WHEEL = 0.0072; // 每像素 deltaY 贡献的蓄力
const DECAY = 0.955; // 每帧回落
const COOLDOWN = 900; // 跃迁后的冷却，ms

/** 横向平移相关 */
const AXIS_LOCK = 9; // 超过这个位移才判定手势主轴，px
const PAN_TOUCH_DIST = 150; // 触摸：拖多远算一次切换
const PAN_DRAG_DIST = 260; // 鼠标：拖多远算一次切换
const PAN_WHEEL = 0.0042; // 触控板每像素 deltaX 的贡献
const PAN_DECAY = 0.9; // 横向蓄力的回落（比纵向略快，手感更轻）

export function useDiveGesture() {
  const chargeRef = useRef(0);
  const panRef = useRef(0);
  const lockRef = useRef(0);
  const listenersRef = useRef<Set<(v: number) => void>>(new Set());
  const panListenersRef = useRef<Set<(v: number) => void>>(new Set());
  /** 返回本次指针交互是否已构成拖拽 */
  const dragGuardRef = useRef<() => boolean>(() => false);

  useEffect(() => {
    let raf = 0;

    const notify = () => {
      const v = chargeRef.current;
      listenersRef.current.forEach((fn) => fn(v));
    };

    const notifyPan = () => {
      const v = panRef.current;
      panListenersRef.current.forEach((fn) => fn(v));
    };

    const transitionDown = () => {
      const s = useArchive.getState();
      const now = performance.now();
      if (now < lockRef.current) return;

      if (s.depth === 'basin') {
        // 选择聚焦目标：优先悬停的群，否则默认第一组
        const target = s.hoveredCluster ?? CLUSTER_ORDER[0];
        s.focusCluster(target);
        lockRef.current = now + COOLDOWN;
      } else if (s.depth === 'cluster') {
        // 进入项目：优先悬停的光斑，否则该群中最显著的一个
        const cid = s.focusedCluster;
        if (!cid) return;
        const list = PROJECTS_BY_CLUSTER[cid];
        const pid =
          s.hoveredProject && list.some((p) => p.id === s.hoveredProject)
            ? s.hoveredProject
            : [...list].sort((a, b) => b.scale - a.scale)[0]?.id;
        if (!pid) return;
        s.diveInto(pid, CLUSTERS[cid].color, [0.5, 0.5]);
        lockRef.current = now + COOLDOWN + 600;
      }
      chargeRef.current = 0;
    };

    const transitionUp = () => {
      const s = useArchive.getState();
      const now = performance.now();
      if (now < lockRef.current) return;
      if (s.depth === 'basin') return;
      s.ascend();
      lockRef.current = now + COOLDOWN;
      chargeRef.current = 0;
    };

    const onWheel = (e: WheelEvent) => {
      const s = useArchive.getState();
      // 项目详情页有自己的横向滚动逻辑，这里只处理「回到顶部时继续上滚 = 退出」
      if (s.depth === 'project' || s.depth === 'diving' || s.depth === 'surfacing') return;

      e.preventDefault();
      const delta = e.deltaY;

      if (delta > 0) {
        chargeRef.current = Math.min(1, chargeRef.current + delta * CHARGE_PER_WHEEL);
        if (chargeRef.current >= 1) transitionDown();
      } else if (delta < 0) {
        chargeRef.current = Math.max(-1, chargeRef.current + delta * CHARGE_PER_WHEEL);
        if (chargeRef.current <= -1) transitionUp();
      }
      notify();
    };

    /* ==================== 横向平移：在分类之间移动 ==================== */

    const panTo = (dir: -1 | 1) => {
      const s = useArchive.getState();
      const now = performance.now();
      if (now < lockRef.current) return;
      if (s.depth !== 'cluster') return;
      s.panToCluster(dir);
      lockRef.current = now + COOLDOWN;
      panRef.current = 0;
      notifyPan();
    };

    /* ==================== 触摸 ==================== */

    let touchStartX = 0;
    let touchStartY = 0;
    let touching = false;
    /** 手势主轴一旦判定就锁定，避免斜向拖拽同时触发两种行为 */
    let axis: 'none' | 'x' | 'y' = 'none';

    const onTouchStart = (e: TouchEvent) => {
      const s = useArchive.getState();
      if (s.depth === 'project' || s.depth === 'diving') return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touching = true;
      axis = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touching) return;
      const s = useArchive.getState();
      if (s.depth === 'project' || s.depth === 'diving') return;

      const dx = e.touches[0].clientX - touchStartX;
      const dy = touchStartY - e.touches[0].clientY;

      // 判定主轴：先动得多的方向说了算
      if (axis === 'none') {
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        if (ax > AXIS_LOCK || ay > AXIS_LOCK) {
          // 只有在群近景才允许横向切换；盆全景的横向拖拽无意义
          axis = ax > ay * 1.15 && s.depth === 'cluster' ? 'x' : 'y';
        }
      }

      if (axis === 'x') {
        panRef.current = Math.max(-1, Math.min(1, dx / PAN_TOUCH_DIST));
        if (panRef.current >= 1) {
          panTo(-1); // 向右拖 = 把左边的内容拉过来
          touching = false;
        } else if (panRef.current <= -1) {
          panTo(1);
          touching = false;
        }
        notifyPan();
        return;
      }

      if (axis === 'y') {
        chargeRef.current = Math.max(-1, Math.min(1, dy * 0.0055));
        if (chargeRef.current >= 1) {
          transitionDown();
          touching = false;
        } else if (chargeRef.current <= -1) {
          transitionUp();
          touching = false;
        }
        notify();
      }
    };

    const onTouchEnd = () => {
      touching = false;
      axis = 'none';
      panRef.current = 0;
      notifyPan();
    };

    /* ==================== 鼠标拖拽（桌面端） ==================== */

    let dragging = false;
    let dragStartX = 0;
    let dragMoved = false;

    const onPointerDown = (e: PointerEvent) => {
      const s = useArchive.getState();
      if (s.depth !== 'cluster') return;
      if (e.button !== 0) return;
      // 忽略落在 UI 控件上的按下
      if ((e.target as HTMLElement)?.closest?.('button, a')) return;
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const s = useArchive.getState();
      if (s.depth !== 'cluster') {
        dragging = false;
        return;
      }

      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > AXIS_LOCK) dragMoved = true;

      panRef.current = Math.max(-1, Math.min(1, dx / PAN_DRAG_DIST));
      if (panRef.current >= 1) {
        panTo(-1);
        dragging = false;
      } else if (panRef.current <= -1) {
        panTo(1);
        dragging = false;
      }
      notifyPan();
    };

    const onPointerUp = () => {
      dragging = false;
      // 没达到阈值就松手：弹回
      panRef.current = 0;
      notifyPan();
    };

    /** 供外部判断「这次点击是否其实是一次拖拽」，避免误触发潜入 */
    dragGuardRef.current = () => dragMoved;

    /* ==================== 触控板横向滚动 ==================== */

    const onWheelPan = (e: WheelEvent) => {
      const s = useArchive.getState();
      if (s.depth !== 'cluster') return;
      // 只在横向分量明显占优时才当作平移
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return;

      e.preventDefault();
      panRef.current = Math.max(-1, Math.min(1, panRef.current - e.deltaX * PAN_WHEEL));
      if (panRef.current >= 1) panTo(-1);
      else if (panRef.current <= -1) panTo(1);
      notifyPan();
    };

    // ---- 键盘：可达性 ----
    const onKey = (e: KeyboardEvent) => {
      const s = useArchive.getState();
      if (e.key === 'Escape') {
        if (s.depth !== 'basin') transitionUp();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (s.depth === 'basin' || s.depth === 'cluster') {
          e.preventDefault();
          transitionDown();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (s.depth === 'cluster') {
          e.preventDefault();
          transitionUp();
        }
      } else if (e.key === 'ArrowLeft') {
        if (s.depth === 'cluster') {
          e.preventDefault();
          panTo(-1);
        }
      } else if (e.key === 'ArrowRight') {
        if (s.depth === 'cluster') {
          e.preventDefault();
          panTo(1);
        }
      }
    };

    const tick = () => {
      if (Math.abs(chargeRef.current) > 0.001) {
        chargeRef.current *= DECAY;
        notify();
      }
      // 横向蓄力在未达阈值时回落，形成「弹回」手感
      if (!dragging && !touching && Math.abs(panRef.current) > 0.001) {
        panRef.current *= PAN_DECAY;
        notifyPan();
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('wheel', onWheelPan, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('wheel', onWheelPan);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, []);

  /** 供 UI 订阅蓄力值，用于绘制下潜进度指示 */
  const subscribe = (fn: (v: number) => void) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  };

  /** 供 UI 订阅横向平移量，用于绘制分类切换的牵引反馈 */
  const subscribePan = (fn: (v: number) => void) => {
    panListenersRef.current.add(fn);
    return () => {
      panListenersRef.current.delete(fn);
    };
  };

  return { chargeRef, panRef, subscribe, subscribePan, dragGuardRef };
}
