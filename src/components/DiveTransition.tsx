import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '@/store/archive';
import { DiveNetwork } from './DiveNetwork';
import './dive-transition.css';

/**
 * 潜入记忆 / 浮出水面的转场。
 *
 * 不是路由切换，是「被吸入一段记忆」：
 *   1. 一张网状结构从点击处迸开，瞬间蔓延至全屏
 *   2. 光斑跟着膨胀，颜色满上来
 *   3. 一道白光过曝
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
            /* 潜入时把前半段的不透明度压下来，给网让路。

               网只用 400ms 就铺满全屏，而液滴要 1.15s 才炸开。
               液滴若一上来就是 0.9，网还在生长的那段时间里
               已经被一团实色盖住了，等于白画。压到 0.35 之后
               它退成网背后的一层底色，等网长完再涨上来接手。 */
            animate={
              diving
                ? { scale: 34, opacity: [0.35, 0.8, 0.4], filter: 'blur(70px)' }
                : { scale: 0.05, opacity: 0, filter: 'blur(10px)' }
            }
            transition={{
              duration: reducedMotion ? 0.3 : diving ? 1.15 : 0.9,
              // 0.35 处约合 400ms，正好接在网铺满的那一刻
              times: diving ? [0, 0.35, 1] : undefined,
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

          {/* ---- 3. 网状生长 ----
               只在潜入时出现。浮出是「退回去」，再长一张网
               会把两个方向的叙事混在一起。 */}
          {diving && (
            <DiveNetwork color={color} origin={origin} reducedMotion={reducedMotion} />
          )}

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
              正在进入这段记忆
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
