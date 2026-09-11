import type { MemoryCluster, ClusterId } from './types';

export const CLUSTERS: Record<ClusterId, MemoryCluster> = {
  green: {
    id: 'green',
    title: '数字产品 / 交互实验',
    label: 'Interaction',
    whisper: '那些被点击、被使用、被遗忘的界面。',
    color: '#2aff00',
    colorDeep: '#1ec400',
    anchor: [-0.46, 0.2],
  },
  purple: {
    id: 'purple',
    title: '视觉叙事 / 品牌 / 艺术',
    label: 'Narrative',
    whisper: '图像先于语言抵达的部分。',
    color: '#9d4dff',
    colorDeep: '#7a2ee0',
    anchor: [0.44, 0.3],
  },
  yellow: {
    id: 'yellow',
    title: '研究 / 影像 / 概念',
    label: 'Research',
    whisper: '没有结论，但一直在想的事。',
    color: '#ffd400',
    colorDeep: '#d9a800',
    anchor: [0.0, -0.48],
  },
};

export const CLUSTER_ORDER: ClusterId[] = ['green', 'purple', 'yellow'];
