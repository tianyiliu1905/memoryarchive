import { useEffect, useRef } from 'react';

interface Props {
  /** 该记忆的主色 */
  color: string;
  /** 生长的起点，归一化屏幕坐标 0~1 */
  origin: [number, number];
  /** 动效降级时只画一个静态的网，不做生长 */
  reducedMotion: boolean;
}

/* ============================================================
   时间轴（毫秒）

   网必须赶在白光过曝之前铺满。DiveTransition 里的
   .dive__flash 是 duration 1.3s、times 第二段 0.42，也就是
   546ms 开始抬亮——这是本文件所有时长的硬上限。
   ============================================================ */

/**
 * 波前扫过整屏所需的时间。
 *
 * 刻意很短——要的是「瞬间蔓延」。实测 75% 处（300ms）全部边
 * 就已长完，后面纯粹是淡出，所以总时长压到 400ms 而非更久；
 * 拖长只会让人等着看一张不再变化的网。
 */
const GROWTH_MS = 400;

/** 「激灵」的持续时间：一次极短的抖动 + 过亮 */
const JOLT_MS = 110;

/** 网格边长（像素）。决定网眼的大小 */
const CELL = 74;

interface Node {
  x: number;
  y: number;
  /** 到起点的距离，决定它何时被激活 */
  dist: number;
}

interface Edge {
  /** 较近的端点：边从这里往外长 */
  ax: number;
  ay: number;
  /** 较远的端点 */
  bx: number;
  by: number;
  /** 激活距离 = 近端点到起点的距离 */
  dist: number;
  /** 边自身的长度，用来换算生长耗时 */
  len: number;
}

/**
 * 潜入时的网状生长。
 *
 * 一张不规则的网从点击处迸开，向四面八方迅速蔓延，颜色随之
 * 铺满整屏，起手还带一次短促的「激灵」。
 *
 * 用 Canvas 而不是 DOM/SVG：整张网有一两千条边，每帧都要重算
 * 各自长到了哪里。换成同等数量的 DOM 节点，光是样式重算就足以
 * 让这半秒掉成幻灯片。
 */
export function DiveNetwork({ color, origin, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* 拆成两个数字再进依赖数组。

     origin 在 store 里是个元组，每次 set 都是新引用；
     直接当依赖的话，父组件任何一次重渲染都会把整张网
     拆了重建，生长也会从头来过。 */
  const [oxRatio, oyRatio] = origin;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const ox = oxRatio * w;
    const oy = oyRatio * h;

    /* ---------- 1. 撒点 ----------

       抖动网格：规则网格保证疏密均匀（不会出现空洞或拥挤），
       每个点再在自己格子里随机偏移，于是连出来的网眼大小不一，
       像参考图里那种手绘的不规则结构，而不是渔网。

       向外多铺两圈（-2 到 +2）：网必须在屏幕外就已经成形，
       否则蔓延到边缘时会看到网自己的边界。 */
    const cols = Math.ceil(w / CELL) + 4;
    const rows = Math.ceil(h / CELL) + 4;

    // 固定种子，保证同一次潜入里重绘不会换形状
    let seed = 1013904223;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const nodes: Node[] = [];
    const grid: number[][] = [];

    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        // 抖动幅度 0.34 个格子：够乱，但不至于让相邻点交叉换位
        const x = (c - 2) * CELL + (0.5 + (rnd() - 0.5) * 0.68) * CELL;
        const y = (r - 2) * CELL + (0.5 + (rnd() - 0.5) * 0.68) * CELL;
        grid[r][c] = nodes.length;
        nodes.push({ x, y, dist: Math.hypot(x - ox, y - oy) });
      }
    }

    /* ---------- 2. 连边 ----------

       只连右、下、右下、左下四个方向。这样每对邻居正好被访问
       一次，不必再去重；斜边一并连上，网眼才会是三角与四边形
       混杂的形态，而不是整齐的方格。 */
    const edges: Edge[] = [];
    const DIRS = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = nodes[grid[r][c]];
        for (const [dr, dc] of DIRS) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

          // 斜边只保留一部分，避免每个网眼都被两条对角线切满
          if (dr !== 0 && dc !== 0 && rnd() < 0.45) continue;

          const b = nodes[grid[nr][nc]];

          /* 近的那端作为起点：边一定是从「已经亮起来的节点」
             往外长的，这才叫生长。若固定用 a 当起点，屏幕左上
             方向的边会从外侧往回长，看着像在倒吸。 */
          const [near, far] = a.dist <= b.dist ? [a, b] : [b, a];
          edges.push({
            ax: near.x,
            ay: near.y,
            bx: far.x,
            by: far.y,
            dist: near.dist,
            len: Math.hypot(far.x - near.x, far.y - near.y),
          });
        }
      }
    }

    // 画得越靠外的边越晚被激活，按距离排序后可以提前结束遍历
    edges.sort((p, q) => p.dist - q.dist);

    /** 波前要走完的最远距离：起点到四角中最远的那个 */
    const maxDist = Math.max(
      Math.hypot(ox, oy),
      Math.hypot(w - ox, oy),
      Math.hypot(ox, h - oy),
      Math.hypot(w - ox, h - oy)
    );

    /* ---------- 3. 逐帧绘制 ---------- */

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / GROWTH_MS, 1);

      ctx.clearRect(0, 0, w, h);

      /* 波前半径。

         三次方的缓出：一上来就冲出去很远，然后收慢。
         这条曲线是「蔓延」观感的关键——线性扩散像一圈
         匀速的涟漪，没有爆发力。

         但也不能再陡：曾经这里是五次方，实测走到一半时
         已经激活了 94% 的边，剩下的 260ms 几乎看不出变化——
         前面一闪而过，后面干等。三次方把后半程的变化留住了。

         倍率 1.35：波前只算到最远的角落是不够的——边要从
         近端点开始长，最外层那些边的近端已经在 maxDist 附近，
         再加上它自身长度（最长 168px）才能长完。不留这个余量，
         屏幕四角会永远缺一小块。 */
      const ease = 1 - Math.pow(1 - t, 3);
      const front = ease * maxDist * 1.35;

      /* 「激灵」：开头极短的一次抖动。

         整张网在头 110ms 里随机位移两三个像素，并且过亮。
         幅度用指数衰减压掉，所以它只是一瞬的痉挛，
         而不是持续的抖动。 */
      let jx = 0;
      let jy = 0;
      let flare = 0;
      if (elapsed < JOLT_MS) {
        const k = 1 - elapsed / JOLT_MS;
        const decay = k * k;
        // 频率取无公约数，两个方向的抖动不会同步成一条斜线
        jx = Math.sin(elapsed * 0.9) * 3.2 * decay;
        jy = Math.sin(elapsed * 1.37 + 1.1) * 3.2 * decay;
        flare = decay;
      }

      ctx.save();
      ctx.translate(jx, jy);

      /* 整体淡出：网铺满之后就该让位给白光。
         0.62 之前保持全亮，之后线性退场。 */
      const fade = t < 0.62 ? 1 : 1 - (t - 0.62) / 0.38;

      ctx.strokeStyle = color;
      ctx.globalAlpha = 1;

      /* 一次 beginPath 画完所有边。

         逐条 stroke 会有上千次状态切换，是这里最容易踩的性能坑。
         代价是整批边共用一个透明度——但它们本来就该一起淡出，
         所以没有损失。 */
      ctx.beginPath();

      for (const e of edges) {
        if (e.dist > front) break; // 已按距离排序，后面的更远

        /* 这条边长到了几成。

           除以 len 而不是一个固定值：长边花更长时间长完，
           生长速度因此处处相同，网看起来是匀速铺开的。 */
        const p = Math.min((front - e.dist) / e.len, 1);
        if (p <= 0) continue;

        ctx.moveTo(e.ax, e.ay);
        ctx.lineTo(e.ax + (e.bx - e.ax) * p, e.ay + (e.by - e.ay) * p);
      }

      // 激灵那一瞬线条更粗更亮，像被电流打了一下
      ctx.lineWidth = 1.15 + flare * 1.5;
      ctx.globalAlpha = fade * (0.5 + flare * 0.5);
      ctx.stroke();

      /* 起点附近的一团高光，作为「源头」。
         半径跟着波前走，所以它是随生长一起散开的，
         而不是死钉在中心的一个圆。 */
      const glowR = 30 + front * 0.22;
      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, glowR);
      glow.addColorStop(0, color);
      glow.addColorStop(1, 'transparent');
      ctx.globalAlpha = fade * (0.34 + flare * 0.4) * (1 - t * 0.5);
      ctx.fillStyle = glow;
      ctx.fillRect(ox - glowR, oy - glowR, glowR * 2, glowR * 2);

      ctx.restore();

      if (t < 1) raf = requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      /* 降级：直接画完整的网，不生长也不抖。
         仍然保留这张图，转场才不会变成一片空白。 */
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (const e of edges) {
        ctx.moveTo(e.ax, e.ay);
        ctx.lineTo(e.bx, e.by);
      }
      ctx.stroke();
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(raf);
  }, [color, oxRatio, oyRatio, reducedMotion]);

  return <canvas ref={canvasRef} className="dive__net" />;
}
