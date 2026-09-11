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

  uniform float uTime;
  uniform vec3  uClusterPos;   // 该群在盆中的锚点
  uniform vec2  uPointer;      // 指针，盆平面坐标
  uniform float uPointerForce; // 指针影响强度
  uniform float uFocus;        // 0 = 远景, 1 = 被聚焦近景
  uniform float uDim;          // 0 = 正常, 1 = 完全退散虚化
  uniform float uHoverProject; // 当前悬停的项目索引，-1 无
  uniform float uPixelRatio;
  uniform float uDive;         // 下潜蓄力 0~1

  varying float vBright;
  varying float vSeed;
  varying float vFocus;
  varying float vDim;
  varying float vHot;
  varying float vHover;

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

    vec3 pos = uClusterPos + aOffset;

    /* ---- 1. 原地微摆 ----
       光斑不在盆中游走或环绕，只在自己的位置上轻轻晃动。
       用两个不同频率的正弦叠加（而非噪声漂移），
       保证运动是「有界的往复」而不是「无界的游荡」——
       它们永远回到自己的位置。 */
    float t = uTime * 0.34;
    float ph = aSeed * 6.283;

    vec3 sway;
    sway.x = sin(t * 0.83 + ph) * 0.6 + sin(t * 0.41 + ph * 1.7) * 0.4;
    sway.y = sin(t * 0.67 + ph * 2.1) * 0.6 + sin(t * 0.29 + ph) * 0.4;
    sway.z = sin(t * 0.75 + ph * 1.3) * 0.6 + sin(t * 0.37 + ph * 2.4) * 0.4;

    // 摆动幅度很小，只是「呼吸感」，不改变光斑的可辨识位置
    pos += sway * 0.022;

    // ---- 2. 呼吸 ----
    float breathe = sin(uTime * 0.42 + aSeed * 6.283) * 0.5 + 0.5;

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
    size *= mix(0.86, 1.14, breathe);
    size *= mix(1.0, 2.45, uFocus);
    size *= 1.0 + hot * 0.55;
    // 悬停的光斑放大——不再依赖 uFocus，盆视角下也要有反馈
    float isHovered = step(0.5, 1.0 - abs(aProjectIdx - uHoverProject)) * step(0.0, uHoverProject);
    size *= 1.0 + isHovered * 0.32;
    size *= mix(1.0, 2.1, uDim); // 虚化时变大变淡，模拟失焦

    gl_PointSize = size * uPixelRatio * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    vBright = aBright * mix(0.9, 1.1, breathe);
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

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;   // 归一化到 0~1，1 即精灵边缘
    if (r > 1.0) discard;

    /* ---- CSS radial-gradient 的色标 ----

       目标（以绿色为例）：
         聚焦/悬停：  #2aff00 0% → #2aff0080 25% → #2aff0033 60% → 透明 100%
         未悬停：     #2aff0080 0% → #2aff004d 25% → #2aff001a 60% → 透明 100%

       CSS 的 "50% 50% at 50% 50%" 意味着渐变半径 = 精灵半宽，
       正好对应这里归一化后的 r ∈ [0, 1]，所以色标位置可以直接用。

       两套色标只差一个整体倍率：未悬停组恰好是聚焦组的一半
       （1.0→0.5、0.5→0.3、0.2→0.1），因此用 mix 在两者间插值，
       就能得到平滑的悬停过渡，而不是两种状态硬切。 */

    // 聚焦态的四个色标不透明度
    const float F0 = 1.0;    // #2aff00   @ 0%
    const float F1 = 0.5;    // #2aff0080 @ 25%
    const float F2 = 0.2;    // #2aff0033 @ 60%

    // 未悬停态
    const float D0 = 0.5;    // #2aff0080 @ 0%
    const float D1 = 0.302;  // #2aff004d @ 25%
    const float D2 = 0.102;  // #2aff001a @ 60%

    // vHover 在 0~1 之间插值，两套色标平滑过渡
    float s0 = mix(D0, F0, vHover);
    float s1 = mix(D1, F1, vHover);
    float s2 = mix(D2, F2, vHover);

    /* 按 CSS 色标做分段线性插值：
         [0%, 25%]  : s0 → s1
         [25%, 60%] : s1 → s2
         [60%, 100%]: s2 → 0
       smoothstep 会把线性段变成 S 形，那正是之前「太线性」的反面——
       但 CSS 渐变本身就是线性插值，所以这里如实使用 mix。 */
    float a;
    if (r < 0.25) {
      a = mix(s0, s1, r / 0.25);
    } else if (r < 0.60) {
      a = mix(s1, s2, (r - 0.25) / 0.35);
    } else {
      a = mix(s2, 0.0, (r - 0.60) / 0.40);
    }

    a *= vBright * uOpacity;

    // 虚化：未聚焦的群整体压淡
    a *= mix(1.0, 0.3, vDim);

    // ---- 颜色 ----
    // 色相始终是该群的本色；只在指针靠近时提亮一点，制造「被照到」的反馈。
    vec3 col = uColor;
    col = mix(col, col + vec3(0.22), vHot * 0.45);

    if (a < 0.0015) discard;
    gl_FragColor = vec4(col, a);
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
      uOpacity: { value: 1 },
      uPixelRatio: { value: 1 },
      uDive: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
}
