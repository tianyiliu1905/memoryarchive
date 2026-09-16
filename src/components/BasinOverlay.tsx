import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '@/store/archive';
import { CLUSTERS, CLUSTER_ORDER } from '@/data/clusters';
import { PROJECTS, PROJECTS_BY_CLUSTER, getProject } from '@/data/projects';
import './basin-overlay.css';

/** 与 store 中的 CLUSTER_SEQUENCE 保持一致：按盆中的水平位置排列 */
const SEQUENCE = ['green', 'yellow', 'purple'] as const;

/** 悬停足够久才浮现项目信息，避免扫过时闪烁 */
const HOVER_DWELL = 520;

interface Props {
  subscribe: (fn: (v: number) => void) => () => void;
  subscribePan: (fn: (v: number) => void) => () => void;
}

export function BasinOverlay({ subscribe, subscribePan }: Props) {
  const depth = useArchive((s) => s.depth);
  const awakened = useArchive((s) => s.awakened);
  const hoveredCluster = useArchive((s) => s.hoveredCluster);
  const focusedCluster = useArchive((s) => s.focusedCluster);
  const hoveredProject = useArchive((s) => s.hoveredProject);
  const isTouch = useArchive((s) => s.isTouch);
  const ascend = useArchive((s) => s.ascend);
  const focusCluster = useArchive((s) => s.focusCluster);
  const setHoveredProject = useArchive((s) => s.setHoveredProject);
  const diveInto = useArchive((s) => s.diveInto);

  const [charge, setCharge] = useState(0);
  const [pan, setPan] = useState(0);
  const [dwelled, setDwelled] = useState<string | null>(null);
  /** 用户是否已经有过下潜动作——一旦有，滚动指引就不再出现 */
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(
    () =>
      subscribe((v) => {
        setCharge(v);
        // 超过一个很小的阈值即认为「已经知道怎么操作了」
        if (Math.abs(v) > 0.06) setHasScrolled(true);
      }),
    [subscribe]
  );
  useEffect(() => subscribePan(setPan), [subscribePan]);

  // 悬停停留计时
  useEffect(() => {
    if (!hoveredProject) {
      setDwelled(null);
      return;
    }
    const t = setTimeout(() => setDwelled(hoveredProject), HOVER_DWELL);
    return () => clearTimeout(t);
  }, [hoveredProject]);

  const inBasin = depth === 'basin';
  const inCluster = depth === 'cluster' || depth === 'surfacing';
  const hidden = depth === 'diving' || depth === 'project';

  const activeCluster = inCluster ? focusedCluster : hoveredCluster;
  const clusterData = activeCluster ? CLUSTERS[activeCluster] : null;
  const dwelledProject = getProject(dwelled);

  return (
    <div className={`basin-overlay ${hidden ? 'is-hidden' : ''}`}>
      {/* ================= 中央标题 ================= */}
      <AnimatePresence>
        {inBasin && awakened && (
          <motion.header
            className="archive-title"
            initial={{ opacity: 0, y: 14, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.7 } }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          >
            <h1>
              ALIX’S MEMORY ARCHIVE
              {/* 装饰性横线：贴着文字右缘向外延伸并淡出。
                  放在 h1 内部，才能用 left:100% 锚到文字末尾而非整行行尾。 */}
              <span className="archive-title__rule" aria-hidden="true" />
            </h1>
            <p className="archive-sub">选择一段记忆，潜入</p>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ================= 首屏滚动指引 =================
          只在盆全景、且用户还没有过任何下潜动作时出现。 */}
      <AnimatePresence>
        {inBasin && awakened && !hasScrolled && (
          <motion.div
            className="scroll-cue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.5 } }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 2.4 }}
          >
            <span className="scroll-cue__label">
              {isTouch ? '上滑进入' : '滚动进入'}
            </span>
            {/* 横线 + 下垂线 + 菱形，构成一个向下的指引 */}
            <span className="scroll-cue__bar" aria-hidden="true" />
            <span className="scroll-cue__stem" aria-hidden="true" />
            <span className="scroll-cue__diamond" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 群标签（盆全景，悬停时） ================= */}
      <AnimatePresence mode="wait">
        {inBasin && clusterData && (
          <motion.div
            key={clusterData.id}
            className="cluster-label"
            /* 既然挪到了左侧，进出就该顺着这条边走：从左边淡入、
               再退回左边，而不是原来那样上下浮动。 */
            initial={{ opacity: 0, x: -12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -8, filter: 'blur(8px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 十字标记由伪元素绘制，这里只需给 color——两条笔画都取 currentColor */}
            <span className="cluster-dot" style={{ color: clusterData.color }} />
            <span className="cluster-name">{clusterData.title}</span>
            <span className="cluster-whisper serif-note">{clusterData.whisper}</span>
            <span className="cluster-count archive-tag">
              {PROJECTS_BY_CLUSTER[clusterData.id].length} memories
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 群近景：标题 + 项目索引 ================= */}
      <AnimatePresence>
        {inCluster && clusterData && (
          <motion.div
            className="cluster-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="cluster-view__head"
              initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <span className="eyebrow" style={{ color: clusterData.colorDeep }}>
                {clusterData.label} — Depth 02
              </span>
              <h2>{clusterData.title}</h2>
              <p className="serif-note">{clusterData.whisper}</p>
            </motion.div>

            <motion.ul
              className="mote-index"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.14, delayChildren: 0.5 } },
              }}
            >
              {PROJECTS_BY_CLUSTER[clusterData.id].map((p) => (
                <motion.li
                  key={p.id}
                  className={hoveredProject === p.id ? 'is-hot' : ''}
                  /* 反向联动：悬停文字也点亮对应光斑。
                     文字既然会跟着光斑变色，就该双向成立，
                     否则右侧这列看起来像个只读的图例。 */
                  onPointerEnter={() => setHoveredProject(p.id)}
                  onPointerLeave={() => setHoveredProject(null)}
                  /* 潜入动画从被点的那一行展开，而不是从屏幕中心，
                     所以 origin 取这一项自身的位置 */
                  onClick={(e) => {
                    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    diveInto(p.id, clusterData.color, [
                      (r.left + r.width / 2) / window.innerWidth,
                      (r.top + r.height / 2) / window.innerHeight,
                    ]);
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 12, filter: 'blur(8px)' },
                    show: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="archive-tag">{p.archiveId}</span>
                  <span className="mote-index__title">{p.title}</span>
                  <span className="mote-index__year">{p.year}</span>
                </motion.li>
              ))}
            </motion.ul>

            <button className="ascend-btn" onClick={ascend}>
              <span className="ascend-btn__arrow">↑</span>
              <span>{isTouch ? '向下拖拽返回记忆盆' : '向上滚动返回记忆盆'}</span>
            </button>

            {/* ---- 分类导航：显示当前位置与左右邻居 ---- */}
            <div
              className="strata-nav"
              style={{ transform: `translateX(calc(-50% + ${-pan * 26}px))` }}
            >
              {SEQUENCE.map((id) => {
                const c = CLUSTERS[id];
                const isCurrent = id === clusterData.id;
                return (
                  <button
                    key={id}
                    className={`strata-nav__item ${isCurrent ? 'is-current' : ''}`}
                    onClick={() => focusCluster(id)}
                    aria-label={c.title}
                  >
                    <span
                      className="strata-nav__dot"
                      style={{
                        background: c.color,
                        color: c.color,
                        opacity: isCurrent ? 1 : 0.28,
                      }}
                    />
                    <span className="strata-nav__name">{c.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="strata-hint archive-tag">
              {isTouch ? '← 左右滑动切换记忆层 →' : '← 拖拽切换记忆层 →'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 悬停停留后的项目浮层 ================= */}
      <AnimatePresence>
        {dwelledProject && inCluster && (
          <motion.div
            className="mote-tooltip"
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(8px)', transition: { duration: 0.45 } }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="mote-tooltip__id archive-tag"
              style={{ color: CLUSTERS[dwelledProject.cluster].colorDeep }}
            >
              {dwelledProject.archiveId} · {dwelledProject.year}
            </span>
            <h3>{dwelledProject.title}</h3>
            <p>{dwelledProject.summary}</p>
            <span className="mote-tooltip__cue eyebrow">
              {isTouch ? 'Tap to enter' : 'Click to enter — or keep scrolling'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 下潜蓄力指示 ================= */}
      <AnimatePresence>
        {awakened && !hidden && (
          <motion.div
            className="dive-meter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, delay: 1.2 }}
          >
            <div className="dive-meter__track">
              <div
                className="dive-meter__fill"
                style={{
                  transform: `scaleY(${Math.abs(charge)})`,
                  transformOrigin: charge >= 0 ? 'top' : 'bottom',
                  background: clusterData?.color ?? 'var(--ink-faint)',
                }}
              />
            </div>
            <span className="dive-meter__label archive-tag">
              {charge < -0.04
                ? 'Surfacing'
                : charge > 0.04
                  ? inBasin
                    ? 'Approaching'
                    : 'Descending'
                  : inBasin
                    ? isTouch
                      ? 'Drag up to descend'
                      : 'Scroll to descend'
                    : 'Depth 02'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 角落档案信息 ================= */}
      <AnimatePresence>
        {awakened && !hidden && (
          <motion.div
            className="basin-corners"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, delay: 1.6 }}
          >
            <span className="corner corner--tl archive-tag">
              Pensieve Index / {new Date().getFullYear()}
            </span>
            <span className="corner corner--tr archive-tag">
              {inBasin ? 'Depth 01 — Surface' : 'Depth 02 — Immersed'}
            </span>
            <span className="corner corner--bl archive-tag">
              {PROJECTS.length} memories · {CLUSTER_ORDER.length} strata
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
