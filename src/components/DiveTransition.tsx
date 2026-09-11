import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '@/store/archive';
import './dive-transition.css';

/**
 * 潜入记忆 / 浮出水面的转场。
 *
 * 不是路由切换，是「被吸入一段记忆」：
 *   1. 光斑从点击点急速膨胀至全屏（液体在镜头前炸开）
 *   2. 一道白光过曝
 *   3. 粒子被拉成方向性的拖影
 *   4. 项目主色从光斑色中析出，渗进纸面
 *   5. 详情页第一帧从模糊中显影
 */

const DIVE_MS = 1350;
const SURFACE_MS = 1000;

export function DiveTransition() {
  const depth = useArchive((s) => s.depth);
  const color = useArchive((s) => s.transitionColor);
  const origin = useArchive((s) => s.transitionOrigin);
  const enterProject = useArchive((s) => s.enterProject);
  const ascend = useArchive((s) => s.ascend);
  const reducedMotion = useArchive((s) => s.reducedMotion);

  const diving = depth === 'diving';
  const surfacing = depth === 'surfacing';

  // 潜入完成 → 进入项目
  useEffect(() => {
    if (!diving) return;
    const t = setTimeout(enterProject, reducedMotion ? 300 : DIVE_MS);
    return () => clearTimeout(t);
  }, [diving, enterProject, reducedMotion]);

  // 浮出完成 → 回到群层级
  useEffect(() => {
    if (!surfacing) return;
    const t = setTimeout(ascend, reducedMotion ? 260 : SURFACE_MS);
    return () => clearTimeout(t);
  }, [surfacing, ascend, reducedMotion]);

  // 拖影粒子：从中心向外放射，制造方向感
  const streaks = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const angle = (i / 26) * Math.PI * 2 + (i % 3) * 0.3;
        const dist = 34 + ((i * 37) % 46);
        return {
          id: i,
          angle,
          dist,
          delay: (i % 7) * 0.026,
          len: 40 + ((i * 53) % 130),
          thin: 0.6 + ((i * 17) % 10) / 9,
        };
      }),
    []
  );

  const ox = `${origin[0] * 100}%`;
  const oy = `${origin[1] * 100}%`;

  return (
    <AnimatePresence>
      {(diving || surfacing) && (
        <motion.div
          className="dive"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ ['--dive-color' as string]: color }}
        >
          {/* ---- 1. 膨胀的液滴 ---- */}
          <motion.div
            className="dive__blob"
            style={{ left: ox, top: oy, background: color }}
            initial={
              diving
                ? { scale: 0.02, opacity: 0.9, filter: 'blur(6px)' }
                : { scale: 26, opacity: 0.5, filter: 'blur(60px)' }
            }
            animate={
              diving
                ? { scale: 34, opacity: [0.9, 0.85, 0.4], filter: 'blur(70px)' }
                : { scale: 0.05, opacity: 0, filter: 'blur(10px)' }
            }
            transition={{
              duration: reducedMotion ? 0.3 : diving ? 1.15 : 0.9,
              ease: diving ? [0.72, 0, 0.24, 1] : [0.16, 1, 0.3, 1],
            }}
          />

          {/* ---- 2. 白光过曝 ---- */}
          <motion.div
            className="dive__flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: diving ? [0, 0, 0.92, 0.7] : [0.4, 0] }}
            transition={{
              duration: reducedMotion ? 0.25 : diving ? 1.3 : 0.75,
              times: diving ? [0, 0.42, 0.66, 1] : [0, 1],
              ease: 'easeInOut',
            }}
          />

          {/* ---- 3. 粒子拖影 ---- */}
          {!reducedMotion &&
            diving &&
            streaks.map((s) => (
              <motion.span
                key={s.id}
                className="dive__streak"
                style={{
                  left: ox,
                  top: oy,
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                  height: `${s.thin}px`,
                  rotate: `${(s.angle * 180) / Math.PI}deg`,
                }}
                initial={{ width: 0, opacity: 0, x: 0 }}
                animate={{
                  width: [0, s.len, s.len * 0.4],
                  opacity: [0, 0.85, 0],
                  x: [0, s.dist * 7, s.dist * 15],
                }}
                transition={{
                  duration: 1.0,
                  delay: s.delay,
                  ease: [0.3, 0, 0.2, 1],
                }}
              />
            ))}

          {/* ---- 4. 色彩渗透 ---- */}
          <motion.div
            className="dive__bleed"
            initial={{ opacity: 0 }}
            animate={{ opacity: diving ? [0, 0.28, 0] : [0.2, 0] }}
            transition={{ duration: reducedMotion ? 0.25 : 1.2, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(circle at ${ox} ${oy}, ${color}, transparent 62%)`,
            }}
          />

          {/* ---- 5. 档案编号闪现 ---- */}
          {diving && !reducedMotion && (
            <motion.span
              className="dive__marker archive-tag"
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: [0, 0.7, 0], letterSpacing: '0.2em' }}
              transition={{ duration: 1.2, times: [0, 0.5, 1] }}
            >
              entering memory
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
