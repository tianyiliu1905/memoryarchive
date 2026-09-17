/**
 * 记忆档案的数据模型
 * 每个项目 = 一段可以潜入的记忆
 */

export type ClusterId = 'green' | 'purple' | 'yellow';

/** 横向日记的章节类型，决定版式 */
export type ChapterKind =
  /* ---- 叙事型：设计作品用，一屏一个转折 ---- */
  | 'cover' // 封面
  | 'origin' // 起因
  | 'process' // 过程
  | 'result' // 结果
  | 'reflection' // 回望
  | 'statement' // 整屏一句话，用于叙事的重音
  | 'contrast' // 左右对照：之前 / 之后
  | 'translate' // 工程语言 → 大众语言的对照
  | 'steps' // 编号推进的几步
  | 'uimock' // 界面复刻：用 DOM 搭出真实结构，而非截图
  /* ---- 资料型：图书馆用，一屏一张表 ---- */
  | 'brief' // 条目开篇：它是什么、怎么用
  | 'table' // 一张表
  | 'specs' // 键值清单
  | 'snippet' // 代码片段
  | 'next'; // 下一段记忆

/**
 * 日记的排版基调。
 * story —— 大字、留白、逐屏显影，用于设计作品
 * reference —— 小字、紧凑、信息密度优先，用于图书馆资料
 */
export type JournalTone = 'story' | 'reference';

export interface MemoryCluster {
  id: ClusterId;
  /** 分类标题，如「设计作品 / 过程记录」 */
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
  variant:
    | 'field'
    | 'grid'
    | 'wave'
    | 'scatter'
    | 'strata'
    | 'orbit'
    /* ---- 界面结构类：用线框讲清楚「长什么样」 ---- */
    | 'wireframe' // 网页布局线框
    | 'handset' // 手机屏，含底部标签栏
    | 'branch' // 分支 / 版本流向
    | 'swatch'; // 色卡 / 字体样本格
  /** 宽高比 */
  ratio: number;
}

/** 左右对照的一侧 */
export interface ContrastSide {
  /** 角标，如「之前」 */
  tag: string;
  /** 这一侧的标题 */
  heading: string;
  /** 几行说明 */
  lines: string[];
}

/** 一条「行话 → 人话」的翻译 */
export interface TranslationPair {
  /** 工程世界里的说法 */
  from: string;
  /** 产品里最终的说法 */
  to: string;
  /** 为什么这样改 */
  why: string;
}

/** 编号推进的一步 */
export interface StepItem {
  /** 序号，如 "01" */
  no: string;
  /** 这一步的名字 */
  title: string;
  /** 一句话说明 */
  detail: string;
}

/* ================= 界面复刻（UI Mock）=================

   用 DOM 搭出产品界面的「真实结构」，而不是贴截图、嵌 iframe
   或放录屏。这样做的理由：

   - 截图会把别处的设计语言（阴影、圆角、品牌色）整块搬进来，
     和本站的纸面质感打架；缩放时还会糊。
   - Mock 用的是本站自己的墨色与字体，只借「结构」不借「皮肤」，
     看起来像一张画在档案里的界面示意图。
   - 文字是真的，可选中、可检索、任意缩放都清晰。
   - 能只画要讲的那部分——截图做不到这种取舍。 */

/** 侧边栏里的一项 */
export interface MockNavItem {
  /** 显示文字 */
  label: string;
  /** 为真时用主色标出，表示当前所在 */
  active?: boolean;
  /** 渲染成分组标题（小字、不可点）而非导航项 */
  group?: boolean;
  /** 行尾的计数或状态字 */
  trailing?: string;
}

/** 内容区的一块。不同形态决定怎么排 */
export interface MockBlock {
  kind:
    | 'toolbar'   // 一排筛选 / 标签
    | 'cards'     // 卡片网格
    | 'rows'      // 列表行
    | 'prompt'    // 输入框（静态，不可输入）
    | 'section';  // 小标题
  /** section 的标题文字 */
  title?: string;
  /** toolbar 的各项，第一项默认选中 */
  chips?: string[];
  /** cards / rows 的条目 */
  items?: {
    title: string;
    /** 副标题或描述 */
    sub?: string;
    /** 右侧的状态小字 */
    tag?: string;
    /** 用主色标出这一项 */
    accent?: boolean;
  }[];
  /** prompt 的占位文字 */
  placeholder?: string;
}

/** 底部标签栏里的一个入口（仅手机形态） */
export interface MockTabItem {
  label: string;
  /** 为真则用主色标出，表示当前所在 */
  active?: boolean;
}

/** 一个界面复刻 */
export interface UiMock {
  /** 窗口标题栏上的字，如「工作台」 */
  title: string;
  /**
   * 外壳形态。缺省为桌面窗口。
   *
   * phone 不只是「窗口变窄」：它换掉了红绿灯、多了状态栏与
   * 底部标签栏。讨论移动端结构时，那排标签栏本身就是要说的事，
   * 用桌面窗口的外壳去装会把论点说没。
   */
  frame?: 'window' | 'phone';
  /** 右上角的说明角标。默认「结构示意」，说清楚这不是截图 */
  badge?: string;
  /** 侧边栏。缺省则不显示，用于展示「没有导航」的旧结构 */
  sidebar?: {
    /** 侧边栏顶部的产品名 */
    brand?: string;
    items: MockNavItem[];
  };
  /** 内容区的几块 */
  blocks: MockBlock[];
  /** 底部标签栏。缺省则不画——「没有标签栏」本身也是一种结构 */
  tabs?: MockTabItem[];
  /** 图注，排在窗口下方 */
  caption?: string;
}

/** 一张表 */
export interface TableBlock {
  /** 表头 */
  head: string[];
  /** 每一行 */
  rows: string[][];
  /** 表格下方的补充说明 */
  note?: string;
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
  /** statement：整屏的那一句话 */
  statement?: string;
  /** contrast：左右两侧 */
  contrast?: [ContrastSide, ContrastSide];
  /** translate：行话与人话的对照 */
  translations?: TranslationPair[];
  /** steps：编号推进 */
  steps?: StepItem[];
  /** table：一张表 */
  table?: TableBlock;
  /** snippet：代码片段 */
  code?: { lang: string; lines: string[] };
  /** uimock：界面复刻。给两个则左右对照（改版前 / 后） */
  mocks?: UiMock[];
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
  /** 排版基调，缺省为 story */
  tone?: JournalTone;
  /** 横向日记章节 */
  chapters: Chapter[];
}
