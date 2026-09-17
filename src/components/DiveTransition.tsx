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
            /* 潜入时把前半段的不透明度压得很低，给网让路。

               液滴是一团满屏的实色，只要浓到 0.8，网上那层
               淡淡的色彩流动就完全看不见了——等于白画。

               所以它的抬升必须等颜色波演完。DiveNetwork 里
               COLOR_MS 是 640ms、整张网 720ms 退场；这里的
               第二个关键帧放在 0.62（≈713ms），正好接在
               网淡出的那一刻把屏幕接过来。

               起手的 0.18 也比以前低：它现在只是网背后一层
               极淡的底，不再参与前半段的叙事。 */
            animate={
              diving
                ? { scale: 34, opacity: [0.18, 0.82, 0.4], filter: 'blur(70px)' }
                : { scale: 0.05, opacity: 0, filter: 'blur(10px)' }
            }
            transition={{
              duration: reducedMotion ? 0.3 : diving ? 1.15 : 0.9,
              // 0.62 处约合 713ms，正好接在颜色波扫完、网退场的那一刻
              times: diving ? [0, 0.62, 1] : undefined,
              ease: diving ? [0.72, 0, 0.24, 1] : [0.16, 1, 0.3, 1],
            }}
          />

          {/* ---- 2. 白光过曝 ----

               起点从 0.42 推到 0.5（546ms → 650ms）。

               颜色波在 640ms 扫完，白光原来 546ms 就开始抬亮，
               会在波冲向屏幕边缘的最后一百毫秒里把它洗掉——
               那恰恰是「颜色越过边界」最该被看见的一刻。
               峰值仍留在 0.66，总时长不变，只是让出这一小段。 */}
          <motion.div
            className="dive__flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: diving ? [0, 0, 0.92, 0.7] : [0.4, 0] }}
            transition={{
              duration: reducedMotion ? 0.25 : diving ? 1.3 : 0.75,
              times: diving ? [0, 0.5, 0.66, 1] : [0, 1],
              ease: 'easeInOut',
            }}
          />

          {/* ---- 3. 网状生长 ----
               只在潜入时出现。浮出是「退回去」，再长一张网
               会把两个方向的叙事混在一起。 */}
          {diving && (
            <DiveNetwork color={color} origin={origin} reducedMotion={reducedMotion} />
          )}

          {/* ---- 4. 色彩渗透 ----

               一层以起点为圆心的 multiply 渐变。潜入时的峰值往后挪
               （times 第二段 0.62）：它把颜色叠在正中心，而网的叙事
               恰恰是中心要褪成中性色。两者同时发生就相互抵消了，
               所以让它等颜色波走完再上来。 */}
          <motion.div
            className="dive__bleed"
            initial={{ opacity: 0 }}
            animate={{ opacity: diving ? [0, 0.28, 0] : [0.2, 0] }}
            transition={{
              duration: reducedMotion ? 0.25 : 1.2,
              times: diving ? [0, 0.62, 1] : undefined,
              ease: 'easeInOut',
            }}
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
