import * as THREE from 'three';

/**
 * 盆外缘的点圈。
 *
 * 一圈散落在液面边界之外的白色小点，纯装饰。
 *
 * 它刻意是「死」的——不漂移、不闪烁、不响应指针。盆里已经有
 * 会呼吸的光斑、会流动的液面、会跟着指针亮起来的柔光，再给这
 * 圈点加动效，首屏就没有一处是安静的了。它的职责只是勾出盆的
 * 边界，让中间那团光有个可以依附的轮廓。
 */

export const basinRingVertexShader = /* glsl */ `
  precision highp float;

  attribute float aSize;   // 直径，单位是设备无关像素
  attribute float aSeed;   // 0~1 随机种子，只用于错开显影时刻
  attribute float aAlpha;  // 基准不透明度

  uniform float uPixelRatio;
  uniform float uReveal;       // 首次显影 0 -> 1
  uniform float uFade;         // 1 = 盆全景可见, 0 = 已离开首屏
  uniform float uRadiusScale;  // 窄屏时整体收拢，保证点圈不被裁掉

  varying float vAlpha;

  void main() {
    vec3 pos = position * vec3(uRadiusScale, 1.0, uRadiusScale);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    /* ---- 显影 ----
       按 seed 错开起始时刻，整圈是零星浮现而不是整体淡入。
       这是唯一保留的时间变化，而且只发生一次。 */
    float born = smoothstep(aSeed * 0.55, aSeed * 0.55 + 0.45, uReveal);

    vAlpha = aAlpha * born * uFade;

    /* 尺寸直接按像素给，不做透视缩放。

       常规写法是乘 (300.0 / -mv.z)，让点近大远小。但盆全景的
       相机是固定的（y=9.2），这个系数恒等于约 32.6——真按那样
       写，aSize=2 会变成 65 像素的大斑。这圈点要的是「小点」，
       尺寸就该是确定的像素值，和相机无关。 */
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

export const basinRingFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;

  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;
    if (r > 1.0) discard;

    /* 实心圆点，只在最外缘做一档抗锯齿。

       光斑那套多段柔光渐变在这里是错的：这些点只有 1~3 像素，
       给它一条溢出的光晕，相邻几颗会立刻糊成一片灰雾，
       点就不成其为点了。 */
    float a = (1.0 - smoothstep(0.6, 1.0, r)) * vAlpha;

    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function createBasinRingMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: basinRingVertexShader,
    fragmentShader: basinRingFragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color('#ffffff') },
      uPixelRatio: { value: 1 },
      uReveal: { value: 0 },
      uFade: { value: 1 },
      uRadiusScale: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
  });
}
