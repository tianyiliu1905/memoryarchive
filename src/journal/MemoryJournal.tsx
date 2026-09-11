import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '@/store/archive';
import { getProject } from '@/data/projects';
import { CLUSTERS } from '@/data/clusters';
import { ChapterPanel } from './ChapterPanel';
import './journal.css';

/**
 * 横向记忆日记。
 *
 * 锁定一屏高度，滚轮 / 拖拽被映射为横向位移。
 * 关键点：
 *   - 位移用惯性插值，不是直接跟手，保持「缓慢、有重量」的基调
 *   - 内容分层视差：背景最慢、图片略慢、注释略快
 *   - 滚到最左继续上滚 → 浮出水面，退回光斑群
 */

const FRICTION = 0.082; // 插值系数，越小越重
const WHEEL_SCALE = 1.18;
const EXIT_THRESHOLD = 150; // 在最左端继续反向滚动多少像素后退出

export function MemoryJournal() {
  const depth = useArchive((s) => s.depth);
  const activeProject = useArchive((s) => s.activeProject);
  const surface = useArchive((s) => s.surface);
  const reducedMotion = useArchive((s) => s.reducedMotion);
  const isTouch = useArchive((s) => s.isTouch);

  const project = getProject(activeProject);
  const accent = project ? CLUSTERS[project.cluster] : null;

  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const targetX = useRef(0);
  const currentX = useRef(0);
  const maxX = useRef(0);
  const overscroll = useRef(0);

  const [progress, setProgress] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);

  const active = depth === 'project' && !!project;

  /* ---------- 重置 ---------- */
  useEffect(() => {
    if (!active) return;
    targetX.current = 0;
    currentX.current = 0;
    overscroll.current = 0;
    setProgress(0);
    setChapterIdx(0);
  }, [active, activeProject]);

  /* ---------- 测量总宽度 ---------- */
  const measure = useCallback(() => {
    const track = trackRef.current;
    const vp = viewportRef.current;
    if (!track || !vp) return;
    maxX.current = Math.max(0, track.scrollWidth - vp.clientWidth);
  }, []);

  useEffect(() => {
    if (!active) return;
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    // 内容显影后宽度可能变化
    const t = setTimeout(measure, 700);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [active, measure, activeProject]);

  /* ---------- 输入：滚轮 ---------- */
  useEffect(() => {
    if (!active) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // 同时支持垂直滚轮和触控板横向手势
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const next = targetX.current + delta * WHEEL_SCALE;

      if (next < 0) {
        // 已在最左，继续反向 → 蓄积退出
        overscroll.current += -next;
        targetX.current = 0;
        if (overscroll.current > EXIT_THRESHOLD) {
          overscroll.current = 0;
          surface();
        }
      } else {
        overscroll.current = 0;
        targetX.current = Math.min(next, maxX.current);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [active, surface]);

  /* ---------- 输入：触摸拖拽 ---------- */
  useEffect(() => {
    if (!active) return;
    let startX = 0;
    let startTarget = 0;
    let dragging = false;

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startTarget = targetX.current;
      dragging = true;
    };
    const onMove = (e: TouchEvent) => {
      if (!dragging) return;
      const dx = startX - e.touches[0].clientX;
      const next = startTarget + dx * 1.35;
      if (next < 0) {
        overscroll.current = -next;
        targetX.current = 0;
        if (overscroll.current > EXIT_THRESHOLD * 1.3) {
          overscroll.current = 0;
          dragging = false;
          surface();
        }
      } else {
        overscroll.current = 0;
        targetX.current = Math.min(next, maxX.current);
      }
    };
    const onEnd = () => {
      dragging = false;
      overscroll.current = 0;
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [active, surface]);

  /* ---------- 输入：键盘 ---------- */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const step = window.innerWidth * 0.55;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        targetX.current = Math.min(targetX.current + step, maxX.current);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        targetX.current = Math.max(targetX.current - step, 0);
      } else if (e.key === 'Escape') {
        surface();
      } else if (e.key === 'Home') {
        targetX.current = 0;
      } else if (e.key === 'End') {
        targetX.current = maxX.current;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, surface]);

  /* ---------- 渲染循环：惯性 + 视差 ---------- */
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const chapterCount = project?.chapters.length ?? 1;

    const tick = () => {
      const friction = reducedMotion ? 1 : FRICTION;
      currentX.current += (targetX.current - currentX.current) * friction;

      const track = trackRef.current;
      if (track) {
        track.style.transform = `translate3d(${-currentX.current}px, 0, 0)`;

        // 分层视差
        const layers = track.querySelectorAll<HTMLElement>('[data-parallax]');
        layers.forEach((el) => {
          const rate = parseFloat(el.dataset.parallax || '0');
          el.style.transform = `translate3d(${currentX.current * rate}px, 0, 0)`;
        });
      }

      const p = maxX.current > 0 ? currentX.current / maxX.current : 0;
      setProgress(p);
      setChapterIdx(Math.min(chapterCount - 1, Math.round(p * (chapterCount - 1))));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reducedMotion, project]);

  if (!project || !accent) return null;

  const currentChapter = project.chapters[chapterIdx];

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="journal"
          initial={{ opacity: 0, filter: 'blur(22px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(16px)', transition: { duration: 0.6 } }}
          transition={{ duration: reducedMotion ? 0.3 : 1.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ ['--accent' as string]: accent.color, ['--accent-deep' as string]: accent.colorDeep }}
        >
          {/* ---- 背景：最慢的一层 ---- */}
          <div className="journal__bg" data-parallax="0.055">
            <span className="journal__bg-title">{project.title}</span>
          </div>

          {/* ---- 顶部档案条 ---- */}
          <motion.div
            className="journal__bar"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="journal__back" onClick={surface}>
              <span className="journal__back-arrow">←</span>
              <span>{isTouch ? '右滑退出' : 'Back to basin'}</span>
            </button>

            <div className="journal__meta">
              <span className="archive-tag">{project.archiveId}</span>
              <span className="journal__dot" style={{ background: accent.color }} />
              <span className="archive-tag">{CLUSTERS[project.cluster].label}</span>
            </div>

            <span className="archive-tag journal__chapter-tag">{currentChapter?.marker}</span>
          </motion.div>

          {/* ---- 横向轨道 ---- */}
          <div className="journal__viewport" ref={viewportRef}>
            <div className="journal__track" ref={trackRef}>
              {project.chapters.map((ch, i) => (
                <ChapterPanel
                  key={`${project.id}-${i}`}
                  chapter={ch}
                  project={project}
                  accent={accent}
                  index={i}
                  onExit={surface}
                />
              ))}
            </div>
          </div>

          {/* ---- 底部进度：胶片式 ---- */}
          <motion.div
            className="journal__progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.9 }}
          >
            <div className="journal__ticks">
              {project.chapters.map((ch, i) => (
                <span
                  key={i}
                  className={`journal__tick ${i === chapterIdx ? 'is-current' : ''}`}
                  style={i === chapterIdx ? { background: accent.color } : undefined}
                  title={ch.marker}
                />
              ))}
            </div>
            <div className="journal__rail">
              <div
                className="journal__rail-fill"
                style={{ transform: `scaleX(${progress})`, background: accent.color }}
              />
            </div>
            <span className="archive-tag journal__hint">
              {isTouch ? 'Swipe ←' : 'Scroll to read →'}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
