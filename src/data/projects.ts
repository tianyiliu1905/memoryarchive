import { NOCODE_TASK, NOCODE_MOBILE } from './nocodeCases';
import { B2B_GENERATION } from './b2bGeneration';
import type { Project } from './types';

/**
 * 作品与资料。
 * 每段由横向章节组成。
 */
export const PROJECTS: Project[] = [
  /* ========================= GREEN — 设计作品 / 过程记录 ========================= */
  {
    id: 'catpaw-design',
    cluster: 'green',
    title: 'Catpaw 设计',
    year: '',
    role: '设计',
    summary: '项目内容待补充。',
    archiveId: 'CATPAW',
    offset: [0.26, -0.14, -0.22],
    scale: 1.06,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Catpaw\n设计',
        body: ['项目内容待补充。'],
      },
      { kind: 'next', marker: '01 / RETURN', heading: '返回作品集' },
    ],
  },
  NOCODE_TASK,
  NOCODE_MOBILE,

  {
    id: 'lib-cn-type-pairing',
    cluster: 'purple',
    title: '中英字体对照表',
    year: '2026',
    role: '整理 / 维护',
    summary: '24 组中英配对，查到即可用，附引入链接。',
    archiveId: 'LIB-004',
    offset: [-0.3, 0.16, 0.24],
    scale: 1.2,
    tone: 'reference',
    chapters: [
      {
        kind: 'brief',
        marker: 'LIB-004 / 01',
        heading: '中英字体对照表',
        body: [
          '英文字体好找，中文难配。每次做页面都要重新试一遍，试完就忘了，下次从头再来。',
          '这张表把 24 组配好的中英组合固定下来：选定气质，直接查标题和正文用什么，需要引入的直接复制链接。',
        ],
        meta: [
          { label: '来源', value: 'nocode-visual-system · typography.csv' },
          { label: '规模', value: '24 组配对' },
          { label: '更新', value: '2026-09-10' },
          { label: '用法', value: '按气质查表 → 复制引入链接' },
        ],
      },
      {
        kind: 'table',
        marker: 'LIB-004 / 02',
        heading: '编辑与经典气质',
        table: {
          head: ['配对', '英文标题', '英文正文', '中文标题'],
          rows: [
            ['Classic Elegant', 'Playfair Display', 'Inter', 'Noto Serif SC 思源宋体'],
            ['Editorial Classic', 'Cormorant Garamond', 'Libre Baskerville', '京華老宋体'],
            ['Serene Editorial', 'Lora', 'Raleway', '上图东观体 粗体'],
            ['Retro Vintage', 'Abril Fatface', 'Merriweather', '康熙字典体'],
            ['Luxury Serif', 'Cormorant', 'Montserrat', 'Noto Serif SC 900'],
            ['Real Estate Luxury', 'Cinzel', 'Josefin Sans', 'Noto Serif SC 思源宋体'],
          ],
          note: '正文中文如无特别说明，一律 PingFang SC——系统自带，不用引入。',
        },
      },
      {
        kind: 'table',
        marker: 'LIB-004 / 03',
        heading: '现代与工具气质',
        table: {
          head: ['配对', '英文标题', '英文正文', '中文标题'],
          rows: [
            ['Minimal Swiss', 'Inter', 'Inter', 'HarmonyOS Sans SC'],
            ['Modern Professional', 'Poppins', 'Open Sans', 'PingFang SC'],
            ['Developer Mono', 'JetBrains Mono', 'IBM Plex Sans', 'HarmonyOS Sans SC'],
            ['Dashboard Data', 'Fira Code', 'Fira Sans', 'HarmonyOS Sans SC'],
            ['Tech/HUD Mono', 'Share Tech Mono', 'Fira Code', 'HarmonyOS Sans SC'],
            ['Accessibility First', 'Atkinson Hyperlegible', 'Atkinson Hyperlegible', 'HarmonyOS Sans SC'],
            ['Venture Modern', 'Rubik', 'Nunito Sans', '抖音美好体'],
            ['Kinetic Motion', 'Syncopate', 'Space Mono', 'HarmonyOS Sans SC'],
          ],
          note: 'HarmonyOS Sans SC 出现在 9 组里，是数据、科技、工具类页面的默认选择。',
        },
      },
      {
        kind: 'table',
        marker: 'LIB-004 / 04',
        heading: '表现力与特殊场景',
        table: {
          head: ['配对', '英文标题', '英文正文', '中文标题'],
          rows: [
            ['Bold Statement', 'Bebas Neue', 'Source Sans 3', '得意黑'],
            ['Sports/Fitness', 'Barlow Condensed', 'Barlow', '得意黑'],
            ['Playful Creative', 'Fredoka', 'Nunito', 'Maple Mono CN SemiBold'],
            ['Handwritten Charm', 'Caveat', 'Quicksand', '字制区喜脉喜欢体'],
            ['Art Deco', 'Poiret One', 'Didact Gothic', '白无常可可体'],
            ['Gaming Bold', 'Russo One', 'Chakra Petch', '猫啃什锦黑体'],
            ['Pixel Retro', 'Press Start 2P', 'VT323', 'MuzaiPixel'],
            ['Indie/Craft', 'Amatic SC', 'Cabin', 'Slidefu'],
            ['Wedding/Romance', 'Great Vibes', 'Cormorant Infant', '鸿雷行书简体'],
            ['Neubrutalist Bold', 'Lexend Mega', 'Public Sans', 'HarmonyOS Sans SC'],
          ],
        },
      },
      {
        kind: 'specs',
        marker: 'LIB-004 / 05',
        heading: '高频字体与它们的位置',
        points: [
          'HarmonyOS Sans SC｜9 组复用。现代无衬线，数据、科技、工具类页面的稳妥选择。',
          'Noto Serif SC｜4 组。通用衬线，编辑、文化、正式场景；900 字重可撑奢华感。',
          '得意黑 Smiley Sans｜2 组。斜体黑体，冲击力强，适合大标题与运动主题。',
          'PingFang SC｜正文通用。系统自带，不需要引入，几乎所有配对的正文都是它。',
          '京華老宋体｜复古印刷感，偏编辑经典。',
          '上图东观体｜安静的图书馆气质。',
          '康熙字典体｜古籍风，怀旧场景。',
          'MuzaiPixel｜像素风，游戏与复古。',
        ],
        plates: [
          { index: 'PL.01', caption: '24 组配对的气质分布', seed: 4001, variant: 'swatch', ratio: 1.42 },
        ],
      },
      {
        kind: 'snippet',
        marker: 'LIB-004 / 06',
        heading: '字体栈怎么写',
        body: ['英文主字体在前，中文 webfont 紧随其后，PingFang SC 兜底，最后通用字族。'],
        code: {
          lang: 'CSS / Tailwind',
          lines: [
            "@import url('https://cdn.jsdelivr.net/npm/@lobehub/",
            "  webfont-harmony-sans-sc@1.0.0/css/index.css');",
            '',
            '// 例：命中第 17 组 Dashboard Data',
            'fontFamily: {',
            "  sans: ['\"Fira Sans\"', '\"HarmonyOS Sans SC\"',",
            "         '\"PingFang SC\"', 'sans-serif'],",
            "  mono: ['\"Fira Code\"', 'ui-monospace', 'monospace'],",
            '}',
          ],
        },
        annotation: '注意：@font-face 里的 font-family 是英文标识名，字体栈里不能写中文描述名。',
      },
      { kind: 'next', marker: 'LIB-004 / END', heading: '这份资料到此为止' },
    ],
  },

  {
    id: 'lib-easing-curves',
    cluster: 'purple',
    title: 'CSS 动画曲线调整器',
    year: '2026',
    role: '自建工具',
    summary: '保留曲线预设，也记录 CatPaw 原型里的分栏、推荐切换与任务状态。',
    archiveId: 'LIB-007',
    offset: [0.28, -0.2, -0.14],
    scale: 1.08,
    tone: 'reference',
    chapters: [
      {
        kind: 'brief',
        marker: 'LIB-007 / 01',
        heading: 'CSS 动画曲线调整器',
        body: [
          '曲线编辑器到处都有，但它们大多只让你看一个方块在空地上移动。方块好看，放进真实界面里经常不对。',
          '工具把按钮填充、弹窗消散、底部面板、AI 打字等场景放进来，让曲线能对着具体动作调整。这里保留原有预设与用法，再接上 CatPaw 中用过的参数和交互规则。',
          'CatPaw 部分核对自当前本地交互原型及设计记录，包含尚未提交的实现；不代表生产上线或用户测试结论。本页展示资料与代码，未嵌入可操作编辑器。',
        ],
        meta: [
          { label: '形态', value: '单个 HTML 文件，本地打开即用' },
          { label: '场景', value: '10 个，含 6 个 AI 相关' },
          { label: '预设', value: '8 条常用曲线' },
          { label: '输出', value: 'cubic-bezier() 直接复制' },
        ],
      },
      {
        kind: 'table',
        marker: 'LIB-007 / 02',
        heading: '八条预设曲线',
        table: {
          head: ['名称', 'cubic-bezier', '什么时候用'],
          rows: [
            ['linear', '0, 0, 1, 1', '进度、计时这类匀速推进'],
            ['ease', '0.25, 0.1, 0.25, 1', '没想法时的默认值'],
            ['ease-in', '0.42, 0, 1, 1', '元素离场，越走越快'],
            ['ease-out', '0, 0, 0.58, 1', '元素入场，落下来收住'],
            ['ease-in-out', '0.42, 0, 0.58, 1', '位置移动，两头都收'],
            ['弹跳', '0.68, -0.6, 0.32, 1.6', '点赞、收藏这类要有反馈的'],
            ['回弹', '0.34, 1.56, 0.64, 1', '冲过头再退回来，活泼'],
            ['急停', '0.76, 0, 0.24, 1', '快速切换，干脆利落'],
          ],
          note: '前五条是 CSS 内置关键词，后三条是手调出来的，超出 0–1 区间才有过冲。',
        },
      },
      {
        kind: 'table',
        marker: 'LIB-007 / 03',
        heading: '原工具的场景与默认时长',
        table: {
          head: ['场景', '调什么', '默认时长'],
          rows: [
            ['按钮填充', 'width · color', '1.8s'],
            ['弹窗消散', 'opacity · scale', '1.2s'],
            ['点赞弹跳', 'scale · color', '0.6s'],
            ['底部面板', 'overlay 透明度 · 面板位移', '0.5s'],
            ['AI 打字', '文字透明度 · 光点缩放', '0.8s'],
            ['AI 进度', '填充宽度 · 高光位移', '2.0s'],
            ['AI 语音', '头像缩放 · 气泡出现', '0.5s'],
            ['思考中', '圆环缩放 · 文字透明度', '0.8s'],
            ['答案展开', '标题淡入 · 正文上移', '0.6s'],
          ],
          note: '同一个场景里的多个属性分开调——大部分不自然的动效，是因为它们共用了一条曲线。',
        },
      },
      {
        kind: 'specs',
        marker: 'LIB-007 / 04',
        heading: '调曲线时的几个起点',
        points: [
          '入场用 ease-out｜元素落到位要有减速，冲进来再停住才像有重量。',
          '离场用 ease-in｜走的时候加速，干脆，不拖泥带水。',
          '过冲要克制｜弹跳与回弹可先用于点赞、收藏等短反馈；大范围转场需单独核对舒适度。',
          '拆开调｜透明度和位移分别给曲线，一起调很难同时对。',
          '时长和距离挂钩｜移动得越远，时间要越长，不然像被弹开。',
          '同类动作统一｜为相近任务保留共同节奏，再按移动距离、内容量和交互状态调整。',
        ],
        plates: [
          { index: 'PL.01', caption: '十个场景的曲线取值分布', seed: 4002, variant: 'wave', ratio: 1.55 },
        ],
      },
      {
        kind: 'snippet',
        marker: 'LIB-007 / 05',
        heading: '调好之后是这样用的',
        body: ['工具输出的是纯 cubic-bezier，落到代码里建议收成变量，便于全局统一。'],
        code: {
          lang: 'CSS',
          lines: [
            ':root {',
            '  --ease-enter: cubic-bezier(0, 0, 0.58, 1);',
            '  --ease-exit:  cubic-bezier(0.42, 0, 1, 1);',
            '  --ease-pop:   cubic-bezier(0.34, 1.56, 0.64, 1);',
            '}',
            '',
            '.toast {',
            '  transition:',
            '    opacity 1.2s var(--ease-enter),',
            '    transform 1.2s var(--ease-pop);',
            '}',
          ],
        },
        annotation: '收成变量之后，改一处全站跟着变——这比每次重调都快。',
      },
      {
        "kind": "specs",
        "marker": "LIB-007 / 06",
        "heading": "分栏：拖的时候跟手，松开再收合",
        "points": [
          "用户正在拉边界｜按住时关闭网格过渡，让宽度直接跟随指针；松手触发状态变化后恢复 380ms 的自动过渡。",
          "先停在断点｜记录要求两次独立拖拽：第一次停住，第二次越过 32px 才允许折叠或文件全屏。曲线配合明确的触发条件使用。",
          "收合时保护文字｜收起区内容立即隐藏，只让外层列宽变化；文件全屏时主区也立即隐藏，避免持续展示文字被挤窄。",
          "记录与现状要对照｜文档写左列归零；当前源码中，手动收合保留窄轨，窗口自适应收合才归零。复用时保留这一状态区别。",
          "来源与判断｜PANEL_INTERACTION_ANIMATIONS.md、styles.css。380ms 与曲线是实现事实；将它概括为「跟手与自动过渡分开」沿用记录中的原则，未验证最优参数。"
        ]
      },
      {
        "kind": "snippet",
        "marker": "LIB-007 / 07",
        "heading": "把跟手和自动过渡分开写",
        "body": [
          "从 CatPaw 规则提炼的 CSS 简化示例。两层网格共用节奏；列宽目标仍由各自状态设置。拖拽的宽度计算与释放判定需要 JS 配合。"
        ],
        "code": {
          "lang": "CSS · 提炼示例",
          "lines": [
            ".window, .content {",
            "  transition: grid-template-columns",
            "    380ms cubic-bezier(.22,.68,0,1);",
            "}",
            ".window.is-resizing,",
            ".content.is-resizing { transition: none; }",
            "@media (prefers-reduced-motion: reduce) {",
            "  .window, .content { transition: none; }",
            "}"
          ]
        }
      },
      {
        "kind": "specs",
        "marker": "LIB-007 / 08",
        "heading": "推荐切换：让新布局接住旧位置",
        "points": [
          "内容变了，输入区还在｜animateHeroReflow 在更新前后测量 hero 及子元素位置，用 transform 补回偏移，再以 360ms、cubic-bezier(.22,.68,0,1) 回到新布局。",
          "节奏分给不同层｜二级推荐等待 200ms 后替换；每项以 320ms 入场，从下方 8px 淡入，相邻项错开 55ms。案例区另用 180ms 的淡出与替换。",
          "再点一次时接新意图｜切换前清除旧推荐与案例定时器，取消旧 hero 及子元素动画；从当前可见位置重新测量，不让旧回调继续切内容。",
          "范围与成本｜这是 JS 驱动布局测量、Web Animations API 执行动画的组合，不能只复制一条 CSS。减少动态效果时跳过 reflow 动画与等待。",
          "来源与取舍｜app.js 的 animateHeroReflow、setPromptCategory、transitionCases；styles.css 的 secondaryPromptIn。DECISIONS.md 保留轻量切换原则；没有记录曲线对比实验。"
        ]
      },
      {
        "kind": "table",
        "marker": "LIB-007 / 09",
        "heading": "任务状态：运行、暂停、完成各有节奏",
        "table": {
          "head": [
            "当前原型场景",
            "参数 / 动作",
            "状态边界"
          ],
          "rows": [
            [
              "队列新增一项",
              "250ms ease-out；Y 7px → 0，opacity 0 → 1",
              "入场一次；无延迟"
            ],
            [
              "任务运行标签",
              "2s ease-in-out infinite；背景扫光",
              "暂停或完成时停止扫光"
            ],
            [
              "暂停的回复正文",
              "5s ease-in-out infinite；文字颜色呼吸",
              "正文保留；减少动态效果时停用"
            ],
            [
              "继续执行",
              "旧回复转历史，新开一轮",
              "旧轮停止呼吸；新轮按自己的状态显示"
            ]
          ],
          "note": "来源：conversation-queue-demo.css / .js，已由 index.html 引用。这里记录模拟任务状态的反馈，不把循环动画当作真实进度，也不把继续执行写成后端任务恢复。"
        }
      },
      {
        "kind": "snippet",
        "marker": "LIB-007 / 10",
        "heading": "用状态结束动画，不只负责播放",
        "body": [
          "从任务队列样式提炼的简例：完成和暂停都收起运行扫光；暂停正文保留较慢的颜色反馈。下面省略渐变底图与扫光关键帧，保留状态规则和暂停呼吸。"
        ],
        "code": {
          "lang": "CSS · 提炼示例",
          "lines": [
            ".running-label { animation: sweep 2s ease-in-out infinite; }",
            ".is-paused .running-label,",
            ".is-complete .running-label { animation: none; }",
            ".is-paused .reply {",
            "  animation: breath 5s ease-in-out infinite;",
            "}",
            "@keyframes breath {",
            "  0%,100% { color: var(--text-4); }",
            "  50% { color: var(--ds-text-1); }",
            "}"
          ]
        }
      },
      {
        "kind": "specs",
        "marker": "LIB-007 / 11",
        "heading": "复用之前，把收尾与限制一起带走",
        "points": [
          "结束事件要筛选｜面板切换只接收 content 自身的 grid-template-columns transitionend；另设 500ms 清理兜底，无动画时也能移除临时状态。",
          "用户滚动时交还控制｜打开产物预览时逐帧锚定卡片位置，网格过渡结束或 500ms 后停止；wheel、touchstart 会提前停止，下次打开先取消旧锚定。",
          "暂停时旧回调失效｜队列 stop 清理计时器并递增 generation；回调检查轮次和暂停状态，防止旧轮继续更新。来源：app.js、conversation-queue-demo.js。",
          "减少动态效果｜原型关闭布局过渡、推荐入场、扫光及暂停呼吸，保留静态状态与正文。复用上一页简例时，也需为这些自定义类补相同媒体查询。",
          "性能仍需按页面核对｜布局列宽会触发布局；位置补偿使用 transform，但前后测量仍有开销；文字颜色与背景扫光涉及绘制。没有帧率测量，不写成性能优化成果。"
        ]
      },
      { kind: 'next', marker: 'LIB-007 / END', heading: '这份资料到此为止' },
    ],
  },
  /* ========================= YELLOW — 研究 ========================= */
  {
    "id": "aesthetic-scoring-standards",
    "cluster": "yellow",
    "title": "审美评分标准",
    "year": "",
    "role": "",
    "summary": "把生成页面的审美判断拆成可核对的问题，用人评、页面证据和对照样本校准边界。",
    "archiveId": "INQ-001",
    "offset": [
      -0.22,
      0.08,
      0.3
    ],
    "scale": 1.08,
    "chapters": [
      {
        "kind": "cover",
        "marker": "00 / COVER",
        "heading": "审美评分标准",
        "body": [
          "为 NoCode 建立可复核的视觉评估方法：把审美判断拆成具体问题，再用人评、页面证据和对照样本持续校准。"
        ],
        "meta": [
          {
            "label": "Scope",
            "value": "生成页面 · 视觉评估研究"
          },
          {
            "label": "Status",
            "value": "方法与过程已整理 · 结果呈现待补充"
          }
        ]
      },
      {
        "kind": "origin",
        "marker": "01 / CONTEXT",
        "heading": "生成出来之后，怎样判断它好不好",
        "body": [
          "NoCode 的使用场景从简单 Demo 走向专业任务。背景材料记录了一类反馈：生成结果有明显的 AI 风格，未必符合品牌和设计期待；用户觉得不好看，却很难说清从哪里改。",
          "评估需要兼顾专业场景的规范与一致性，以及开放场景的多样性。把问题说具体，才能比较结果、讨论修改，也能为案例筛选提供依据。",
          "更早的 D2C 还原度评估关注设计稿与生成结果的对应关系。这里记录后续 UI 审美阶段，两者分别保留各自的评估对象与证据。"
        ],
        "annotation": "依据：NoCode页面生成审美质感提升 · 背景与目标；D2C 仅作前史说明。"
      },
      {
        "kind": "steps",
        "marker": "02 / FRAMEWORK",
        "heading": "把判断落到具体的问题上",
        "body": [
          "现存 V3 记录将判断拆为 ABCD 扣分与 E 创新加分，共 32 项。每项回答是或否，并保留理由；同一题的判断与总分计算分开处理。"
        ],
        "steps": [
          {
            "no": "01",
            "title": "先看底线",
            "detail": "关键内容能否完整阅读、文字是否清楚、布局是否适配当前视口。这些问题先限定评估对象。"
          },
          {
            "no": "02",
            "title": "再看视觉关系",
            "detail": "色彩、层级与布局、装饰与图标分别检查。颜色承担什么语义、留白位于哪里，都要落到页面中的具体位置。"
          },
          {
            "no": "03",
            "title": "给设计亮点留位置",
            "detail": "独特视觉语言、交互、排版、定制资产与记忆点另列加分，避免只用“不出错”描述设计质量。"
          }
        ],
        "annotation": "逐项判断仍需读规则和取证；目前没有评审耗时数据，不将二元判断写成已验证的效率提升。"
      },
      {
        "kind": "table",
        "marker": "03 / DISAGREEMENT",
        "heading": "同一个页面，分歧发生在哪里",
        "table": {
          "head": [
            "Case 23 · 历史题意",
            "三位人评",
            "Sol 判断"
          ],
          "rows": [
            [
              "关键内容是否遮挡或截断",
              "2 位判有问题，1 位判无",
              "未判问题；理由援引图表边界与溢出检查"
            ],
            [
              "模块内留白是否过大",
              "2 位判有问题，1 位判无",
              "未判问题；理由援引图形与容器占用"
            ],
            [
              "图标是否表意有误或未显示",
              "2 位判有问题，1 位判无",
              "未判问题；理由认为图标语义匹配"
            ]
          ],
          "note": "来源：Nocode视觉评测指标建设的 Case 23 逐题表（历史 A2 / C4 / D4，题号不套用到当前版本）。多数票用于定位分歧，具体判断仍需回到页面证据复核。"
        }
      },
      {
        "kind": "contrast",
        "marker": "04 / BOUNDARIES",
        "heading": "颜色多，哪些该算进问题里",
        "contrast": [
          {
            "tag": "早期规则记录",
            "heading": "先按可见色相计数",
            "lines": [
              "B1 以五种为阈值，标签、图标和图表色都计入。",
              "同一色相的明暗变化只算一种；有数据或状态语义也不自动豁免。",
              "这样的口径需要继续说明：业务表达与主视觉竞争怎样区分。"
            ]
          },
          {
            "tag": "8 月 27 日标记版补充",
            "heading": "把语义、面积和频率带入判断",
            "lines": [
              "必要的数据系列、图例、状态色与游戏对象色，在未高频、大面积主导页面时可豁免。",
              "与场景、品牌或游戏世界观相关且自洽的色彩，不因饱和而自动扣分。",
              "这是该版对照页中的规则变化；当前运行题意已有调整，不能沿用题号直接比较。"
            ]
          }
        ]
      },
      {
        "kind": "process",
        "marker": "05 / CALIBRATION",
        "heading": "把拿不准的边界做成样本",
        "body": [
          "渐变和阴影很难只靠一句“太重了”形成共同判断。color_lab 将它们做成并排的微缩页面：尽量保留配方，只改变面积、位置或重复次数；阴影另做透明度、几何、层数和底色对照。",
          "实验页设置隐藏参数的盲标和同参数重复样本，用来检查判断是否稳定。固定样本的数值不直接推广为所有页面的阈值。",
          "现有材料包括实验页面、部分人工基准与重跑记录；全部样本是否完成标注、结论是否稳定，仍需对齐对应轮次。"
        ],
        "annotation": "依据：color_lab.html、color_pair_lab.html 与 visual_eval/README.md；样本是控制变量示意，不是线上页面原样。"
      },
      {
        "kind": "steps",
        "marker": "06 / METHOD",
        "heading": "页面证据、判断和计分各自留痕",
        "body": [
          "独立评测实现把浏览器取证、逐题判断和本地计分串在一起，既支持全套题，也支持只重跑某一类问题。"
        ],
        "steps": [
          {
            "no": "01",
            "title": "先看实际渲染",
            "detail": "先取整体截图，必要时补局部观察；DOM 与 CSS 用来核对尺寸、样式和具体元素。截图印象与代码清点互相校验。"
          },
          {
            "no": "02",
            "title": "每题保存理由与位置",
            "detail": "模型输出是或否、理由与证据选择器。渐变题区分背景、元素填充与文字，避免把不同载体的问题混在一起。"
          },
          {
            "no": "03",
            "title": "规则确定性计分",
            "detail": "程序按该版权重计算总分。只跑子集时保留逐题结论，总分和等级为空；改口径后的重跑也需标明版本。"
          }
        ],
        "annotation": "依据：visual_eval 的 README、agent.py、rubric.py、run.py 及保存的 JSON 结果。实现与试跑记录不等同于生产部署。"
      },
      {
        "kind": "table",
        "marker": "07 / VERSIONS",
        "heading": "评分口径保留各自的版本",
        "table": {
          "head": [
            "材料状态",
            "基础维度 A / B / C / D",
            "创新部分 E"
          ],
          "rows": [
            [
              "V3 历史记录",
              "10 / 25 / 30 / 25",
              "5 项，每项 2 分"
            ],
            [
              "8 月 27 日标记版",
              "5 / 30 / 30 / 20",
              "5 项，每项 3 分"
            ],
            [
              "“今日调整”草案",
              "5 / 25 / 25 / 15",
              "扩为 22 项，标记权重 30%"
            ],
            [
              "当前运行代码",
              "5 / 30 / 30 / 20",
              "仍为 5 项，每项 3 分"
            ]
          ],
          "note": "按材料标记区分状态，不据此认定完整的定稿时间线。22 项 Markdown 允许“?”并剔除分母，对照 HTML 改为二元；草案的计分衔接仍待核对。当前代码 B1 / B3 / C11 双权重，B2 阈值仍有待确认记录。来源：评分 XML、版本对照 HTML、加分项 Markdown、rubric.py。"
        }
      },
      {
        "kind": "reflection",
        "marker": "08 / WORK IN PROGRESS",
        "heading": "已有过程，结果呈现还在补充",
        "body": [
          "目前已留下评分规则与版本对照、人机逐题记录、可视化标注样本，以及保存证据、运行单题或全套评测的实现。这些材料能把研究过程讲清楚。",
          "结果展示还需补上：选定同一版规则，将页面、人工基准、模型判断与复测放回同一组样本，说明哪些分歧得到处理、哪些仍存在。现有记录不足以证明生成质量或评审效率已提升。",
          "接下来补齐版本日期、具体分工和原始图片，再整理一组可完整复核的结果。本篇先保留阶段性产物与待完善状态。"
        ],
        "annotation": "阶段性记录 · 结果呈现待补充。"
      },
      {
        "kind": "next",
        "marker": "09 / RETURN",
        "heading": "研究先记录到这里，结果继续补齐"
      }
    ]
  },
  B2B_GENERATION,
];

export const PROJECTS_BY_CLUSTER = {
  green: PROJECTS.filter((p) => p.cluster === 'green'),
  purple: PROJECTS.filter((p) => p.cluster === 'purple'),
  yellow: PROJECTS.filter((p) => p.cluster === 'yellow'),
} as const;

export const getProject = (id: string | null) =>
  id ? PROJECTS.find((p) => p.id === id) ?? null : null;
