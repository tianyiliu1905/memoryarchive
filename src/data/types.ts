/**
 * 记忆档案的数据模型
 * 每个项目 = 一段可以潜入的记忆
 */

export type ClusterId = 'green' | 'purple' | 'yellow';

/** 横向日记的章节类型，决定版式 */
export type ChapterKind =
  | 'cover' // 封面
  | 'origin' // 起因
  | 'process' // 过程
  | 'result' // 结果
  | 'reflection' // 回望
  | 'next'; // 下一段记忆

export interface MemoryCluster {
  id: ClusterId;
  /** 分类标题，如「数字产品 / 交互实验」 */
  title: string;
  /** 英文副题，用于档案标签 */
  label: string;
  /** 一句极短的分类描述 */
  whisper: string;
  /** 荧光主色 */
  color: string;
  /** 更深的色阶，用于文字与线条 */
  colorDeep: string;
  /** 记忆盆中该光斑群的极坐标位置（盆半径归一化） */
  anchor: [number, number];
}

/** 一个视觉块：图片区域用程序化生成的抽象图，不依赖外部资源 */
export interface Plate {
  /** 索引编号，如 "PL.03" */
  index: string;
  /** 图注 */
  caption: string;
  /** 生成图形的种子 */
  seed: number;
  /** 图形样式 */
  variant: 'field' | 'grid' | 'wave' | 'scatter' | 'strata' | 'orbit';
  /** 宽高比 */
  ratio: number;
}

export interface Chapter {
  kind: ChapterKind;
  /** 章节序号标签，如 "01 / ORIGIN" */
  marker: string;
  /** 章节大标题 */
  heading?: string;
  /** 正文段落 */
  body?: string[];
  /** 手写式旁注 */
  annotation?: string;
  /** 视觉板块 */
  plates?: Plate[];
  /** 键值型元数据，用于封面 */
  meta?: { label: string; value: string }[];
  /** 结果章节的要点列表 */
  points?: string[];
}

export interface Project {
  id: string;
  cluster: ClusterId;
  /** 项目名 */
  title: string;
  /** 年份 */
  year: string;
  /** 承担角色 */
  role: string;
  /** 一句话摘要，悬停时浮现 */
  summary: string;
  /** 档案编号 */
  archiveId: string;
  /** 在所属光斑群中的相对位置（-1 ~ 1） */
  offset: [number, number, number];
  /** 该记忆光斑的相对大小 */
  scale: number;
  /** 横向日记章节 */
  chapters: Chapter[];
}
