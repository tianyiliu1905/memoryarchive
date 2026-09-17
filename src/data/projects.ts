import type { Project } from './types';

/**
 * 九段记忆。
 * 每段由 6 个横向章节组成：封面 → 起因 → 过程 → 结果 → 回望 → 下一段记忆。
 */
export const PROJECTS: Project[] = [
  /* ========================= GREEN — 设计作品 / 过程记录 ========================= */
  {
    id: 'nocode-talk-to-task',
    cluster: 'green',
    title: 'Nocode 产品重构',
    year: '2025 – 2026',
    role: '产品 / 设计',
    summary: '把一个「一句话生成网页」的玩具，改造成能装下真实项目的工具。',
    archiveId: 'MEM-021',
    offset: [-0.22, 0.08, 0.3],
    scale: 1.34,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Nocode\n产品重构',
        body: [
          'Nocode 最初只回答一个问题：能不能一句话生成一个网页。后来它必须回答另一个问题——能不能装下一个真正的项目、一整个团队、和已经写了很多年的代码。',
        ],
        meta: [
          { label: 'Year', value: '2025 – 2026' },
          { label: 'Role', value: '产品策略 · 信息架构 · 交互设计' },
          { label: 'Scope', value: '版本协作 · 仓库导入 · D2C · 权限' },
          { label: 'Archive', value: 'MEM-021' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '它本来是个好用的玩具',
        body: [
          'Nocode 从公司内部的 Hackathon 长出来。最早的版本只做一件事：你说一句话，它给你一个能打开的网页。用得最多的是销售和运营——他们手上有想法，但排不到研发。',
          '这个阶段它被夸得很多。也正因为被夸得多，它被推到了下一个位置：公司开始希望设计和产品也能通过它，真正进到开发流程里。',
        ],
        annotation: '一个工具被认可之后，通常会被交待更重的事。',
        plates: [
          { index: 'PL.01', caption: '早期形态：一个输入框，一个作品广场', seed: 2101, variant: 'wireframe', ratio: 1.6 },
        ],
      },
      {
        kind: 'contrast',
        marker: '02 / GAP',
        heading: '被期待的事，和它当时能做的事',
        contrast: [
          {
            tag: '它擅长的',
            heading: '一个人，一个小东西',
            lines: [
              '一句话生成，马上能看到结果',
              '不满意就再说一句，来回改',
              '改坏了退回上一轮对话',
              '做完分享出去，很少再维护',
            ],
          },
          {
            tag: '被要求的',
            heading: '一群人，一个真项目',
            lines: [
              '功能要拆开，几个人同时动手',
              '有工期，不能等一个人慢慢试',
              '公司里已经躺着上万个代码仓库',
              '上线之后还要改很久',
            ],
          },
        ],
      },
      {
        kind: 'statement',
        marker: '03 / THE CRUX',
        statement: '一个人来回改，和一群人同时改，是两件事。',
        annotation: '差别不在功能多少，在于有没有人需要「合」。',
      },
      {
        kind: 'process',
        marker: '04 / RESEARCH',
        heading: '我先自己去走了一遍',
        body: [
          '当时最说不清的是：真实的开发到底长什么样。产、设、研各自有各自的流程，中间那段谁也讲不完整。',
          '我本身是信息科学背景，能读代码，于是接了几个前端项目——官网、宣传页，还有 Nocode 自己的一些体验优化，从需求一路做到上线，自己走完。',
          '走完之后我才敢去设计这条链路。不然我只是在凭想象替别人安排工作。',
        ],
        annotation: '后来我们组的同事基本都自己写前端。',
        plates: [
          { index: 'PL.02', caption: '从需求到上线，我自己走过的那几段', seed: 2102, variant: 'branch', ratio: 1.72 },
        ],
      },
      {
        kind: 'steps',
        marker: '05 / FINDINGS',
        heading: '差距集中在三件事上',
        body: ['把流程走完之后，Nocode 和真实开发之间的距离就具体了——不是「不够强」，而是缺了三样东西。'],
        steps: [
          {
            no: '01',
            title: '几个人同时改，谁说了算',
            detail: '一个人改，记录状态就够了；几个人改，需要分头做、再合回来，还要处理撞车。',
          },
          {
            no: '02',
            title: '已经写好的代码进不来',
            detail: '公司里上万个仓库，不可能全部搬家。工具得能接住它们，而不是让它们重来。',
          },
          {
            no: '03',
            title: '带进来的东西变了',
            detail: '产品直接丢原型图，设计想拖拽而不是描述。输入物一换，前面的假设就全松了。',
          },
        ],
      },
      {
        kind: 'statement',
        marker: '06 / DECISION',
        statement: '这些问题，开发早就解决过了。',
        annotation: '分支、提交、合并——经过无数真实项目验证。难的不是发明，是让不写代码的人也能用。',
      },
      {
        kind: 'translate',
        marker: '07 / TRANSLATION',
        heading: '于是我做了一次翻译',
        body: [
          '对研发来说，仓库、分支、签出是每天都在用的词。对设计、产品、运营来说，这几个词本身就是门槛——还没开始干活，先要学一套词汇。',
          '所以我没有引入这些概念，而是给它们换了一层说法。底下跑的还是同一套东西，上面露出来的是他们本来就懂的话。',
        ],
        translations: [
          {
            from: 'repository',
            to: '项目',
            why: '它就是你要做的那件事，不是一个存代码的地方。',
          },
          {
            from: 'master / 可签出分支',
            to: '模板',
            why: '一个能照着开始的干净底子——这个比喻设计师天天在用。',
          },
          {
            from: 'git checkout -b',
            to: '基于模板创建作品',
            why: '把一条命令换成一次点击，动作没变，门槛没了。',
          },
          {
            from: 'merge',
            to: '合并到项目',
            why: '保留「合」的语义，去掉需要先理解分支模型的前提。',
          },
        ],
        annotation: '不是把概念藏起来，是换一个他们已经懂的说法。',
      },
      {
        kind: 'process',
        marker: '08 / INPUT',
        heading: '设计稿是最难接的那一段',
        body: [
          '设计师面对一个只能用嘴改的画布，是很痛苦的。他们习惯了 Figma、MasterGo，手上的专业能力在这里使不出来。',
          '但主流设计工具的底层，其实和前端已经很接近了——图层、组件、容器、布局关系，都能对上代码结构。所以我们做了 D2C，让设计稿直接变成起点。',
        ],
        annotation: '让他们带着自己的专业进来，而不是把专业放在门外。',
        plates: [
          { index: 'PL.03', caption: '图层结构与前端结构的对应关系', seed: 2103, variant: 'grid', ratio: 1.24 },
          { index: 'PL.04', caption: 'D2C 的第一版转换路径', seed: 2104, variant: 'branch', ratio: 1.5 },
        ],
      },
      {
        kind: 'statement',
        marker: '09 / SURPRISE',
        statement: '不规范的设计稿，比我们预想的多得多。',
        annotation: '上线之后才知道，这不是个别情况，是常态。',
      },
      {
        kind: 'contrast',
        marker: '10 / THE FIX',
        heading: '我们先想在后面补，后来发现要往前挪',
        contrast: [
          {
            tag: '先试的',
            heading: '在算法里把它修回来',
            lines: [
              '重新计算图层归属',
              '推断图层之间的结构关系',
              '针对各种错法逐个绕开',
              '投入很大，效果始终差一截',
            ],
          },
          {
            tag: '后来的',
            heading: '在源头上把它讲清楚',
            lines: [
              '做了一门「AI 友好设计稿」课程',
              '讲清楚什么样的稿子机器能读懂',
              '输入端提高一点点',
              '最终效果好得多',
            ],
          },
        ],
        annotation: '在后面修一百次，不如在前面说一次。',
      },
      {
        kind: 'uimock',
        marker: '11 / STRUCTURE',
        heading: '首页不该再是一个广场',
        body: [
          '早期的 Nocode 更像一个网站：进来是瀑布流、对话框、作品广场，适合逛，适合被种草。',
          '但当它开始承接真实项目，人们进来不是为了逛，是为了继续昨天没做完的事。逛的结构撑不住这件事。',
          '所以整体改成了工作台：左侧导航把项目、团队、作品收起来，进来就能接着干。',
        ],
        annotation: '从「网站」变成「工具」，是这次改版真正的分界。',
        mocks: [
          {
            /* 改版前：没有侧边栏。这不是省略，是当时的真实情况——
               整个首页就是一个输入框加一片作品瀑布流，
               没有任何东西承载「我的项目」这个概念 */
            title: 'Nocode · 改版前',
            badge: '结构示意',
            blocks: [
              { kind: 'prompt', placeholder: '描述你想要的网页…' },
              { kind: 'toolbar', chips: ['推荐', '最新', '电商', '官网', '工具'] },
              { kind: 'section', title: '作品广场' },
              /* 只给一行三张。
                 这一侧要说明的只是「进来是一片供人浏览的广场」，
                 一行就够；铺满两行会让整章在 720p 的屏上纵向溢出，
                 而章节是 height:100% 的横向卷轴，溢出即被裁掉。 */
              {
                kind: 'cards',
                items: [
                  { title: '生鲜电商首页', sub: '2.4k 浏览' },
                  { title: '发布会邀请函', sub: '1.8k 浏览' },
                  { title: '数据看板', sub: '960 浏览' },
                ],
              },
            ],
            caption: '进来先看别人做了什么——适合被种草，不适合接着干活。',
          },
          {
            /* 改版后：左侧导航把项目、团队、作品分层收起。
               卡片换成列表行，是因为「继续昨天的事」需要看到
               状态和时间，而不是缩略图 */
            title: 'Nocode · 工作台',
            badge: '结构示意',
            sidebar: {
              brand: 'Nocode',
              items: [
                { label: '工作台', active: true },
                { label: '最近', trailing: '12' },
                { label: '项目', group: true },
                { label: '商家后台重构', trailing: '4' },
                { label: '春季活动页', trailing: '2' },
                { label: '团队', group: true },
                { label: '增长设计组', trailing: '9' },
                { label: '模板库' },
              ],
            },
            blocks: [
              { kind: 'section', title: '继续未完成的' },
              {
                kind: 'rows',
                items: [
                  { title: '商家后台 · 订单列表', sub: '你 · 20 分钟前', tag: '进行中', accent: true },
                  { title: '春季活动页 · 主视觉', sub: '林 · 2 小时前', tag: '待合并' },
                  { title: '商家后台 · 权限设置', sub: '陈 · 昨天', tag: '已合并' },
                  { title: '数据看板 · 导出模块', sub: '你 · 3 天前', tag: '草稿' },
                ],
              },
            ],
            caption: '进来就是自己的项目与进度，左侧把项目、团队、作品分层收起。',
          },
        ],
      },
      {
        kind: 'steps',
        marker: '12 / TEAM',
        heading: '团队从设置项里搬了出来',
        body: ['早期团队藏在个人设置的二级页面，像一个附加功能。当多人协作变成主场景，它必须被看见。'],
        steps: [
          { no: '01', title: '提到一级', detail: '团队成为进入产品后就能感知到的一层关系，不再需要翻设置。' },
          { no: '02', title: '权限分层', detail: '谁能看、谁能改、谁能发布，在同一个地方说清楚。' },
          { no: '03', title: '项目归属', detail: '作品挂在项目下，项目挂在团队下，离职交接不再靠口头。' },
        ],
      },
      {
        kind: 'result',
        marker: '13 / RESULT',
        heading: '核心对象从一句话变成一个目标',
        body: [
          '最能说明这次变化的，是 Nocode 里那个「最小操作单位」换了：从 talk_id 变成了 task_id。',
        ],
        points: [
          'talk：说一句，生成一个，改不好就退回上一句',
          'task：定一个目标，围绕它持续做很多轮',
          '仓库能带进来，做完能合回去',
          '产物不只是网页——PPT、Excel、定时任务都在里面',
        ],
        plates: [
          { index: 'PL.06', caption: 'talk 与 task 的生命周期对比', seed: 2106, variant: 'branch', ratio: 1.8 },
        ],
      },
      {
        kind: 'statement',
        marker: '14 / SHIFT',
        statement: '从一次生成一个作品，到围绕一个目标持续工作。',
        annotation: 'AI 生成工具，和 AI 生产工具，差的就是这一句。',
      },
      {
        kind: 'reflection',
        marker: '15 / REFLECTION',
        heading: '回望',
        body: [
          '这个项目里我做得最多的，不是画界面，是翻译。研发那一侧的东西大多已经成熟，问题从来不是它不好，而是它只对懂的人友好。',
          '设计师在这种位置上的价值，是能同时听懂两边的话——并且愿意先自己去把另一边走一遍，再回来重新讲一次。',
        ],
        annotation: '把一个词换掉，有时候比加一个功能管用。',
      },
      { kind: 'next', marker: '16 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'nocode-four-tabs',
    cluster: 'green',
    title: 'Nocode 移动端设计',
    year: '2026',
    role: '产品 / 设计',
    summary: '一周之内，为 Nocode 想清楚手机上该留下什么。',
    archiveId: 'MEM-019',
    offset: [0.3, -0.18, 0.16],
    scale: 1.16,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Nocode\n移动端设计',
        body: [
          '用户想在见客户之前，用手机把自己做的东西打开。这件小事背后，是一次关于「什么必须留下」的取舍。',
        ],
        meta: [
          { label: 'Year', value: '2026' },
          { label: 'Role', value: '产品 · 交互 · 视觉' },
          { label: 'Duration', value: '一周，完成整体设计' },
          { label: 'Archive', value: 'MEM-019' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '需求来自一个很具体的场面',
        body: [
          '反馈里反复出现同一个画面：要见客户了，或者老板临时问起，想把刚做的页面打开看看。带电脑不方便，现场想改一句话更麻烦。',
          '他们要的不是一个完整的移动版产品，是在那个具体时刻能掏出来用的东西。',
        ],
        annotation: '需求越具体，越不该按完整功能去满足。',
      },
      {
        kind: 'contrast',
        marker: '02 / CHOICE',
        heading: '为什么不直接做 H5',
        contrast: [
          {
            tag: '方案 A',
            heading: '把网页适配到手机',
            lines: [
              '改动小，上线快',
              '要挨个处理机型、内核、尺寸',
              '文件、分享、登录都受浏览器限制',
              '体验始终差一层',
            ],
          },
          {
            tag: '方案 B',
            heading: '做微信小程序',
            lines: [
              '打开习惯已经在那里',
              '不用额外下载',
              '分享链路是现成的',
              '开发和上线都足够快',
            ],
          },
        ],
        annotation: '选小程序不是因为它更高级，是因为它更接近那个掏手机的动作。',
      },
      {
        kind: 'statement',
        marker: '03 / THE QUESTION',
        statement: 'PC 上那么多功能，手机上要全部留下吗？',
        annotation: '这是确定形态之后，马上要回答的第二个问题。',
      },
      {
        kind: 'process',
        marker: '04 / ANALYSIS',
        heading: '把 PC 缩小是行不通的',
        body: [
          'PC 端的骨架是对话框加案例广场，它假设你坐下来、有时间、要做一件完整的事。',
          '手机上的时间是碎的，屏幕是窄的。用户可能只是打开看一眼，也可能临时改一句就发出去。',
          '当时不少 AI 对话类应用的做法，是把能力全塞进对话页的二级入口，让你进了对话再慢慢找。我不想这样。',
        ],
        annotation: '同样的功能，换一个场景就要重新排优先级。',
        plates: [
          { index: 'PL.01', caption: 'PC 结构在手机上的坍塌点', seed: 1901, variant: 'wireframe', ratio: 1.5 },
        ],
      },
      {
        kind: 'statement',
        marker: '05 / DECISION',
        statement: '把入口摆在明面上，而不是藏进对话里。',
        annotation: '碎片时间里，找不到就等于没有。',
      },
      {
        kind: 'steps',
        marker: '06 / STRUCTURE',
        heading: '最后留下四个',
        body: ['判断标准只有一条：在掏出手机的那几分钟里，这件事会不会真的发生。'],
        steps: [
          { no: '01', title: '创作', detail: '手机上最核心的入口。进来继续生成、继续改，对话都在这里。' },
          { no: '02', title: '社区', detail: '为之后的运营活动和内容留的位置，让移动端能承载内容消费。' },
          { no: '03', title: '案例', detail: 'PC 端积累下来的内容资产。见客户时直接翻开就能讲。' },
          { no: '04', title: '我的', detail: '个人的项目、对话和管理，放在一个固定的地方。' },
        ],
        plates: [
          { index: 'PL.02', caption: '底部标签栏与四个一级入口', seed: 1902, variant: 'handset', ratio: 0.92 },
        ],
      },
      {
        kind: 'result',
        marker: '07 / RESULT',
        heading: '创作 / 社区 / 案例 / 我的',
        body: ['一周之内完成整套设计，从形态判断、信息架构到界面细节。'],
        points: [
          '四个一级入口，一次点击直达',
          '不复刻 PC，按移动场景重排优先级',
          '社区位置提前留出，不用等改版',
          '从需求到完整设计，一周',
        ],
        plates: [
          { index: 'PL.03', caption: '四个主界面的最终形态', seed: 1903, variant: 'handset', ratio: 1.05 },
        ],
      },
      {
        kind: 'reflection',
        marker: '08 / REFLECTION',
        heading: '回望',
        body: [
          '这个项目周期很短，但决定的事情不小：移动端不是 PC 的缩小版，它得有自己的一套一级任务。',
          '真正花时间的不是画那四个图标，是想清楚哪些东西可以不要。删掉的部分，比留下的部分更能说明判断。',
        ],
        annotation: '一周能做完，是因为前面那个问题想清楚了。',
      },
      { kind: 'next', marker: '09 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'tidal-reader',
    cluster: 'green',
    title: 'Tidal Reader',
    year: '2024',
    role: '概念、交互设计、前端实现',
    summary: '一个跟随阅读节奏起伏的长文阅读器。',
    archiveId: 'MEM-014',
    offset: [-0.34, 0.12, 0.2],
    scale: 1.24,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Tidal\nReader',
        body: ['一个会呼吸的阅读器。文字的密度决定光的涨落，阅读速度决定潮汐的周期。'],
        meta: [
          { label: 'Year', value: '2024' },
          { label: 'Role', value: 'Concept · Interaction · Frontend' },
          { label: 'Stack', value: 'React · WebGL · Rust/WASM' },
          { label: 'Archive', value: 'MEM-014' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '为什么屏幕上的长文让人疲惫',
        body: [
          '我花了三个月记录自己在屏幕上放弃一篇长文的时刻。结论出乎意料：放弃几乎从不发生在「内容变难」的地方，而发生在「视觉节奏突然变平」的地方。',
          '纸质书有天然的节奏——翻页、厚度、指尖的位置感。屏幕把这些全部抹平成一条无限滚动的灰带。我们失去的不是专注力，是地形。',
        ],
        annotation: '第 47 次放弃，发生在第 9 屏，那一页没有任何段落分隔。',
        plates: [
          { index: 'PL.01', caption: '放弃时刻的热力分布，三个月，212 次记录', seed: 1401, variant: 'scatter', ratio: 1.42 },
        ],
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '把文本变成地形',
        body: [
          '我写了一个解析器，把每个段落的句长方差、标点密度、生僻词比例映射成一条「阅读海拔线」。然后让背景的光随着这条线极缓慢地涨落。',
          '关键是慢。第一版的光变化周期是 2 秒，所有测试者都说晕。最终版本是 40 秒——慢到你不会注意，但停下来时会发现光已经完全不同了。',
        ],
        annotation: '慢到不被察觉，才是环境。',
        plates: [
          { index: 'PL.02', caption: '阅读海拔线的推导，v3 → v11', seed: 1402, variant: 'wave', ratio: 1.78 },
          { index: 'PL.03', caption: '光照周期测试矩阵', seed: 1403, variant: 'grid', ratio: 1.0 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '完读率提升 34%',
        body: ['在 1,800 名读者的 A/B 测试中，超过 3000 字的长文完读率从 41% 提升到 55%。'],
        points: [
          '平均阅读时长 +2.4 分钟',
          '主动收藏率 +18%',
          '「感觉不累」在开放反馈中出现 67 次',
          '被 3 家独立媒体采用为默认阅读模式',
        ],
        plates: [
          { index: 'PL.04', caption: '最终阅读界面，潮汐处于高位', seed: 1404, variant: 'field', ratio: 1.6 },
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '这个项目教会我一件事：最好的交互设计经常是「不被看见」的。如果有人称赞动效好看，说明它还不够好。',
          '我至今仍在用它读书。但我几乎从不注意到光在变——这大概是它最成功的地方。',
        ],
        annotation: '成功的环境设计是隐形的。',
      },
      {
        kind: 'next',
        marker: '05 / RETURN',
        heading: '这段记忆到此为止',
      },
    ],
  },

  {
    id: 'soft-latency',
    cluster: 'green',
    title: 'Soft Latency',
    year: '2023',
    role: '交互研究、原型',
    summary: '研究「等待」如何被设计成一种情绪，而非缺陷。',
    archiveId: 'MEM-009',
    offset: [0.3, -0.22, -0.16],
    scale: 1.06,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Soft\nLatency',
        body: ['所有人都在消灭加载时间。我想知道，如果把它留下来会怎样。'],
        meta: [
          { label: 'Year', value: '2023' },
          { label: 'Role', value: 'Research · Prototype' },
          { label: 'Format', value: '12 prototypes · 1 essay' },
          { label: 'Archive', value: 'MEM-009' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '瞬间完成的东西没有重量',
        body: [
          '在一个把响应时间压到 80ms 的项目里，用户反馈出现了奇怪的词：「不真实」「像假的」「不确定有没有成功」。',
          '我们花了两年削减延迟，然后发现人类需要延迟来确认因果。太快的反馈会切断动作与结果之间的心理连接。',
        ],
        annotation: '80ms 太快了，快到不像真的。',
        plates: [
          { index: 'PL.01', caption: '延迟感知实验：0 – 1200ms 的 14 档', seed: 902, variant: 'strata', ratio: 1.5 },
        ],
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '十二个原型',
        body: [
          '我做了 12 个原型，每个探索一种「有质感的等待」：墨水扩散、纸张吸水、显影液、齿轮咬合、潮汐、呼吸。',
          '最有效的不是最漂亮的，而是那些暗示了「某种物理过程正在发生」的——哪怕这个过程完全是虚构的。',
        ],
        plates: [
          { index: 'PL.02', caption: '12 个等待原型的形态索引', seed: 903, variant: 'grid', ratio: 1.1 },
          { index: 'PL.03', caption: '墨水扩散模型，帧序列', seed: 904, variant: 'field', ratio: 1.9 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '一份延迟设计指南',
        body: ['最终产出是一份内部指南，定义了四种延迟语义及其适用场景。'],
        points: [
          '确认型延迟：120 – 240ms，用于不可逆操作',
          '过程型延迟：600ms+，暗示真实计算',
          '呼吸型延迟：用于连续操作之间的节奏',
          '不应设计的延迟：导航、输入回显',
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '这是我第一次意识到，性能优化和体验设计之间存在一个非线性的拐点。更快不总是更好。',
          '后来我把这个结论用在了几乎每一个项目里，包括这个作品集本身——你现在看到的每个转场，都刻意比技术上限慢。',
        ],
        annotation: '你此刻的等待，也是被设计过的。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'ghost-cursor',
    cluster: 'green',
    title: 'Ghost Cursor',
    year: '2022',
    role: '实验、开源',
    summary: '一个记住你所有犹豫的光标。',
    archiveId: 'MEM-006',
    offset: [0.06, 0.32, -0.3],
    scale: 0.92,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Ghost\nCursor',
        body: ['它不记录你点了什么，只记录你差点点了什么。'],
        meta: [
          { label: 'Year', value: '2022' },
          { label: 'Role', value: 'Experiment · Open Source' },
          { label: 'Stars', value: '2.1k' },
          { label: 'Archive', value: 'MEM-006' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '犹豫是最诚实的数据',
        body: [
          '点击是结论，移动是思考过程。我们一直在分析结论，却扔掉了思考。',
          '一个在「删除账户」按钮上悬停了 4 秒又移开的用户，比一个直接点击的用户告诉我们更多。',
        ],
        annotation: '4 秒的悬停 = 一次未发生的流失。',
        plates: [{ index: 'PL.01', caption: '单个会话的光标轨迹，8 分钟', seed: 601, variant: 'orbit', ratio: 1.34 }],
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '把轨迹变成幽灵',
        body: [
          '我写了一个轻量库，把光标轨迹渲染成逐渐消散的拖影，并标记出所有停顿超过 800ms 的「犹豫点」。',
          '把 500 个会话叠加在一起时，页面上浮现出了一张看不见的地图：所有人都在同样的地方迟疑。',
        ],
        plates: [
          { index: 'PL.02', caption: '500 个会话的犹豫点叠加', seed: 602, variant: 'scatter', ratio: 1.62 },
          { index: 'PL.03', caption: '拖影衰减函数对比', seed: 603, variant: 'wave', ratio: 1.2 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '开源后的意外',
        body: ['它被用在了我完全没预料到的地方。'],
        points: [
          'GitHub 2.1k stars',
          '被用于无障碍研究，识别运动障碍用户的操作困难',
          '一位老师用它分析学生做题时的思维停顿',
          '一个艺术家用它生成了一整个系列的版画',
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '我做它的时候想的是转化率优化，结果它最有价值的用途全都在别处。',
          '开源的意义大概就在这里：你只负责造工具，别人负责想象它。',
        ],
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  /* ========================= PURPLE — 图书馆 / 工具与资料 ========================= */
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
    summary: '十个真实场景里调曲线，调好直接抄走。',
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
          '所以这个工具反过来做：先摆好十个真实场景——按钮填充、弹窗消散、底部面板、AI 打字，然后在场景里调曲线，当场看效果，调好复制走。',
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
        heading: '十个场景与默认时长',
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
        heading: '几条自己攒下来的经验',
        points: [
          '入场用 ease-out｜元素落到位要有减速，冲进来再停住才像有重量。',
          '离场用 ease-in｜走的时候加速，干脆，不拖泥带水。',
          '过冲要克制｜弹跳和回弹只给点赞、收藏这类即时反馈，界面转场用了会晕。',
          '拆开调｜透明度和位移分别给曲线，一起调很难同时对。',
          '时长和距离挂钩｜移动得越远，时间要越长，不然像被弹开。',
          '同类动作统一｜同一个产品里，所有弹窗共用一条，不要每处各调各的。',
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
      { kind: 'next', marker: 'LIB-007 / END', heading: '这份资料到此为止' },
    ],
  },

  {
    id: 'salt-index',
    cluster: 'purple',
    title: 'The Salt Index',
    year: '2024',
    role: '摄影、编辑、书籍设计',
    summary: '在四片盐湖上拍摄的、关于消失的摄影书。',
    archiveId: 'MEM-016',
    offset: [0.28, 0.18, 0.24],
    scale: 1.3,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'The Salt\nIndex',
        body: ['四片正在消失的盐湖，三年，1,140 张底片，最终留下 58 张。'],
        meta: [
          { label: 'Year', value: '2022 – 2024' },
          { label: 'Role', value: 'Photography · Editing · Book Design' },
          { label: 'Format', value: '224pp · 58 plates' },
          { label: 'Archive', value: 'MEM-016' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '水退去之后留下的是索引',
        body: [
          '盐湖干涸时不会一次消失。它退去，留下一圈盐痕；再退，再留一圈。每一圈都是一个年份的索引。',
          '我意识到我拍的不是风景，是一份地质学意义上的档案目录——大地自己记录的时间表。',
        ],
        annotation: '每一道盐痕都是一次退场的签名。',
        plates: [{ index: 'PL.01', caption: '第一次勘景，盐痕的同心结构', seed: 1601, variant: 'strata', ratio: 1.5 }],
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '三年，四次返回',
        body: [
          '我在同样的四个坐标点，每年同一周返回一次，用同一台 4×5 相机、同样的焦距重拍。',
          '编辑阶段比拍摄更痛苦。1,140 张里要选 58 张，标准不是「好看」，而是「这张是否让相邻两张之间产生时间」。',
        ],
        annotation: '选片的标准不是单张，是间隙。',
        plates: [
          { index: 'PL.02', caption: '同一坐标，2022 / 2023 / 2024', seed: 1602, variant: 'field', ratio: 2.1 },
          { index: 'PL.03', caption: '编辑台，第 6 轮排序', seed: 1603, variant: 'grid', ratio: 1.28 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '一本会变色的书',
        body: ['书用了一种遇湿会留下永久痕迹的特种纸。读者的手指会在书上留下自己的索引。'],
        points: [
          '首印 800 册，三个月售罄',
          '入围 2024 年度摄影书奖',
          '两家美术馆收藏',
          '每一本在读完后都不一样',
        ],
        plates: [{ index: 'PL.04', caption: '成书，第 112 页展开', seed: 1604, variant: 'field', ratio: 1.7 }],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '做这本书的三年里，其中一片湖彻底消失了。最后一次去的时候，我没有按快门。',
          '有些东西记录下来是为了留住，有些是为了确认它真的走了。',
        ],
        annotation: '最后一次，我没有拍。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'atlas-of-almost',
    cluster: 'purple',
    title: 'Atlas of Almost',
    year: '2023',
    role: '艺术指导、装置',
    summary: '一个只展出未完成作品的展览。',
    archiveId: 'MEM-012',
    offset: [-0.32, -0.24, -0.12],
    scale: 1.1,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Atlas of\nAlmost',
        body: ['向 40 位创作者征集他们放弃的作品。展出的全部是未完成。'],
        meta: [
          { label: 'Year', value: '2023' },
          { label: 'Role', value: 'Art Direction · Installation' },
          { label: 'Scale', value: '40 contributors · 620m²' },
          { label: 'Archive', value: 'MEM-012' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '我们只看见成品',
        body: [
          '每个创作者的硬盘里都有一个文件夹，装着那些走到 70% 就停下的东西。它们数量远超完成品，却从不被看见。',
          '我想做一个展览，把这个文件夹打开。',
        ],
        annotation: '放弃的比完成的多十倍。',
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '最难的是说服',
        body: [
          '征集比想象中困难。展示失败需要的勇气，远大于展示成功。前两个月只有 3 人回应。',
          '转折点是我先把自己的 11 个废弃项目公开了。之后一个月内收到了 37 份投稿。',
        ],
        annotation: '我得先脱掉自己的衣服。',
        plates: [
          { index: 'PL.02', caption: '征集回应曲线，转折点在第 9 周', seed: 1202, variant: 'wave', ratio: 1.55 },
          { index: 'PL.03', caption: '展陈方案，未完成度作为动线', seed: 1203, variant: 'grid', ratio: 1.34 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '按「未完成度」排列的展览',
        body: ['作品按停止时的完成百分比排列，从 5% 到 97%。越往深处，越接近完成，也越令人心碎。'],
        points: [
          '11,000 名观众',
          '展厅尽头的留言墙收到 3,400 条「我也有一个」',
          '6 位参展者在展后完成了他们的作品',
          '巡展至 3 座城市',
        ],
        plates: [{ index: 'PL.04', caption: '97% 展区，最后一件', seed: 1204, variant: 'field', ratio: 1.8 }],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '有 6 个人在看完展览后回去完成了自己的作品。这个数字比任何媒体报道都让我满意。',
          '但也有人告诉我，看完之后终于能心安理得地永远放弃了。我觉得那也很好。',
        ],
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'quiet-type',
    cluster: 'purple',
    title: 'Quiet Type',
    year: '2021',
    role: '字体设计',
    summary: '为临终关怀机构设计的一套字体。',
    archiveId: 'MEM-004',
    offset: [0.04, 0.3, -0.28],
    scale: 0.95,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Quiet\nType',
        body: ['一套不催促任何人的字体。'],
        meta: [
          { label: 'Year', value: '2021' },
          { label: 'Role', value: 'Typeface Design' },
          { label: 'Weights', value: '4 weights · 1,240 glyphs' },
          { label: 'Archive', value: 'MEM-004' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '医院的字体都在赶时间',
        body: [
          '临终关怀病房用的标识字体，和急诊室是同一套。高对比、紧字距、强调可读速度——它们在催促。',
          '但这里没有人需要被催促。这里需要的是一种愿意等待的字形。',
        ],
        annotation: '急诊的字体不该出现在这里。',
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '把速度从字形里拿掉',
        body: [
          '我加宽了字距，降低了笔画对比，把所有的尖角改成极小的圆角，让终端笔画略微上扬——像一句没有说完的话。',
          '最难的是标点。句号被我做得比常规小 18%，因为在这个语境里，结束不该被强调。',
        ],
        annotation: '句号小了 18%。',
        plates: [
          { index: 'PL.02', caption: '终端笔画的 9 次迭代', seed: 402, variant: 'grid', ratio: 1.0 },
          { index: 'PL.03', caption: '字距测试，病房实际照明条件下', seed: 403, variant: 'strata', ratio: 1.7 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '在 14 家机构使用',
        body: ['字体免费授权给所有非营利临终关怀机构。'],
        points: [
          '4 个字重，1,240 个字形',
          '14 家机构采用',
          '护理人员反馈：家属阅读指引时的提问减少',
          '永久免费，非商业授权',
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '一位护士长告诉我，有位家属说「这里的字看起来不那么吓人」。她不知道为什么，也没注意到字体变了。',
          '这是我收到过最好的评价。',
        ],
        annotation: '她没注意到，但她感觉到了。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  /* ========================= YELLOW — 研究 / 影像 / 概念 ========================= */
  {
    id: 'inherited-noise',
    cluster: 'yellow',
    title: 'Inherited Noise',
    year: '2024',
    role: '研究、影像',
    summary: '关于家族录像带降质过程的一项研究。',
    archiveId: 'MEM-015',
    offset: [0.0, 0.24, 0.22],
    scale: 1.18,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Inherited\nNoise',
        body: ['我家的录像带正在以每年 2.3% 的速度失去自己。'],
        meta: [
          { label: 'Year', value: '2024' },
          { label: 'Role', value: 'Research · Moving Image' },
          { label: 'Source', value: '31 tapes · 1987 – 2004' },
          { label: 'Archive', value: 'MEM-015' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '磁带在遗忘',
        body: [
          '我数字化家里 31 盘旧录像带时，发现同一段婚礼录像，我十年前转录的版本和现在的版本不一样——噪点更多，颜色偏移，某些帧彻底丢失。',
          '记忆载体本身也在遗忘。而且它遗忘的方式是有规律的。',
        ],
        annotation: '同一段婚礼，十年后少了 3 帧。',
        plates: [{ index: 'PL.01', caption: '同一帧，2014 转录 vs 2024 转录', seed: 1501, variant: 'field', ratio: 1.9 }],
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '测量遗忘的速度',
        body: [
          '我建立了一个模型，对比两次转录之间的信噪比、色度偏移和丢帧位置，计算出每盘带子的年均衰减率。',
          '有趣的是：被反复播放的带子衰减更快。我们最爱的那些记忆，损坏得最严重。',
        ],
        annotation: '最常看的那盘，磨损最厉害。',
        plates: [
          { index: 'PL.02', caption: '31 盘带子的衰减率分布', seed: 1502, variant: 'scatter', ratio: 1.45 },
          { index: 'PL.03', caption: '播放次数 × 衰减率，强相关', seed: 1503, variant: 'wave', ratio: 1.3 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '一部 22 分钟的影片',
        body: ['我把衰减数据反过来用，做了一部影片：画面按真实衰减率实时劣化，22 分钟里完全消失。'],
        points: [
          '22 分钟单频道影像',
          '在 4 个影展放映',
          '衰减速率完全依据真实测量数据',
          '每次放映的拷贝都比上一次更差',
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '做完这个项目后我把所有带子做了无损归档，然后再也没看过。',
          '我意识到我保存它们不是为了看，是为了知道它们还在。',
        ],
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'field-notes-fog',
    cluster: 'yellow',
    title: 'Field Notes on Fog',
    year: '2022',
    role: '田野调查、写作',
    summary: '在一座常年有雾的城市待了 60 天。',
    archiveId: 'MEM-008',
    offset: [-0.3, -0.2, -0.18],
    scale: 1.02,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Field Notes\non Fog',
        body: ['60 天，一座雾中的城市，以及人们如何在看不见时导航。'],
        meta: [
          { label: 'Year', value: '2022' },
          { label: 'Role', value: 'Fieldwork · Writing' },
          { label: 'Duration', value: '60 days' },
          { label: 'Archive', value: 'MEM-008' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '当视觉失效',
        body: [
          '这座城市一年有 200 天笼罩在雾里，能见度经常不足 30 米。我想知道当视觉这个主导感官被削弱时，人怎么重建空间认知。',
          '答案是声音、气味和肌肉记忆。当地人能通过脚下路面的细微坡度变化判断自己在哪。',
        ],
        annotation: '他们用脚认路。',
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '记录看不见的地标',
        body: [
          '我采访了 44 位居民，请他们画出「雾天的城市地图」。没有一个人画建筑，他们画的是：面包店的气味、某段路的回声、一处永远漏水的排水管。',
          '把 44 张图叠起来，浮现出一座完全不同的城市——由非视觉地标构成。',
        ],
        plates: [
          { index: 'PL.02', caption: '44 张雾天地图的叠合', seed: 802, variant: 'orbit', ratio: 1.5 },
          { index: 'PL.03', caption: '非视觉地标的类型分布', seed: 803, variant: 'grid', ratio: 1.15 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '一本 180 页的田野笔记',
        body: ['成果是一本笔记，包含 44 张地图、一份非视觉地标索引，和 60 天的日记。'],
        points: [
          '180 页，手工装订 300 册',
          '44 份居民绘图全文收录',
          '被两所大学列为城市人类学参考读物',
          '其中 7 个地标在出版时已经消失',
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '第 38 天，我在雾里迷路了两个小时。那是整个项目里我唯一真正理解了它的时刻。',
          '研究一件事和经历一件事之间，隔着一场真正的恐慌。',
        ],
        annotation: '第 38 天，我真的迷路了。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'unit-of-attention',
    cluster: 'yellow',
    title: 'A Unit of Attention',
    year: '2020',
    role: '概念研究',
    summary: '试图为「注意力」找到一个可测量的单位。',
    archiveId: 'MEM-002',
    offset: [0.3, 0.06, -0.26],
    scale: 0.9,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'A Unit of\nAttention',
        body: ['一次失败的尝试，但我仍然认为问题是对的。'],
        meta: [
          { label: 'Year', value: '2020' },
          { label: 'Role', value: 'Conceptual Research' },
          { label: 'Status', value: 'Unresolved' },
          { label: 'Archive', value: 'MEM-002' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '我们在交易一种没有单位的东西',
        body: [
          '整个互联网经济建立在「注意力」之上，但注意力没有单位。我们用时长、点击、曝光来代替它——这些都是代理指标，不是注意力本身。',
          '没有单位就没有真正的核算。我想试试能不能定义一个。',
        ],
        annotation: '用时长衡量注意力，像用体重衡量智力。',
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '四次失败的定义',
        body: [
          '我尝试过四种定义：基于信息熵的、基于生理唤醒的、基于事后回忆准确率的、基于机会成本的。',
          '每一种都在某个场景下成立，在另一个场景下崩溃。回忆准确率模型最接近，但它无法测量「当下正在发生」的注意力——只能事后测。',
        ],
        plates: [
          { index: 'PL.02', caption: '四种定义的适用域与崩溃点', seed: 202, variant: 'strata', ratio: 1.6 },
          { index: 'PL.03', caption: '回忆准确率实验，n=120', seed: 203, variant: 'scatter', ratio: 1.25 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '没有结论',
        body: ['这个项目没有产出可用的单位。它产出的是一份关于「为什么这很难」的说明。'],
        points: [
          '4 种定义模型，全部有边界条件',
          '一篇 32 页的未发表论文',
          '最终结论：注意力可能本质上不可通约',
          '状态：未解决',
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '五年过去了，我还是没有答案。但这个问题改变了我做每一个产品的方式——如果我无法测量我在索取什么，我至少可以少索取一点。',
          '有些项目的价值不在于解决问题，而在于让你永远无法回到提出问题之前。',
        ],
        annotation: '仍然未解决。大概会一直这样。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'the-weight-of-defaults',
    cluster: 'yellow',
    title: 'The Weight of Defaults',
    year: '2021',
    role: '研究、写作',
    summary: '关于默认选项如何在沉默中决定了大多数人的一生。',
    archiveId: 'MEM-005',
    offset: [-0.18, -0.1, 0.28],
    scale: 1.0,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'The Weight\nof Defaults',
        body: ['没有人选择默认值，但默认值选择了所有人。'],
        meta: [
          { label: 'Year', value: '2021' },
          { label: 'Role', value: 'Research · Writing' },
          { label: 'Format', value: 'Essay · Field Study' },
          { label: 'Archive', value: 'MEM-005' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '一个开关，改变了四千万人',
        body: [
          '2020 年，某个产品把一个隐私开关的默认状态从「关」改成了「开」。没有公告，没有弹窗。三周后，四千万用户的数据流向发生了改变——其中主动做出选择的人，不到 4%。',
          '我想知道：当我们说「用户选择了」的时候，我们到底在说什么。',
        ],
        annotation: '96% 的人从未打开过那个设置页。',
        plates: [
          { index: 'PL.01', caption: '默认值变更前后的行为分布', seed: 601, variant: 'strata', ratio: 1.5 },
        ],
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '我翻了 240 个产品的初始设置',
        body: [
          '我记录了 240 个常用产品的全部默认开关——共 3,180 项。然后按「对谁有利」分类：对用户有利的占 31%，对平台有利的占 54%，中性的占 15%。',
          '更值得注意的是位置：对平台有利的默认项，平均需要 3.2 次点击才能找到；对用户有利的，平均 1.4 次。',
        ],
        annotation: '藏起来的东西，往往是不想被改的东西。',
        plates: [
          { index: 'PL.02', caption: '3,180 项默认设置的归类与深度', seed: 602, variant: 'grid', ratio: 1.34 },
          { index: 'PL.03', caption: '「点击深度 vs 受益方」的相关性', seed: 603, variant: 'scatter', ratio: 1.2 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '一篇文章，和一份清单',
        body: ['研究最终成为一篇长文和一份开源清单，供设计师自查自己产品的默认值伦理。'],
        points: [
          '3,180 项默认设置完成编目',
          '清单被 60+ 团队引入设计评审',
          '两家公司据此公开修改了默认项',
          '原文被翻译成 5 种语言',
        ],
        plates: [
          { index: 'PL.04', caption: '默认值伦理自查清单，v2', seed: 604, variant: 'field', ratio: 1.62 },
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '做完这个研究之后，我再也无法轻松地设置一个默认值了。每一次我都会想：如果 96% 的人永远不会改这里，我凭什么替他们决定？',
          '设计师最大的权力不在于提供选择，而在于决定什么是「不选择时的样子」。',
        ],
        annotation: '默认值是设计师最沉默、也最沉重的一票。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'room-tone',
    cluster: 'yellow',
    title: 'Room Tone',
    year: '2019',
    role: '声音采集、装置',
    summary: '收集空房间的声音，发现每个空间都有自己的基频。',
    archiveId: 'MEM-001',
    offset: [0.12, 0.16, 0.3],
    scale: 0.94,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Room\nTone',
        body: ['电影录音师的行规：每到一个场景，先录 30 秒的「空」。'],
        meta: [
          { label: 'Year', value: '2019' },
          { label: 'Role', value: 'Field Recording · Installation' },
          { label: 'Duration', value: '14 months' },
          { label: 'Archive', value: 'MEM-001' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '没有真正安静的房间',
        body: [
          '我从一位录音师那里学到「room tone」这个词——每个空间在无人说话时，仍然在发出声音。空调、墙体、电流、远处的交通，混合成一个只属于这个房间的低频。',
          '他说：「换了房间不重录 room tone，剪辑时接缝会很明显。观众说不出哪里不对，但就是不对。」',
        ],
        annotation: '安静不是没有声音，是一种特定的声音。',
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '14 个月，103 个空房间',
        body: [
          '我带着一支录音笔，录了 103 个空房间：医院走廊、废弃泳池、图书馆书库、凌晨的地铁站、朋友搬空的旧公寓。每个录 10 分钟。',
          '做完频谱分析后发现，几乎每个空间都有一个显著的主峰频率。图书馆是 47Hz，泳池是 112Hz。我开始把它们当作房间的「名字」。',
        ],
        annotation: '朋友搬空的公寓：63Hz。我录了两次，确认没错。',
        plates: [
          { index: 'PL.02', caption: '103 个空间的频谱指纹', seed: 102, variant: 'wave', ratio: 1.85 },
          { index: 'PL.03', caption: '主峰频率的分布与聚类', seed: 103, variant: 'scatter', ratio: 1.16 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '一间可以走进去的档案',
        body: ['最终成为一个装置：走进一个全白的房间，103 段 room tone 按你的位置缓慢交叉淡入。'],
        points: [
          '103 段实地录音，共 17 小时',
          '在两个城市展出，累计 6 周',
          '观众平均停留 11 分钟',
          '全部原始录音已开放下载',
        ],
        plates: [
          { index: 'PL.04', caption: '装置现场，声场分区示意', seed: 104, variant: 'field', ratio: 1.55 },
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '这是我做过最不「有用」的项目，却是被问起最多的一个。我想因为它触到了一件所有人都隐约知道、但从未说出口的事：空间是有身体的。',
          '那间 63Hz 的公寓后来被重新装修了。我手上这 10 分钟，可能是它最后的声音。',
        ],
        annotation: '有些档案的意义，要等到对象消失之后才成立。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },

  {
    id: 'margin-notes',
    cluster: 'green',
    title: 'Margin Notes',
    year: '2023',
    role: '产品设计、前端实现',
    summary: '一个只能在页边写字的笔记工具，限制反而带来了更好的思考。',
    archiveId: 'MEM-011',
    offset: [0.26, -0.14, -0.22],
    scale: 1.06,
    chapters: [
      {
        kind: 'cover',
        marker: '00 / COVER',
        heading: 'Margin\nNotes',
        body: ['最窄的地方，往往写下最重要的话。'],
        meta: [
          { label: 'Year', value: '2023' },
          { label: 'Role', value: 'Product · Frontend' },
          { label: 'Stack', value: 'TypeScript · CRDT · IndexedDB' },
          { label: 'Archive', value: 'MEM-011' },
        ],
      },
      {
        kind: 'origin',
        marker: '01 / ORIGIN',
        heading: '空白页的暴政',
        body: [
          '我有七个笔记应用，每个都有一片无限大的空白页。七个都是空的。',
          '但我书架上那些二手书的页边，密密麻麻全是前一位读者的字。同样是写字，为什么一个写满了，一个写不出来？',
        ],
        annotation: '无限的自由，等于无处下笔。',
      },
      {
        kind: 'process',
        marker: '02 / PROCESS',
        heading: '把空间收窄到 180px',
        body: [
          '我做了一个只有页边可写的阅读器。正文区域完全只读，笔记只能写在右侧 180px 宽的窄栏里，单条上限 280 字。',
          '测试时我以为大家会抱怨太窄。结果相反——写作频率比无限画布版本高了 3 倍多。约束消除了「要写得完整」的压力。',
        ],
        annotation: '280 字不是限制，是许可：你不必写完。',
        plates: [
          { index: 'PL.02', caption: '栏宽 A/B 测试：120 / 180 / 240 / ∞', seed: 1102, variant: 'grid', ratio: 1.3 },
          { index: 'PL.03', caption: '书写频率与栏宽的关系', seed: 1103, variant: 'wave', ratio: 1.7 },
        ],
      },
      {
        kind: 'result',
        marker: '03 / RESULT',
        heading: '人们终于开始写了',
        body: ['上线一年，用户的人均笔记条数是他们此前在通用笔记工具中的 3.4 倍。'],
        points: [
          '人均每本书 24 条页边笔记',
          '留存率 61%（行业同类约 20%）',
          '完全本地优先，无账号即可使用',
          '笔记导出为纯 Markdown',
        ],
        plates: [
          { index: 'PL.04', caption: '页边笔记的最终形态', seed: 1104, variant: 'field', ratio: 1.58 },
        ],
      },
      {
        kind: 'reflection',
        marker: '04 / REFLECTION',
        heading: '回望',
        body: [
          '这个项目让我对「强大」这个词警惕起来。我们总以为给用户更多能力就是更好，但大多数时候，人们卡住不是因为工具不够强，而是因为选择太多。',
          '设计的一部分工作，是替人把不必要的可能性关掉。',
        ],
        annotation: '好的约束不是墙，是扶手。',
      },
      { kind: 'next', marker: '05 / RETURN', heading: '这段记忆到此为止' },
    ],
  },
];

export const PROJECTS_BY_CLUSTER = {
  green: PROJECTS.filter((p) => p.cluster === 'green'),
  purple: PROJECTS.filter((p) => p.cluster === 'purple'),
  yellow: PROJECTS.filter((p) => p.cluster === 'yellow'),
} as const;

export const getProject = (id: string | null) =>
  id ? PROJECTS.find((p) => p.id === id) ?? null : null;
