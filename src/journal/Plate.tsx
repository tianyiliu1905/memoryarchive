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

    /* ---------- 线框：网页布局 ---------- */
    case 'wireframe': {
      const pad = Math.min(w, h) * 0.08;
      const iw = w - pad * 2;
      const ih = h - pad * 2;
      const line = Math.max(0.8, Math.min(w, h) * 0.0035);

      // 外框
      ctx.strokeStyle = ink(0.16);
      ctx.lineWidth = line;
      ctx.strokeRect(pad, pad, iw, ih);

      // 顶栏
      const barH = ih * 0.09;
      ctx.fillStyle = ink(0.05);
      ctx.fillRect(pad, pad, iw, barH);
      ctx.strokeStyle = ink(0.13);
      ctx.beginPath();
      ctx.moveTo(pad, pad + barH);
      ctx.lineTo(pad + iw, pad + barH);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(pad + barH * 0.5 + i * barH * 0.55, pad + barH * 0.5, barH * 0.13, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.16);
        ctx.fill();
      }

      // 左侧导航
      const navW = iw * 0.2;
      ctx.strokeStyle = ink(0.13);
      ctx.beginPath();
      ctx.moveTo(pad + navW, pad + barH);
      ctx.lineTo(pad + navW, pad + ih);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const y = pad + barH + ih * 0.07 + i * ih * 0.1;
        const active = i === 1;
        ctx.fillStyle = active ? rgba(0.4) : ink(0.11);
        ctx.fillRect(pad + navW * 0.16, y, navW * (active ? 0.66 : 0.5), ih * 0.028);
      }

      // 右侧内容卡片
      const cx0 = pad + navW + iw * 0.05;
      const cw = iw - navW - iw * 0.1;
      ctx.fillStyle = ink(0.09);
      ctx.fillRect(cx0, pad + barH + ih * 0.08, cw * 0.42, ih * 0.05);

      const cardCols = 3;
      const cardW = cw / cardCols - cw * 0.03;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < cardCols; c++) {
          const x = cx0 + c * (cardW + cw * 0.045);
          const y = pad + barH + ih * 0.2 + r * ih * 0.33;
          ctx.strokeStyle = ink(0.12);
          ctx.lineWidth = line;
          ctx.strokeRect(x, y, cardW, ih * 0.26);
          ctx.fillStyle = rnd() > 0.6 ? rgba(0.1) : ink(0.035);
          ctx.fillRect(x, y, cardW, ih * 0.13);
          ctx.fillStyle = ink(0.1);
          ctx.fillRect(x + cardW * 0.08, y + ih * 0.17, cardW * 0.62, ih * 0.016);
          ctx.fillRect(x + cardW * 0.08, y + ih * 0.205, cardW * 0.4, ih * 0.016);
        }
      }
      break;
    }

    /* ---------- 手机屏：含底部标签栏 ---------- */
    case 'handset': {
      const phoneH = h * 0.86;
      const phoneW = phoneH * 0.49;
      const px0 = (w - phoneW) / 2;
      const py0 = (h - phoneH) / 2;
      const radius = phoneW * 0.1;
      const line = Math.max(0.9, Math.min(w, h) * 0.004);

      const roundRect = (x: number, y: number, rw: number, rh: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + rw, y, x + rw, y + rh, r);
        ctx.arcTo(x + rw, y + rh, x, y + rh, r);
        ctx.arcTo(x, y + rh, x, y, r);
        ctx.arcTo(x, y, x + rw, y, r);
        ctx.closePath();
      };

      roundRect(px0, py0, phoneW, phoneH, radius);
      ctx.strokeStyle = ink(0.2);
      ctx.lineWidth = line * 1.6;
      ctx.stroke();

      // 刘海
      ctx.fillStyle = ink(0.14);
      ctx.fillRect(px0 + phoneW * 0.34, py0 + phoneH * 0.018, phoneW * 0.32, phoneH * 0.012);

      // 内容占位
      const inX = px0 + phoneW * 0.09;
      const inW = phoneW * 0.82;
      ctx.fillStyle = ink(0.12);
      ctx.fillRect(inX, py0 + phoneH * 0.08, inW * 0.52, phoneH * 0.022);
      for (let i = 0; i < 3; i++) {
        const y = py0 + phoneH * 0.14 + i * phoneH * 0.17;
        ctx.strokeStyle = ink(0.11);
        ctx.lineWidth = line;
        roundRect(inX, y, inW, phoneH * 0.14, phoneW * 0.04);
        ctx.stroke();
        ctx.fillStyle = i === 0 ? rgba(0.14) : ink(0.03);
        roundRect(inX, y, inW, phoneH * 0.075, phoneW * 0.04);
        ctx.fill();
        ctx.fillStyle = ink(0.1);
        ctx.fillRect(inX + inW * 0.08, y + phoneH * 0.095, inW * 0.56, phoneH * 0.011);
      }

      // 底部标签栏：四个入口
      const tabY = py0 + phoneH * 0.87;
      ctx.strokeStyle = ink(0.14);
      ctx.lineWidth = line;
      ctx.beginPath();
      ctx.moveTo(px0, tabY);
      ctx.lineTo(px0 + phoneW, tabY);
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const cx = px0 + phoneW * (0.155 + i * 0.23);
        const cy = tabY + phoneH * 0.045;
        const active = i === 0;
        ctx.beginPath();
        ctx.arc(cx, cy - phoneH * 0.012, phoneW * 0.055, 0, Math.PI * 2);
        ctx.strokeStyle = active ? rgba(0.65) : ink(0.16);
        ctx.lineWidth = line * 1.2;
        ctx.stroke();
        if (active) {
          ctx.fillStyle = rgba(0.3);
          ctx.fill();
        }
        ctx.fillStyle = active ? rgba(0.5) : ink(0.12);
        ctx.fillRect(cx - phoneW * 0.062, cy + phoneH * 0.014, phoneW * 0.124, phoneH * 0.008);
      }
      break;
    }

    /* ---------- 分支：版本流向 ---------- */
    case 'branch': {
      const mainY = h * 0.34;
      const x0 = w * 0.08;
      const x1 = w * 0.92;
      const line = Math.max(1, Math.min(w, h) * 0.004);

      // 主干
      ctx.strokeStyle = ink(0.2);
      ctx.lineWidth = line * 1.4;
      ctx.beginPath();
      ctx.moveTo(x0, mainY);
      ctx.lineTo(x1, mainY);
      ctx.stroke();

      const nodeAt = (x: number, y: number, filled: boolean, r: number) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (filled) {
          ctx.fillStyle = rgba(0.7);
          ctx.fill();
        } else {
          ctx.fillStyle = '#efece5';
          ctx.fill();
          ctx.strokeStyle = ink(0.3);
          ctx.lineWidth = line;
          ctx.stroke();
        }
      };

      const nodeR = Math.min(w, h) * 0.016;
      const mainCount = 5;
      for (let i = 0; i < mainCount; i++) {
        const x = x0 + ((x1 - x0) / (mainCount - 1)) * i;
        nodeAt(x, mainY, i === 0 || i === mainCount - 1, nodeR);
      }

      // 两条分支：拉出去、再并回来
      const branches = [
        { from: 1, to: 3, depth: 0.26, n: 2 },
        { from: 2, to: 4, depth: 0.46, n: 3 },
      ];
      branches.forEach((b, bi) => {
        const fx = x0 + ((x1 - x0) / (mainCount - 1)) * b.from;
        const tx = x0 + ((x1 - x0) / (mainCount - 1)) * b.to;
        const by = mainY + h * b.depth;

        ctx.strokeStyle = bi === 0 ? rgba(0.5) : ink(0.22);
        ctx.lineWidth = line * 1.1;
        ctx.beginPath();
        ctx.moveTo(fx, mainY);
        ctx.bezierCurveTo(fx + (tx - fx) * 0.18, mainY, fx + (tx - fx) * 0.1, by, fx + (tx - fx) * 0.3, by);
        ctx.lineTo(tx - (tx - fx) * 0.3, by);
        ctx.bezierCurveTo(tx - (tx - fx) * 0.1, by, tx - (tx - fx) * 0.18, mainY, tx, mainY);
        ctx.stroke();

        for (let i = 0; i < b.n; i++) {
          const t = (i + 1) / (b.n + 1);
          const nx = fx + (tx - fx) * (0.3 + t * 0.4);
          nodeAt(nx, by, bi === 0, nodeR * 0.82);
        }
      });
      break;
    }

    /* ---------- 色卡 / 样本格 ---------- */
    case 'swatch': {
      const cols = 4;
      const rows = 3;
      const pad = Math.min(w, h) * 0.09;
      const gap = Math.min(w, h) * 0.035;
      const cw = (w - pad * 2 - gap * (cols - 1)) / cols;
      const ch = (h - pad * 2 - gap * (rows - 1)) / rows;
      const line = Math.max(0.8, Math.min(w, h) * 0.003);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = pad + c * (cw + gap);
          const y = pad + r * (ch + gap);
          const t = rnd();

          ctx.strokeStyle = ink(0.13);
          ctx.lineWidth = line;
          ctx.strokeRect(x, y, cw, ch);

          // 上半：色块
          ctx.fillStyle = t > 0.66 ? rgba(0.1 + t * 0.3) : ink(0.03 + t * 0.09);
          ctx.fillRect(x, y, cw, ch * 0.58);

          // 下半：两行标签
          ctx.fillStyle = ink(0.16);
          ctx.fillRect(x + cw * 0.1, y + ch * 0.7, cw * 0.55, ch * 0.055);
          ctx.fillStyle = ink(0.09);
          ctx.fillRect(x + cw * 0.1, y + ch * 0.82, cw * 0.34, ch * 0.045);
        }
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
