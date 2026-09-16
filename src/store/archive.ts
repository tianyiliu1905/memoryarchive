import { create } from 'zustand';
import type { ClusterId } from '@/data/types';

/**
 * 层级导航状态机
 *
 *   basin  ——(向下滚 / 悬停某群后下潜)——>  cluster
 *   cluster ——(向下滚 / 点击光斑)——>  diving ——>  project
 *   project ——(向上滚 / 返回)——>  cluster ——(向上滚)——>  basin
 *
 * 关键设计：滚轮永远作用于「当前聚焦对象」，而聚焦对象由指针悬停决定。
 * 这样用户始终知道自己将要潜入什么。
 */
export type Depth = 'basin' | 'cluster' | 'diving' | 'project' | 'surfacing';

interface ArchiveState {
  depth: Depth;

  /** 当前被指针悬停 / 已聚焦的光斑群 */
  hoveredCluster: ClusterId | null;
  focusedCluster: ClusterId | null;

  /** 当前被悬停的项目光斑 */
  hoveredProject: string | null;
  /** 正在潜入 / 已进入的项目 */
  activeProject: string | null;

  /** 转场用的色彩，来自被点击的光斑 */
  transitionColor: string;
  /** 转场爆开的屏幕坐标，归一化 0~1 */
  transitionOrigin: [number, number];

  /** 首次进入的显影是否完成 */
  awakened: boolean;
  /** 动效降级 */
  reducedMotion: boolean;
  /** 是否为触屏 */
  isTouch: boolean;

  setHoveredCluster: (id: ClusterId | null) => void;
  setHoveredProject: (id: string | null) => void;
  focusCluster: (id: ClusterId) => void;
  diveInto: (projectId: string, color: string, origin: [number, number]) => void;
  enterProject: () => void;
  surface: () => void;
  ascend: () => void;
  /** 在当前深度横向切换光斑群，-1 向左 / +1 向右 */
  panToCluster: (dir: -1 | 1) => void;
  awaken: () => void;
  setReducedMotion: (v: boolean) => void;
  setIsTouch: (v: boolean) => void;
}

/**
 * 光斑群的空间顺序。
 * 按它们在盆中的水平位置排列，确保「向右拖」对应的确实是右边那一组。
 */
const CLUSTER_SEQUENCE: ClusterId[] = ['green', 'yellow', 'purple'];

/** 调试用：记录层级跃迁轨迹，仅在开发模式下启用 */
const trace = (from: Depth, to: string, reason: string) => {
  if (!import.meta.env.DEV) return;
  const w = window as unknown as { __depthTrace?: string[] };
  w.__depthTrace = w.__depthTrace ?? [];
  w.__depthTrace.push(`${from}->${to} (${reason}) @${Math.round(performance.now())}`);
};

export const useArchive = create<ArchiveState>((set, get) => ({
  depth: 'basin',
  hoveredCluster: null,
  focusedCluster: null,
  hoveredProject: null,
  activeProject: null,
  transitionColor: '#b07cff',
  transitionOrigin: [0.5, 0.5],
  awakened: false,
  reducedMotion: false,
  isTouch: false,

  setHoveredCluster: (id) => {
    // 只有在盆的全景层级，悬停才会改变聚焦候选
    if (get().depth !== 'basin') return;
    if (get().hoveredCluster === id) return;
    set({ hoveredCluster: id });
  },

  setHoveredProject: (id) => {
    if (get().hoveredProject === id) return;
    set({ hoveredProject: id });
  },

  focusCluster: (id) => {
    trace(get().depth, 'cluster', `focus:${id}`);
    set({
      depth: 'cluster',
      focusedCluster: id,
      hoveredCluster: id,
      hoveredProject: null,
    });
  },

  diveInto: (projectId, color, origin) => {
    trace(get().depth, 'diving', `dive:${projectId}`);
    set({
      depth: 'diving',
      activeProject: projectId,
      transitionColor: color,
      transitionOrigin: origin,
    });
  },

  enterProject: () => {
    trace(get().depth, 'project', 'enter');
    set({ depth: 'project' });
  },

  /** 从项目回到光斑群 */
  surface: () =>
    set({
      depth: 'surfacing',
      hoveredProject: null,
    }),

  /** 上升一级 */
  ascend: () => {
    const { depth, focusedCluster } = get();
    trace(depth, 'ascend', 'up');
    if (depth === 'project') {
      set({ depth: 'surfacing', hoveredProject: null });
    } else if (depth === 'surfacing') {
      set({ depth: 'cluster', activeProject: null });
    } else if (depth === 'cluster') {
      set({
        depth: 'basin',
        focusedCluster: null,
        hoveredCluster: focusedCluster,
        hoveredProject: null,
      });
    }
  },

  /** 在同一深度横向切换到相邻的光斑群 */
  panToCluster: (dir) => {
    const { depth, focusedCluster } = get();
    if (depth !== 'cluster' || !focusedCluster) return;

    const order = CLUSTER_SEQUENCE;
    const idx = order.indexOf(focusedCluster);
    const next = order[idx + dir];
    if (!next) return; // 已在两端，不循环——保留边界感

    trace(depth, 'cluster', `pan:${focusedCluster}->${next}`);
    set({
      focusedCluster: next,
      hoveredCluster: next,
      hoveredProject: null,
    });
  },

  awaken: () => set({ awakened: true }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setIsTouch: (v) => set({ isTouch: v }),
}));

/* 开发期调试入口。
   卷轴深处的章节要点五六次才能到达，排查排版问题时
   需要能直接跳进某个项目。与上面的 __depthTrace 同理，
   只在 DEV 下挂载，生产构建里整段会被 tree-shake 掉。 */
if (import.meta.env.DEV) {
  (window as unknown as { __archive?: unknown }).__archive = useArchive;
}
