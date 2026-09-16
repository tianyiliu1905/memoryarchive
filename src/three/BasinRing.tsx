import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createBasinRingMaterial } from './basinRingMaterial';
import { RING_RADIUS, RING_THICKNESS, RING_OUTER, ringFitScale } from './layout';
import { useArchive } from '@/store/archive';

/** 撒点的尝试次数。经密度筛选后实际留下约 330 颗 */
const RING_SAMPLES = 460;

/**
 * 盆外缘的一圈白色小点，纯装饰。
 *
 * 分布上刻意避开了「等分圆周 + 抖动」的常规做法——那样做无论
 * 怎么加随机，底子里的规整都还在，一眼就能看出是程序画的。
 * 改成在环带里做带密度调制的拒绝采样，角度本身就不均匀，
 * 疏密和空隙是自然长出来的。
 *
 * 除了首次显影，它没有任何动效，也不响应指针。理由见
 * basinRingMaterial 顶部的注释。
 */
export function BasinRing() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  const awakened = useArchive((s) => s.awakened);
  const depth = useArchive((s) => s.depth);

  const { geometry, material } = useMemo(() => {
    /* 固定种子的线性同余：每次刷新点圈都长得一模一样。
       这一圈是首屏构图的一部分，不该每次进来都换个样子。
       常数与 layout.ts 里的 moteOffsets 保持一致。 */
    let seed = 20260915;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    /* 低频的半径起伏，让圈略微不圆，像手画的。

       三个频率都取整数，sin(kθ) 在 θ 走完 2π 后必定回到原值，
       整圈因此严丝合缝地闭合。若用噪声或非整数频率，
       θ=0 与 θ=2π 处会对不上，接缝处会露出一道台阶。 */
    const p1 = rnd() * 6.283;
    const p2 = rnd() * 6.283;
    const p3 = rnd() * 6.283;
    const radiusAt = (a: number) =>
      RING_RADIUS *
      (1 + 0.026 * Math.sin(3 * a + p1) + 0.016 * Math.sin(5 * a + p2) + 0.009 * Math.sin(8 * a + p3));

    /* 角向的密度调制，同样用整数频率保证闭合。
       基底 0.42 意味着最稀的那几段也不会彻底断掉——
       完全的空白会把圈切成几段弧，就不是一个圈了。 */
    const q1 = rnd() * 6.283;
    const q2 = rnd() * 6.283;
    const densityAt = (a: number) =>
      0.42 + 0.34 * (0.5 + 0.5 * Math.sin(2 * a + q1)) + 0.24 * (0.5 + 0.5 * Math.sin(7 * a + q2));

    const pos: number[] = [];
    const sizes: number[] = [];
    const seeds: number[] = [];
    const alphas: number[] = [];

    for (let i = 0; i < RING_SAMPLES; i++) {
      const a = rnd() * 6.283185307;

      // 拒绝采样：密度低的角度上，多数候选点会被丢弃
      if (rnd() > densityAt(a)) continue;

      /* 径向位置：三个均匀随机数求和再居中，近似高斯。
         点因此集中在带的中线附近，越往两侧越稀，
         边界是渐隐的而不是被切平的。 */
      const g = (rnd() + rnd() + rnd()) / 3 - 0.5;
      let r = radiusAt(a) + g * 2 * RING_THICKNESS;

      /* 少量游离的点，甩在带外更远处。
         正是它们让这圈点显得是「散开的」，而不是被框在一条
         轨道上。 */
      if (rnd() < 0.06) r += (0.08 + rnd() * 0.18) * (rnd() < 0.5 ? -1 : 1);

      pos.push(Math.cos(a) * r, 0, Math.sin(a) * r);

      /* 直径 1.1~3.0 像素。

         rnd² 把分布压向小的一端，于是绝大多数点都只有一两个
         像素，偶尔才出现一颗稍大的。线性分布会让中等大小的点
         过多，整圈看起来像一串珠子。 */
      const t = rnd();
      sizes.push(1.1 + t * t * 1.9);

      /* 不透明度与大小正相关：大点更实，小点更虚。

         范围 0.55~0.95，比先前的 0.34~0.72 明显提高。

         之前压得低，是基于「底色已接近纸白，点太实会显脏」的
         判断。但那时盆的 sheen 是 0.085，点圈所在处的亮度其实
         已经溢出到 1.003——底色根本不是「接近纸白」，而是纯白，
         所以点画多实都是隐形的。sheen 降到 0.035 之后底色回到
         0.975，这里才有必要、也才有空间把点画实。 */
      alphas.push(0.55 + t * 0.4);

      seeds.push(rnd());
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    geo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
    // 虽然关掉了视锥剔除，仍给一个准确的包围球：
    // three 的射线检测等路径也会读它，留个错的值迟早会咬人
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), RING_OUTER + RING_THICKNESS);

    return { geometry: geo, material: createBasinRingMaterial() };
  }, []);

  useFrame((_, delta) => {
    const m = matRef.current;
    if (!m) return;
    const d = Math.min(delta, 0.05);
    const u = m.uniforms;

    u.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    u.uRadiusScale.value = ringFitScale(viewport.width, viewport.height);

    /* 显影比盆更慢（0.6 对 0.85）。
       盆先浮出来，点圈再零星地跟上——先有场，后有尘。 */
    const targetReveal = awakened ? 1 : 0;
    u.uReveal.value += (targetReveal - u.uReveal.value) * d * 0.6;

    /* 离开首屏就淡出。

       它是盆全景构图的一部分：相机推进到群近景后，点圈会被
       甩到画面外，只剩零星几颗贴着边缘，反而干扰视线。 */
    const targetFade = depth === 'basin' ? 1 : 0;
    u.uFade.value += (targetFade - u.uFade.value) * d * 2.4;
  });

  // 用 size 触发 pixelRatio 的重算
  void size;

  return (
    /* 略高于盆（盆在 -0.02），并显式排在盆之后绘制。
       两者都是 depthWrite: false 的透明物体，先后完全由
       renderOrder 决定；不指定的话点会被盆盖掉。 */
    <points geometry={geometry} position={[0, -0.015, 0]} renderOrder={1} frustumCulled={false}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}
