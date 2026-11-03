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
  {
    id: 'nocode-talk-to-task',
    cluster: 'green',
    title: 'Nocode Task 产品重构',
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
        heading: 'Nocode Task\n产品重构',
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
