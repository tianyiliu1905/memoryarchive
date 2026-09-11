import { useMemo, useRef, useEffect, useState } from 'react';
import type { Plate as PlateData } from '@/data/types';
import './plate.css';

/**
 * 程序化生成的视觉板块。
 *
 * 不依赖任何外部图片资源——用 canvas 生成抽象的档案影像，
 * 保证作品集在任何环境下都完整可运行，同时视觉语言统一：
 * 柔焦、低对比、带颗粒、像一张显影不足的旧照片。
 */

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: PlateData,
  accent: string
) {
  const rnd = mulberry(data.seed);

  // 底色：比纸面略深的暖灰
  ctx.fillStyle = '#efece5';
  ctx.fillRect(0, 0, w, h);

  const hex = accent.replace('#', '');
  const ar = parseInt(hex.slice(0, 2), 16);
  const ag = parseInt(hex.slice(2, 4), 16);
  const ab = parseInt(hex.slice(4, 6), 16);
  const rgba = (a: number) => `rgba(${ar}, ${ag}, ${ab}, ${a})`;
  const ink = (a: number) => `rgba(22, 21, 26, ${a})`;

  ctx.lineCap = 'round';

  switch (data.variant) {
    /* ---------- 弥散场：柔焦的光斑云 ---------- */
    case 'field': {
      for (let i = 0; i < 46; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const r = 20 + Math.pow(rnd(), 2) * Math.min(w, h) * 0.42;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const alpha = 0.035 + rnd() * 0.1;
        g.addColorStop(0, rgba(alpha));
        g.addColorStop(0.5, rgba(alpha * 0.35));
        g.addColorStop(1, rgba(0));
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // 一道横贯的浅色水平线，像地平线
      ctx.strokeStyle = ink(0.08);
      ctx.lineWidth = 1;
      const hy = h * (0.4 + rnd() * 0.25);
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(w, hy);
      ctx.stroke();
      break;
    }

    /* ---------- 网格：索引式的方阵 ---------- */
    case 'grid': {
      const cols = 5 + Math.floor(rnd() * 4);
      const rows = 4 + Math.floor(rnd() * 3);
      const pad = Math.min(w, h) * 0.1;
      const cw = (w - pad * 2) / cols;
      const ch = (h - pad * 2) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = pad + c * cw;
          const y = pad + r * ch;
          const fill = rnd();
          ctx.strokeStyle = ink(0.09);
          ctx.lineWidth = 0.6;
          ctx.strokeRect(x, y, cw * 0.88, ch * 0.88);
          if (fill > 0.62) {
            ctx.fillStyle = rgba(0.07 + rnd() * 0.16);
            const inset = cw * 0.14;
            ctx.fillRect(x + inset, y + inset, cw * 0.88 - inset * 2, ch * 0.88 - inset * 2);
          } else if (fill > 0.45) {
            ctx.fillStyle = ink(0.04);
            ctx.fillRect(x, y, cw * 0.88, ch * 0.88 * (0.2 + rnd() * 0.5));
          }
        }
      }
      break;
    }

    /* ---------- 波形：数据曲线 ---------- */
    case 'wave': {
      for (let line = 0; line < 5; line++) {
        const amp = h * (0.06 + rnd() * 0.14);
        const freq = 0.004 + rnd() * 0.011;
        const phase = rnd() * Math.PI * 2;
        const baseY = h * (0.2 + line * 0.15);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const y =
            baseY +
            Math.sin(x * freq + phase) * amp +
            Math.sin(x * freq * 2.7 + phase * 1.6) * amp * 0.35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = line === 2 ? rgba(0.42) : ink(0.1);
        ctx.lineWidth = line === 2 ? 1.5 : 0.7;
        ctx.stroke();
      }
      break;
    }

    /* ---------- 散点：分布图 ---------- */
    case 'scatter': {
      // 两个聚集核
      const cores = [
        { x: w * (0.25 + rnd() * 0.15), y: h * (0.3 + rnd() * 0.2), n: 90 },
        { x: w * (0.62 + rnd() * 0.2), y: h * (0.5 + rnd() * 0.25), n: 60 },
      ];
      cores.forEach((core, ci) => {
        for (let i = 0; i < core.n; i++) {
          const ang = rnd() * Math.PI * 2;
          const rad = Math.pow(rnd(), 1.8) * Math.min(w, h) * 0.34;
          const x = core.x + Math.cos(ang) * rad;
          const y = core.y + Math.sin(ang) * rad * 0.8;
          const s = 1 + Math.pow(rnd(), 2.5) * 5;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fillStyle = ci === 0 ? rgba(0.1 + rnd() * 0.3) : ink(0.07 + rnd() * 0.1);
          ctx.fill();
        }
      });
      // 坐标轴
      ctx.strokeStyle = ink(0.1);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.9);
      ctx.lineTo(w * 0.94, h * 0.9);
      ctx.moveTo(w * 0.08, h * 0.9);
      ctx.lineTo(w * 0.08, h * 0.1);
      ctx.stroke();
      break;
    }

    /* ---------- 地层：水平色带 ---------- */
    case 'strata': {
      let y = 0;
      let band = 0;
      while (y < h) {
        const bh = h * (0.03 + Math.pow(rnd(), 1.5) * 0.14);
        const isAccent = rnd() > 0.68;
        ctx.fillStyle = isAccent ? rgba(0.06 + rnd() * 0.2) : ink(0.018 + rnd() * 0.05);
        ctx.fillRect(0, y, w, bh);

        // 带上的细微扰动
        if (rnd() > 0.5) {
          ctx.strokeStyle = ink(0.06);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 4) {
            const yy = y + bh * 0.5 + Math.sin(x * 0.02 + band) * bh * 0.18;
            if (x === 0) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
        y += bh;
        band++;
      }
      break;
    }

    /* ---------- 轨迹：环绕的路径 ---------- */
    case 'orbit': {
      const cx = w * 0.5;
      const cy = h * 0.5;
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        const rx = Math.min(w, h) * (0.12 + k * 0.055);
        const ry = rx * (0.55 + rnd() * 0.4);
        const rot = rnd() * Math.PI;
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.06) {
          const wob = 1 + Math.sin(a * (3 + k) + k) * 0.09;
          const x = cx + Math.cos(a + rot) * rx * wob;
          const y = cy + Math.sin(a + rot) * ry * wob;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = k % 3 === 0 ? rgba(0.28) : ink(0.08);
        ctx.lineWidth = k % 3 === 0 ? 1.1 : 0.55;
        ctx.stroke();
      }
      // 停顿点
      for (let i = 0; i < 14; i++) {
        const a = rnd() * Math.PI * 2;
        const rad = Math.min(w, h) * (0.12 + rnd() * 0.4);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.7, 2 + rnd() * 4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(0.35);
        ctx.fill();
      }
      break;
    }
  }

  // ---- 统一后处理：颗粒 + 暗角 ----
  const img = ctx.getImageData(0, 0, w, h);
  const px = img.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (rnd() - 0.5) * 15;
    px[i] += n;
    px[i + 1] += n;
    px[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(120,112,96,0.14)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

interface Props {
  plate: PlateData;
  accent: string;
}

export function Plate({ plate, accent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const height = useMemo(() => 'min(56vh, 460px)', []);

  // 进入视野才绘制，避免一次性绘制几十张
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { root: null, rootMargin: '200px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    draw(ctx, w, h, plate, accent);
  }, [visible, plate, accent]);

  return (
    <figure className="plate" ref={wrapRef} style={{ height, aspectRatio: String(plate.ratio) }}>
      <div className="plate__frame">
        <canvas ref={canvasRef} className={`plate__canvas ${visible ? 'is-developed' : ''}`} />
        <span className="plate__index archive-tag">{plate.index}</span>
      </div>
      <figcaption className="plate__caption">{plate.caption}</figcaption>
    </figure>
  );
}
