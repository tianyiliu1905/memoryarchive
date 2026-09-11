import * as THREE from 'three';

/**
 * 记忆盆的液面。
 *
 * 从俯视角看到的一池半透明液体：
 *   - 边缘极淡，向外无限衰减，不能有硬边
 *   - 内部有缓慢流动的流体纹理（domain-warped fbm）
 *   - 玻璃质的弧形反光
 *   - 指针经过时留下水波
 */

const commonNoise = /* glsl */ `
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float snoise(vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      v += amp * snoise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }
`;

export const basinVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const basinFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uPointerForce;
  uniform float uReveal;    // 首次显影 0 -> 1
  uniform float uFocusAmt;  // 聚焦某群时整体压暗
  uniform vec3  uTint;      // 当前聚焦群的色彩渗透

  varying vec2 vUv;
  varying vec3 vPos;

  ${commonNoise}

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);

    // ---- 盆的形状：边缘极淡的径向衰减 ----
    float basin = 1.0 - smoothstep(0.52, 1.0, r);
    if (basin <= 0.001) discard;

    // ---- 流体纹理：domain warping ----
    float t = uTime * 0.021;
    vec2 q = vec2(fbm(p * 1.6 + vec2(0.0, t)), fbm(p * 1.6 + vec2(4.3, -t * 0.8)));
    vec2 s = vec2(fbm(p * 1.9 + q * 1.5 + vec2(1.7, 9.2) + t * 0.6),
                  fbm(p * 1.9 + q * 1.5 + vec2(8.3, 2.8) - t * 0.5));
    float fluid = fbm(p * 2.1 + s * 1.2);
    fluid = fluid * 0.5 + 0.5;

    // ---- 指针处的微光 ----
    // 原本这里是一圈圈随时间扩散的同心波纹。但环纹会在盆面上
    // 形成明显的运动方向，鼠标一移，整个盆就像在跟着转。
    // 现在只保留一团静态的柔光：指针所到之处液体略微发亮，
    // 没有任何方向性，因此不会被读成旋转。
    float pd = length(p - uPointer);
    float waves = exp(-pd * pd * 4.0) * uPointerForce * 0.016 * basin;

    /* ---- 边缘光圈 ----
       原本是两道带角度调制的弧形高光，一明一暗地挂在盆的一侧，
       看起来像个来历不明的白色弧块。

       现在改成一圈完整、均匀、无方向性的柔光：
         - 去掉 atan/cos 的角度调制 → 光圈处处等亮，是「圈」而非「弧」
         - 指数的系数从 120/300 降到 26 → 光带变宽、边界软化
         - 强度大幅压低 → 只是淡淡一层，不抢光斑的视觉重量 */
    float sheen = exp(-pow(r - 0.78, 2.0) * 26.0) * 0.085;

    // ---- 合成：整体是白纸上的极淡阴影 + 高光 ----
    // 液体主体比纸面略深一点点的暖灰。
    // 流体纹理的振幅刻意压得极低——它只该是「若有若无的质感」，
    // 一旦明显就会变成脏兮兮的灰斑。
    float shade = (fluid - 0.5) * 0.016 * basin + waves;
    shade -= basin * 0.02;             // 盆内整体略沉
    shade += sheen * basin;            // 光圈提亮

    vec3 paper = vec3(0.968, 0.961, 0.949);
    vec3 col = paper + vec3(shade);

    // 液体略带一点冷调，和暖纸形成微差
    col.b += basin * 0.006;
    col.r -= basin * 0.002;

    // 聚焦时，被选中群的色彩极淡地渗进液体
    col = mix(col, col * 0.985 + uTint * 0.035, uFocusAmt * basin);

    // 边缘的一圈极淡外晕，让盆「浮」在纸上
    float rim = exp(-pow(r - 0.97, 2.0) * 420.0) * 0.05;
    col -= rim;

    float alpha = basin * uReveal;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function createBasinMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: basinVertexShader,
    fragmentShader: basinFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(999, 999) },
      uPointerForce: { value: 0 },
      uReveal: { value: 0 },
      uFocusAmt: { value: 0 },
      uTint: { value: new THREE.Color('#b07cff') },
    },
    transparent: true,
    depthWrite: false,
  });
}
