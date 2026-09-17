import * as THREE from 'three';

/**
 * 荧光光斑（memory motes）着色器。
 *
 * 每个粒子是一个 point sprite，在 fragment 中程序化生成一个
 * 「弥散、柔焦、边缘无限衰减」的光斑——不使用贴图，
 * 因为贴图的边界会破坏液体中悬浮物的无界感。
 *
 * 顶点着色器负责：
 *   - 多频率噪声漂浮（呼吸 / 偏移 / 互相牵引）
 *   - 指针水波扰动
 *   - 群聚焦时的收拢与退散
 */

export const motesVertexShader = /* glsl */ `
  precision highp float;

  attribute vec3 aOffset;      // 粒子在群内的基准位置
  attribute float aSize;       // 基准大小
  attribute float aSeed;       // 随机种子
  attribute float aBright;     // 基准亮度
  attribute float aProjectIdx; // 归属项目索引，-1 表示纯氛围粒子
  attribute float aTrail;      // 拖尾位置：0 = 头部，1 = 尾端

  uniform float uTime;
  uniform vec3  uClusterPos;   // 该群在盆中的锚点
  uniform vec2  uPointer;      // 指针，盆平面坐标
  uniform float uPointerForce; // 指针影响强度
  uniform float uFocus;        // 0 = 远景, 1 = 被聚焦近景
  uniform float uDim;          // 0 = 正常, 1 = 完全退散虚化
/* 悬停用四个 uniform 表达，而不是一个索引。

   索引本身不能插值：从 3 号渐变到 7 号会依次扫过 4/5/6，
   沿途的光斑都会闪一下。所以「是哪一个」保持整数硬切，
   「亮多少」交给单独的 amount，并额外留一个正在消退的
   槽位（Prev），这样切换悬停时旧光斑能自己淡下去，
   而不是瞬间掉回底色。 */
uniform float uHoverProject;    // 当前悬停的项目索引，-1 无
uniform float uHoverAmount;     // 当前项亮起程度 0~1
uniform float uHoverPrev;       // 上一个悬停项的索引，-1 无
uniform float uHoverPrevAmount; // 上一项残留的亮度 0~1
/* 整群级别的「被选中」程度 0~1。

   与 uHoverAmount 是两件事：后者说的是「鼠标正指着哪一颗」，
   而这个说的是「这一群此刻是不是被关注的对象」——在盆里被
   悬停、或者已经进入了它。两者都会让光斑从银白回到本色，
   只是群级的更弱，留出余地给单颗的悬停。 */
uniform float uClusterTint;
uniform float uPixelRatio;
  uniform float uDive;         // 下潜蓄力 0~1

  varying float vBright;
  varying float vSeed;
  varying float vFocus;
  varying float vDim;
  varying float vHot;
  varying float vHover;
  varying float vTint;
  varying float vTrail;

  /* 摆动位移——抽成函数，因为拖尾要用不同的 t 反复求值。

     光斑不在盆中游走或环绕，只在自己的位置上轻轻晃动。
     用三个不同频率的正弦叠加（而非噪声漂移），
     保证运动是「有界的往复」而不是「无界的游荡」——
     它们永远回到自己的位置。

     三个频率刻意取无公约数的比值，合成周期很长，
     肉眼不会察觉到重复。

     因为位置是时间的纯函数，把 t 往回拨就能得到它过去
     所在的位置——拖尾就是这么算出来的，不需要缓存历史帧。 */
  vec3 swayAt(float t, float ph) {
    vec3 s;
    s.x = sin(t * 0.83 + ph) * 0.52
        + sin(t * 0.41 + ph * 1.7) * 0.33
        + sin(t * 0.23 + ph * 2.9) * 0.15;
    s.y = sin(t * 0.67 + ph * 2.1) * 0.52
        + sin(t * 0.29 + ph) * 0.33
        + sin(t * 0.19 + ph * 1.4) * 0.15;
    s.z = sin(t * 0.75 + ph * 1.3) * 0.52
        + sin(t * 0.37 + ph * 2.4) * 0.33
        + sin(t * 0.21 + ph * 0.8) * 0.15;
    return s;
  }

  // --- 简易 3D 噪声 ---
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                       dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                   mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                       dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                       dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                   mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                       dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
  }

  void main() {
    vSeed = aSeed;
    vFocus = uFocus;
    vDim = uDim;
    vTrail = aTrail;

    vec3 pos = uClusterPos + aOffset;

    /* ---- 1. 原地微摆（含拖尾采样）----

       头部节点（aTrail = 0）用当前时间；尾部节点按自己的
       aTrail 向前回拨，于是停在这颗光斑「刚刚待过的地方」，
       串起来就是一条真实的运动轨迹。

       尾巴长度因此自动跟随速度：摆得快时相邻采样点拉得开，
       尾巴变长；几乎静止时各节点重叠成一点，尾巴消失。

       回拨步长看似很大，其实必要：摆动频率很低（系数 0.19~0.83），
       回拨零点几个时间单位的话位置几乎没变，尾长只有光斑直径的
       百分之几，肉眼完全看不见。实测取 2.5 / 1.8 时，尾长约等于
       光斑直径的 0.9~1.0 倍——能看出是拖尾，又不会长到够到邻居。

       聚焦时反而调小：近景摆幅是远景的三倍，同样的回拨会把尾巴
       拉得过长，所以用更小的步长抵消。 */
    float t = uTime * 0.62;
    float ph = aSeed * 6.283;

    float trailStep = mix(2.5, 1.8, uFocus);
    vec3 sway = swayAt(t - aTrail * trailStep, ph);

    /* 摆动幅度。远景下光斑本就密集，幅度需要克制；
       聚焦后彼此拉开了距离，可以摆得更明显一些。

       注意：这里先不加到 pos 上。下面第 4 步的聚焦外扩会把 pos
       重写成「方向 × 重算半径」，任何提前叠加的径向位移都会被
       归一化掉——那正是之前摆动几乎看不出来的原因。
       所以摆动留到外扩之后再叠。

       改幅度时记得同步 HitZones 里命中球的半径，
       否则光斑会摆出自己的可点击范围。 */
    float swayAmp = mix(0.11, 0.32, uFocus);
    vec3 swayOffset = sway * swayAmp;

    /* ---- 2. 呼吸 ----

       原本是单个正弦、频率固定 0.72，所有光斑只有相位不同。
       但相位不同只是错开了起跑点，节奏是完全一致的——整群
       共用一个 8.7 秒的拍子，眼睛会自动捕捉到这个共同周期，
       于是看起来像在一起胀缩。光靠随机相位解决不了。

       现在三件事一起改：

       1) 每颗光斑有自己的速率。用 aSeed 的高位小数取出一个
          与相位无关的随机数，把基频调制到 0.68~1.32 倍。
          周期因此散落在 14~27 秒之间，颗与颗差出近两倍，
          再也凑不成一个共同的拍子。

       2) 两个无理数倍频的正弦叠加（1.618 是黄金比，与基频
          不可通约）。合成波形不再是规整的正弦，起伏有快有慢，
          且永不精确重复。

       3) 基频从 0.72 降到 0.34，整体慢了一倍有余。

       拖尾节点的呼吸仍跟着 aTrail 回拨，否则整条尾巴会同步
       胀缩，像一根会呼吸的棍子而不是拖尾。回拨量也按各自的
       速率缩放，快慢不同的光斑尾巴才不会错位。 */
    // fract(aSeed * 7.31) 与 aSeed 本身几乎不相关，
    // 于是「快慢」和「起点」是两个独立的随机量
    // （相位直接用上面摆动已算好的 ph）
    float bRate = 0.34 * (0.68 + fract(aSeed * 7.31) * 0.64);
    float bt = (uTime - aTrail * 0.28) * bRate;
    float breathe = (sin(bt + ph) * 0.62
                   + sin(bt * 1.618 + ph * 2.4) * 0.38) * 0.5 + 0.5;

    /* 每颗的呼吸深浅也不同：绕中点 0.5 缩放。
       有的光斑起伏明显，有的几乎平稳，整群因此更像一片
       各自为政的活物，而不是同一套动画的多个实例。 */
    breathe = 0.5 + (breathe - 0.5) * (0.75 + fract(aSeed * 3.77) * 0.5);

    /* ---- 3. 指针的影响 ----
       只提亮，不位移。

       原本这里会把光斑朝背离指针的方向推开，但每颗光斑的推开
       方向都由「它相对指针的角度」决定——鼠标一动，整群的位移
       方向就跟着扫一圈，观感正是「光斑绕着鼠标转」。

       现在指针只负责「照亮」靠近它的光斑：位置完全不受影响，
       光斑始终停在自己的坐标上。 */
    vec2 toPointer = pos.xz - uPointer;
    float d = length(toPointer);
    float hot = exp(-d * d * 1.35) * uPointerForce;

    // ---- 4. 聚焦：粒子整体外扩，且中心被「掏空」 ----
    // 等比放大不会改变相对堆叠关系（叠在一起的放大后依然叠），
    // 所以这里对半径做幂次重映射：r' = R * (r/R)^k，k < 1 时
    // 内层粒子被推向外侧的幅度远大于外层，中心因此被撑开。
    vec3 toCenter = pos - uClusterPos;
    float rLen = length(toCenter);

    if (rLen > 0.0001) {
      vec3 dir = toCenter / rLen;

      const float R_REF = 0.75;          // 参考半径
      float nr = clamp(rLen / R_REF, 0.0, 1.6);
      // k 从 1.0（不变形）过渡到 0.55（强烈外推）
      float k = mix(1.0, 0.55, uFocus);
      float expanded = pow(nr, k) * R_REF;

      // 整体再放大，并保证一个最小外扩半径，杜绝粒子叠在原点
      float minR = 0.2 * uFocus;
      expanded = max(expanded, minR);
      expanded *= mix(1.0, 1.85, uFocus);

      pos = uClusterPos + dir * expanded;

      // 用 seed 给每颗粒子一点独立的外扩差异，避免变成规则球壳
      pos += dir * (aSeed - 0.5) * 0.16 * uFocus;

      toCenter = pos - uClusterPos;
    }

    // 外扩已经定好每颗粒子的位置，现在才叠加摆动——
    // 这样它是真正的「在自己位置上晃动」，不会被半径重算抹掉
    pos += swayOffset;

    // 纵深展开：项目粒子按各自的 z 分层，形成空间厚度
    pos.y += aOffset.z * uFocus * 0.8;

    // 下潜蓄力时，粒子被轻微「吸」向中心，制造张力
    pos -= toCenter * uDive * 0.09 * uFocus;

    // ---- 5. 退散：未聚焦的群推向盆边缘并下沉 ----
    pos.xz *= mix(1.0, 1.38, uDim);
    pos.y -= uDim * 0.42;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // ---- 6. 大小 ----
    float size = aSize;
    /* 呼吸：范围从 0.74~1.3 扩到 0.6~1.44。

       注意 breathe 会略微溢出 [0,1]——两个正弦叠加后本就
       可能超过 ±1，再乘上每颗不同的深浅系数（最高 1.25 倍）
       更是如此。所以实际尺寸倍率会比这里写的区间更宽，
       实测约 0.5~1.53，最大与最小差出 3 倍（原来只有 1.76 倍）。

       没有取更大的值，是因为光斑胀到 1.6 倍以上时，密集处的
       弥散区会连成一大片，失掉「一颗一颗」的形态。 */
    size *= mix(0.6, 1.44, breathe);
    size *= mix(1.0, 2.45, uFocus);
    size *= 1.0 + hot * 0.55;
    /* 悬停的光斑放大——不再依赖 uFocus，盆视角下也要有反馈。
       当前项与消退项各算一次，取较大者：切换悬停的瞬间，
       旧光斑仍带着残余亮度，两者自然交叠。 */
    float matchCur  = step(0.5, 1.0 - abs(aProjectIdx - uHoverProject)) * step(0.0, uHoverProject);
    float matchPrev = step(0.5, 1.0 - abs(aProjectIdx - uHoverPrev))    * step(0.0, uHoverPrev);
    float isHovered = max(matchCur * uHoverAmount, matchPrev * uHoverPrevAmount);

    /* 上色用的量要在尾巴衰减之前取。

       下面那行会让尾部节点的 isHovered 衰减到两成多——那对
       「放多大」是对的（尾巴不该跟着胀成一根粗棒），但对
       「什么颜色」是错的：头部染上本色而尾巴还留在银白，
       一颗光斑会被劈成两截。颜色应当整条一起变，
       所以在这里先存一份未经衰减的值。 */
    vTint = clamp(max(isHovered, uClusterTint), 0.0, 1.0);

    /* 悬停反馈沿尾巴衰减，而不是整条一起胀大。
       整条同时放大会把拖尾变成一根粗棒，
       只让头部亮起来，尾巴才像被带动的余辉。 */
    isHovered *= 1.0 - aTrail * 0.75;
    size *= 1.0 + isHovered * 0.32;
    size *= mix(1.0, 2.1, uDim); // 虚化时变大变淡，模拟失焦

    /* 尾部收窄。

       用 aTrail² 而不是线性：头部附近几乎不收，越往后收得
       越快，形成一个有尖端的水滴形，而不是等粗的棍子。
       保留 0.22 的下限，尾尖仍是个柔和的光点而不是硬断。 */
    size *= mix(1.0, 0.22, aTrail * aTrail);

    gl_PointSize = size * uPixelRatio * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    /* 亮度也跟着呼吸起伏，与大小变化同相，强化脉动感。

       范围从 0.78~1.22 扩到 0.62~1.32，但没有像尺寸那样
       成比例放大——亮度压得太低会让光斑周期性地“消失”，
       而不是呼吸。尺寸负责「张」，亮度只做辅助。 */
    vBright = aBright * mix(0.62, 1.32, breathe);
    vHot = hot;
    vHover = isHovered;
  }
`;

export const motesFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vBright;
  varying float vSeed;
  varying float vFocus;
  varying float vDim;
  varying float vHot;
  varying float vHover;
  varying float vTint;
  varying float vTrail;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;   // 归一化到 0~1，1 即精灵边缘
    if (r > 1.0) discard;

    /* ---- 多段径向渐变 ----

       原本是 3 段（0/25/60/100%），外缘那一段要从 0.2 直落到 0，
       跨度只有 40% 半径，衰减太快，光斑边界仍然「看得见」。

       现在拆成 6 段，核心保持原来的密度，把预算全花在外缘：
       后三段覆盖 55%~100% 的半径，不透明度却只降一点点，
       形成一条长而极淡的尾巴——边界溶进纸里，而不是收在某处。

       色标整体抬高了，尤其是外缘的后几档。配合精灵尺寸的增大，
       弥散范围因此明显外扩，相邻光斑的弥散区会彼此侵入。
       叠加混合下重叠处会自然累出一块更亮的区域，整群因此连成
       一片流动的光，而不是几颗各自为政的珠子。

       两套色标（悬停 / 未悬停）依旧只差一个整体倍率，
       用 vHover 插值。vHover 现在是连续量（见顶点着色器里的
       uHoverAmount），所以亮起与消退都是渐变的。

       再给它套一条 smoothstep：线性的 amount 在消退末尾会
       「戛然而止」，S 曲线把首尾都压平，收尾更像自然熄灭。 */

    /* 悬停态色标：0 / 12 / 28 / 42 / 55 / 72 / 100%

       整体比上一版又压下来一截。上一版为了「让弥散区能连上」
       把色标抬高，但那是在 NormalBlending 的经验下估的值；
       改成预乘 alpha 叠加后，重叠处的不透明度是真的会累加，
       同样的色标叠三四层就压出了深色块。

       现在单层更淡，叠加后才刚好——这才是叠加混合下该有的
       配法：单层预留余地，让重叠去填。 */
    const float F0 = 0.72;
    const float F1 = 0.58;
    const float F2 = 0.4;
    const float F3 = 0.27;
    const float F4 = 0.17;
    const float F5 = 0.085;

    // 未悬停态：整体再压低，但外缘几档压得比核心少——
    // 即使不悬停，弥散的尾巴也要足够明显，邻居之间才连得上
    const float D0 = 0.34;
    const float D1 = 0.28;
    const float D2 = 0.2;
    const float D3 = 0.145;
    const float D4 = 0.095;
    const float D5 = 0.05;

    float hv = smoothstep(0.0, 1.0, clamp(vHover, 0.0, 1.0));

    float s0 = mix(D0, F0, hv);
    float s1 = mix(D1, F1, hv);
    float s2 = mix(D2, F2, hv);
    float s3 = mix(D3, F3, hv);
    float s4 = mix(D4, F4, hv);
    float s5 = mix(D5, F5, hv);

    /* 分段线性插值。段越靠外越长、落差越小：
         [0,  12%] : s0 → s1   核心，几乎不衰减
         [12, 28%] : s1 → s2
         [28, 42%] : s2 → s3
         [42, 55%] : s3 → s4
         [55, 72%] : s4 → s5   尾巴起点
         [72,100%] : s5 → 0    最长的一段，落差最小 */
    float a;
    if (r < 0.12) {
      a = mix(s0, s1, r / 0.12);
    } else if (r < 0.28) {
      a = mix(s1, s2, (r - 0.12) / 0.16);
    } else if (r < 0.42) {
      a = mix(s2, s3, (r - 0.28) / 0.14);
    } else if (r < 0.55) {
      a = mix(s3, s4, (r - 0.42) / 0.13);
    } else if (r < 0.72) {
      a = mix(s4, s5, (r - 0.55) / 0.17);
    } else {
      /* 末段再乘一次淡出，让最外圈趋近于 0，彻底不留边界。

         系数从 0.35 提到 1.0：外缘色标抬高后，若还用原来那条
         温和的曲线，精灵边界处会剩下一层能看出来的底，十几颗
         光斑叠在一起就会露出一圈圈圓边。平方衰减把最后那点余量
         压到 0，弥散范围却因为前面几段抬高而依旧外扩。 */
      float u = (r - 0.72) / 0.28;
      a = mix(s5, 0.0, u) * (1.0 - u * u);
    }

    a *= vBright * uOpacity;

    // 虚化：未聚焦的群整体压淡
    a *= mix(1.0, 0.3, vDim);

    /* 拖尾淡出。

       用平方而非三次方：三次方到中段就只剩 3% 了，尾巴等于
       没有；平方能让中段保留约 25%，整条才连得起来。
       但也不能更缓——尾部节点之间有重叠，additive 混合下
       亮度会累加，压得不够低就会叠成一条实心亮线。 */
    float tf = 1.0 - vTrail;
    a *= tf * tf;

    /* ---- 颜色 ----

       光斑有两个颜色状态：平时是银白，被选中时才回到本色。

       这样安排是因为颜色在这里是「指示」而不是「装饰」。三群
       常驻在盆里，若始终各自着色，整个盆一进来就是三块绿紫黄，
       观者第一眼要处理的是色彩分布，而不是「哪一片正在被我看」。
       让未选中的一律褪成银白，颜色就重新变成一种可用的信号：
       只有当下关注的那一群（或那一颗）是有色的。

       银白不是纯白。纸面是 0.965，纯白的光斑在上面等于隐形；
       也不是纯灰——完全抽掉色相后，三群失去各自的身份，
       悬停时的「变色」会像凭空冒出来，而不是「本来就有的颜色
       被唤醒」。所以留一点点色相：认不出具体是什么颜色，
       但能感觉到三片银白微妙地不一样。 */

    /* 银白的明度（线性值）。

       这个值一度取 0.76，结果整片发灰。原因是当时拿错了尺子：
       只验算了「单层核心叠到纸上暗几灰阶」，而光斑是成片重叠的。
       over 混合反复叠加会收敛到 col 本身，所以密集处看到的就是
       这里的原色——那才是主要观感，单层反而是次要的。

       按 CIELAB 重算就很清楚：0.76 在密集处是 L*=78，而纸面是
       L*=97。暗了近 20 个明度级，彩度 C* 又只剩 11~18——
       低明度加低彩度，那就是灰的定义。

       更根本的误判在于：光斑原本的存在感主要来自彩度，而非明度。
       改版前它们只比纸面低 5~6 个 L*，却有 12~44 的 C*。
       抽掉彩度后又想保持同样的可见度，就只能靠压暗来换，
       于是把一片浮光做成了一片脏印子。

       现在改取 0.92：密集处 L*=93，只比纸面低 4 个明度级，
       跟改版前有色时的 5~6 基本持平。银白就该是淡的，
       它靠彩度而不是靠暗来被看见。 */
    const float SILVER = 0.92;

    /* 色相的残留量。看的是密集处的 C*（CIELAB 彩度）：
         0.08 → C* 约 10~12，偏淡，三群几乎说不上来哪里不同
         0.12 → C* 约 15~18，看得出三片各有倾向，又叫不出色名
         0.16 → C* 过 24，已经是明确的淡绿 / 淡紫了
       取 0.12。

       参考：选中后的本色 C* 是 37~113，差了一个量级以上，
       「上色」这个动作仍然是一眼就能看出来的。 */
    const float SILVER_TINT = 0.12;

    float lum = dot(uColor, vec3(0.2126, 0.7152, 0.0722));

    /* 抽出纯色度：减掉明度后剩下的就是「往哪个方向偏」。
       再归一化成单位长度，乘上 TINT，三群就拿到等量的色相。

       用向量长度，而不是「偏移最大的通道」。两者实测过：
       按最大通道归一化时，三群的 C* 是 17.8 / 12.4 / 10.8，
       极差 7——绿明显比黄浓，根本不是「同样的一点点」。
       改用长度后是 18.4 / 18.1 / 14.7，极差降到 3.7。

       差别的根源：最大通道只看得见一个轴，而彩度是三个通道
       共同决定的。绿(#2aff00)的色度在三个轴上都偏得远，
       按单轴归一化会把整体幅度保留得过多。

       注意偏移可以是负的：绿群里幅度最大的是蓝通道（往下），
       所以它的「发绿」是靠压暗红蓝得来的，而不是抬高绿。

       除法前要判长度而不能直接 normalize：若将来有人配了一个
       中性灰的群，色度向量为零，normalize 会得到 NaN。
       显式判断可以让这种群老实地停在纯银白上。 */
    vec3 chroma = uColor - vec3(lum);
    float cLen = length(chroma);
    vec3 cDir = cLen > 0.001 ? chroma / cLen : vec3(0.0);
    vec3 silver = vec3(SILVER) + cDir * SILVER_TINT;

    /* 选中态的本色。仍然要往纸白提一档才能用。

       数据里存的是全饱和色（#2aff00 / #9d4dff / #ffd400），那是
       给 UI 上的小色块用的——十字标记、eyebrow 文字都只占几十个
       像素，饱和才压得住。但光斑是大面积的弥散，同样的饱和度铺
       开几百像素就过重了，在 0.965 的白纸上尤其扎眼。

       提亮的比例不是定值，而是按各色自身的明度反推出来的。

       固定混 32% 的白试过，结果三个群轻重差了近四倍：紫色比
       纸面暗 47 灰阶，黄色只有 12.6。因为绿(#2aff00)和黄
       (#ffd400)本身明度就接近 0.9，混白后几乎贴着纸面；而
       紫色(#9d4dff)明度只有 0.44，同样混 32% 仍然很沉。

       所以分两步走。

       第一步「拉齐」：明度低于 0.74 的色朝这个目标补白，缺多少
       补多少。紫色因此被大幅提亮，绿与黄本就高于目标，几乎不动
       ——三者就此落在同一起跑线上。

       第二步「整体变浅」：在拉齐的基础上，三色再统一混入 0.12
       的白。这一步是必须的，否则绿和黄的明度本就高于目标值，
       第一步对它们等于没做，最后仍是原来那个饱和的绿和黄。 */
    float even = clamp((0.74 - lum) / max(1.0 - lum, 0.001), 0.0, 1.0);
    vec3 hue = mix(uColor, vec3(1.0), even);
    hue = mix(hue, vec3(1.0), 0.12);

    /* 两态之间插值。

       套 smoothstep 的理由和上面色标那里一样：线性的量在两端
       会「说停就停」，S 曲线把首尾压平，颜色是浮上来又沉下去的，
       而不是被开关切换的。 */
    float tn = smoothstep(0.0, 1.0, clamp(vTint, 0.0, 1.0));
    vec3 col = mix(silver, hue, tn);

    col = mix(col, col + vec3(0.22), vHot * 0.45);

    /* 银白态补不透明度。

       这一步是必须的，否则褪色之后光斑会淡到几乎消失。原因在于
       彩度本来就是它的主要存在感来源：改版前未选中的核心与纸面
       相差 ΔE 13~45，而同样不透明度下的银白只有 5~6——
       低于「并排能看出」的阈值没多少。

       靠压暗来补是走不通的，上一版就是那么做的，结果整片发灰。
       正确的做法是补不透明度：颜色维持在淡而干净的银白，
       只是铺得实一些。

       1.9 倍是算出来的：核心处 ΔE 回到 12 左右，与改版前最淡的
       那一群（紫，13.4）基本持平——那一群既然一直是能看见的，
       这个水位就够。重叠十层后 L* 仍有 94（纸面 97），
       不会因为叠得多而糊成一块。

       系数随 tn 回落：选中后重新有了彩度，就不再需要这份补偿，
       此时 alpha 与改版前完全一致。两者此消彼长，
       「上色」这个动作因此只改变颜色，不会连带着忽明忽暗。 */
    a *= mix(1.9, 1.0, tn);
    a = min(a, 0.85);

    if (a < 0.0015) discard;

    /* 预乘 alpha 输出。

       配合材质里的自定义混合因子（见 createMotesMaterial）：
       目标色 = src.rgb + dst.rgb × (1 - a)。

       单颗光斑时它等价于普通的 alpha 混合；但两颗重叠时，
       后画的那颗会把自己的颜色加到已有结果上，而不是把它
       遮掉——弥散区重叠处因此会累出更浓的色，而不是互相
       抵消或覆盖。这正是「允许彼此重叠」想要的效果。 */
    gl_FragColor = vec4(col * a, a);
  }
`;

export function createMotesMaterial(color: string) {
  return new THREE.ShaderMaterial({
    vertexShader: motesVertexShader,
    fragmentShader: motesFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uClusterPos: { value: new THREE.Vector3() },
      uPointer: { value: new THREE.Vector2(999, 999) },
      uPointerForce: { value: 0 },
      uFocus: { value: 0 },
      uDim: { value: 0 },
      uHoverProject: { value: -1 },
      uHoverAmount: { value: 0 },
      uHoverPrev: { value: -1 },
      uHoverPrevAmount: { value: 0 },
      uClusterTint: { value: 0 },
      uOpacity: { value: 1 },
      uPixelRatio: { value: 1 },
      uDive: { value: 0 },
    },
    transparent: true,
    depthWrite: false,

    /* 预乘 alpha 混合，而不是 NormalBlending 或 AdditiveBlending。

       NormalBlending：后画的光斑会把先画的遮掉，两片弥散区
       重叠也不会比单独一片更浓，没有任何叠加感。

       AdditiveBlending：叠加是有了，但它把颜色往白里推。
       本项目的底色是 0.965 的白纸，再加上去只会迅速过曝，
       绿紫黄三色全洗成一片惨白。

       预乘 alpha（src 侧系数取 ONE，dst 侧取 1-α）兼顾两边：
       单颗时与普通 alpha 混合完全一致，不会变白；重叠时后者
       的颜色是加上去的，重叠区因此比各自单独时更浓。
       片元着色器必须相应地输出 col × a。 */
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
}
