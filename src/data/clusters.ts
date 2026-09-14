import type { MemoryCluster, ClusterId } from './types';

export const CLUSTERS: Record<ClusterId, MemoryCluster> = {
  green: {
    id: 'green',
    title: '设计作品 / 过程记录',
    label: 'Practice',
    whisper: '做出来的东西，以及它变成那样的全过程。',
    color: '#2aff00',
    colorDeep: '#1ec400',
    anchor: [-0.46, 0.2],
  },
  purple: {
    id: 'purple',
    title: '图书馆 / 工具与资料',
    label: 'Library',
    whisper: '整理出来，是为了以后还能找到。',
    color: '#9d4dff',
    colorDeep: '#7a2ee0',
    anchor: [0.44, 0.3],
  },
  yellow: {
    id: 'yellow',
    title: '研究 / 未完成的追问',
    label: 'Inquiry',
    whisper: '没有结论，但一直在想的事。',
    color: '#ffd400',
    colorDeep: '#d9a800',
    anchor: [0.0, -0.48],
  },
};

export const CLUSTER_ORDER: ClusterId[] = ['green', 'purple', 'yellow'];
