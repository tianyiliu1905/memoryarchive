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

   网必须赶在白光过曝之前演完。DiveTransition 里的
   .dive__flash 是 duration 1.3s、times 第二段 0.5，也就是
   650ms 开始抬亮、峰值落在 858ms——这是硬上限。

   这里有三条各自独立的时间线，分开是故意的：
     GROWTH —— 结构何时铺满（快，负责「迸开」）
     COLOR  —— 颜色波何时扫完（慢，负责「流动」）
     LIFE   —— 整张网何时退场

   合起来是这样一串（实测值）：
     0        点击，网从此处迸开
     ~110ms   激灵结束
     ~223ms   中心的颜色褪尽 ← 用户要的「中间逐渐消失」
     ~300ms   结构基本铺满全屏
     ~380ms   颜色波抵达屏幕边缘
     ~608ms   网开始淡出
     ~640ms   颜色波完全穿出屏幕
     ~650ms   白光接手
   ============================================================ */

/**
 * 结构的波前扫过整屏所需的时间。
 *
 * 刻意很短——要的是「瞬间蔓延」。实测 75% 处（300ms）全部边
 * 就已长完。拖长只会让人等着看一张不再变化的网。
 */
const GROWTH_MS = 400;

/**
 * 颜色波扫过整屏所需的时间。
 *
 * 比生长慢一倍有余，这是整个效果能不能被看清的关键。
 *
 * 结构用三次缓出，一上来就冲出去很远（150ms 内就盖住了
 * 大半个屏幕）。颜色波若也跟着这条曲线，从中心涌到边缘
 * 只需一两帧，根本来不及看——只会看到网突然换了个颜色。
 * 拆成两条时间线后，结构仍然是爆炸式的，而颜色是游过去的。
 */
const COLOR_MS = 640;

/**
 * 颜色波的缓出指数。越大越「前快后慢」，1 即匀速。
 *
 * 取 1.3——几乎是匀速，只给开头一点点初速。
 *
 * 曾经这里是 2，算下来波前 283ms 就冲出了屏幕，
 * 剩下的三百多毫秒屏上几乎没有变化——与上面刚批评过的
 * 「前面一闪而过，后面干等」是同一个毛病。
 *
 * 扩散的叙事和迸发不同：迸发靠初速，扩散靠持续。
 * 波速越匀，每一帧的变化量越均匀，“流” 的感觉才成立。
 */
const COLOR_EASE = 1.3;

/** 整张网的存续时间（含末尾的淡出）。结束时正好交给白光 */
const LIFE_MS = 760;

/** 网从何时开始淡出（占 LIFE_MS 的比例）。
 *  0.8 ≈ 608ms，此时颜色波已经冲出屏幕、只剩四角在褪，
 *  正是可以让位的时刻。再早会把波未完的那一段一起减掉。 */
const FADE_FROM = 0.8;

/** 「激灵」的持续时间：一次极短的抖动 + 过亮 */
const JOLT_MS = 110;

/** 网格边长（像素）。决定网眼的大小 */
const CELL = 74;

/* ---- 颜色波的形状 ----

   波是不对称的：前沿陡，尾巴长。这是所有「扩散」类动效都
   有的形状——涨潮、燃烧、墨滴入水莫不如此。对称的波看起来
   像一圈在平移的带子，没有方向感。 */

/** 波前向外的渗透距离，占最远半径的比例。窄 = 前沿干净 */
const LEAD_RATIO = 0.1;

/** 波后的拖尾长度，占最远半径的比例。
 *
 *  它直接决定「中心多久褥尽」：波前走出这么远时，
 *  圆心就完全退成中性色了。取 0.62 算下来约在 200ms，
 *  能看清过程又不至于拖沓。 */
const TRAIL_RATIO = 0.62;

/** 颜色分多少档。
 *
 *  不逐条边描边（上千次 stroke 会直接把帧率打死），
 *  而是按强度分档，每档一次 stroke。因为边已经按距离排好序，
 *  同一档的边在数组里是连续的，扫一遍就能分完。
 *  14 档在观感上已经是连续渐变，每帧最多 28 次 stroke。 */
const BANDS = 14;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** #rgb / #rrggbb → [r, g, b]。解不出就给个中性灰，不让转场挂掉 */
function parseHex(hex: string): [number, number, number] {
  const s = hex.trim().replace('#', '');
  if (s.length === 3) {
    const [r, g, b] = s.split('').map((c) => parseInt(c + c, 16));
    return [r, g, b];
  }
  if (s.length === 6) {
    return [
      parseInt(s.slice(0, 2), 16),
      parseInt(s.slice(2, 4), 16),
      parseInt(s.slice(4, 6), 16),
    ];
  }
  return [150, 150, 155];
}

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

    const [cr, cg, cb] = parseHex(color);

    /* 颜色退尽之后剩下的中性色。
       不是透明——网的结构要留着，只是没了颜色。
       取一个偏冷的浅灰，和纸面同调，不会显得脏。 */
    const NR = 154;
    const NG = 154;
    const NB = 158;

    const leadDist = maxDist * LEAD_RATIO;
    const trailDist = maxDist * TRAIL_RATIO;

    /* 各档预先算好颜色字符串，避免每帧拼接上百次。
       第 i 档代表强度区间的中值。 */
    const bandColors: string[] = [];
    for (let i = 0; i < BANDS; i++) {
      const s = (i + 0.5) / BANDS;
      const r = Math.round(mix(NR, cr, s));
      const g = Math.round(mix(NG, cg, s));
      const b = Math.round(mix(NB, cb, s));
      bandColors.push(`rgb(${r},${g},${b})`);
    }

    const start = performance.now();
    let raf = 0;

    /* 每档一个桶，连同「已长出的边」都在效果作用域里建好，
       每帧只把 length 置零重用。这条路径一秒跑六十次、
       每次要装上千条边，现场新建数组等于把 GC 拉进动画里。 */
    const buckets: Edge[][] = Array.from({ length: BANDS }, () => []);
    const grown: Edge[] = [];
    /** 各边当帧的生长进度，与 grown 同序。算一次，描边时反复查 */
    const grownP: number[] = [];
    /** 边在 grown 里的下标，供颜色档反查进度用 */
    const bandIdx: number[][] = Array.from({ length: BANDS }, () => []);

    const draw = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / GROWTH_MS, 1);
      const life = Math.min(elapsed / LIFE_MS, 1);

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

      /* 整张网的退场。
         FADE_FROM 之前保持全亮，之后线性淡出，交给白光。
         这里跟的是 life 而不是 t——结构 400ms 就长完了，
         但颜色波还要再走两百多毫秒，不能让网先一步消失。 */
      const fade =
        life < FADE_FROM ? 1 : 1 - (life - FADE_FROM) / (1 - FADE_FROM);

      /* ---- 颜色波的位置 ----

         走一条独立的、比结构更缓的曲线。

         末端乘 1.45：波必须走到屏幕之外才算「穿过去了」。

         余量的上限是 1 + TRAIL_RATIO（= 1.62）——到那个数时
         连最远的角落也被拖尾扫干净，整张网退回中性色。这里
         停在 1.45 是留了一手：结束时四角仍挂着最后一点颜色，
         紧接着被白光接管。完全排空反而显得色彩是「漏光了」，
         而不是流过去了。 */
      const ct = Math.min(elapsed / COLOR_MS, 1);
      const colorFront =
        (1 - Math.pow(1 - ct, COLOR_EASE)) * maxDist * 1.45;

      /* 把已激活的边按颜色强度分进各档。

         强度的定义（d 为边到起点的距离）：
           d 在波前之外           → 0，还没被颜色够到
           d 正好在波前           → 1，最浓
           d 落在波后的拖尾里     → 从 1 线性衰减到 0
           d 比拖尾还靠内         → 0，颜色已经退尽

         中心因此会自己褪掉：波前越走越远，圆心与波前的距离
         不断拉大，一旦超过 trailDist 就完全回到中性色。
         这正是「中间的颜色逐渐消失」。 */
      for (let i = 0; i < BANDS; i++) {
        buckets[i].length = 0;
        bandIdx[i].length = 0;
      }
      grown.length = 0;
      grownP.length = 0;

      for (const e of edges) {
        if (e.dist > front) break; // 已按距离排序，后面的更远

        /* 这条边长到了几成。

           除以 len 而不是一个固定值：长边花更长时间长完，
           生长速度因此处处相同，网看起来是匀速铺开的。 */
        const p = Math.min((front - e.dist) / e.len, 1);
        if (p <= 0) continue;

        const gi = grown.length;
        grown.push(e);
        grownP.push(p);

        // 相对波前的位置：正数在波前之内（已被扫过），负数在外
        const rel = colorFront - e.dist;

        let s: number;
        if (rel < -leadDist) {
          s = 0; // 波还没到
        } else if (rel < 0) {
          s = 1 + rel / leadDist; // 前沿的一小段渗透
        } else if (rel < trailDist) {
          s = 1 - rel / trailDist; // 波后拖尾，越靠内越淡
        } else {
          s = 0; // 颜色已经退尽
        }

        if (s <= 0) continue;

        const bi = Math.min(BANDS - 1, Math.floor(s * BANDS));
        buckets[bi].push(e);
        bandIdx[bi].push(gi);
      }

      ctx.lineWidth = 1.15 + flare * 1.5;

      /* 先铺一层中性色的底：所有已长出的边。

         这一层保证结构始终可见——颜色退去之后网还在，
         只是没了颜色。若省掉它，中心会随着颜色消失而
         整个空掉，看起来像网自己烧没了。 */
      ctx.strokeStyle = `rgb(${NR},${NG},${NB})`;
      ctx.globalAlpha = fade * (0.34 + flare * 0.3);
      ctx.beginPath();
      for (let i = 0; i < grown.length; i++) {
        const e = grown[i];
        const p = grownP[i];
        ctx.moveTo(e.ax, e.ay);
        ctx.lineTo(e.ax + (e.bx - e.ax) * p, e.ay + (e.by - e.ay) * p);
      }
      ctx.stroke();

      /* 再按档叠上颜色。档号越高颜色越浓、也越不透明。

         每档一次 stroke，14 档即每帧 14 次状态切换——
         相比逐条边的上千次，这是可以接受的。 */
      for (let i = 0; i < BANDS; i++) {
        const bucket = buckets[i];
        if (bucket.length === 0) continue;

        const s = (i + 0.5) / BANDS;

        ctx.strokeStyle = bandColors[i];
        // 透明度也跟着强度走，浓的地方才真正「亮」起来
        ctx.globalAlpha = fade * (0.28 + s * 0.62) * (0.7 + flare * 0.3);

        const idx = bandIdx[i];
        ctx.beginPath();
        for (let k = 0; k < bucket.length; k++) {
          const e = bucket[k];
          const p = grownP[idx[k]];
          ctx.moveTo(e.ax, e.ay);
          ctx.lineTo(e.ax + (e.bx - e.ax) * p, e.ay + (e.by - e.ay) * p);
        }
        ctx.stroke();
      }

      /* 源头的高光。

         它现在跟着颜色波走，而不是结构的波前——因为它代表的是
         「颜色从这里涌出来」。半径随波扩大的同时透明度衰减，
         于是中心的亮团会自己散开、褪去，和边的褪色是同一件事。 */
      const glowR = 30 + colorFront * 0.3;
      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, glowR);
      glow.addColorStop(0, color);
      glow.addColorStop(1, 'transparent');
      // (1 - ct)² 让它在波走远之后彻底消失，不留一个钉在中心的光斑
      ctx.globalAlpha = fade * (0.34 + flare * 0.4) * Math.pow(1 - ct, 2);
      ctx.fillStyle = glow;
      ctx.fillRect(ox - glowR, oy - glowR, glowR * 2, glowR * 2);

      ctx.restore();

      if (life < 1) raf = requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      /* 降级：直接画完整的网，不生长也不抖。

         画的是动画的终态而非起始态——中性色的网，颜色只剩在
         外沿。于是「颜色已经流走了」这层意思仍然成立，
         只是省掉了流动的过程本身，这正是降级该做的取舍。 */
      ctx.lineWidth = 1.15;

      ctx.strokeStyle = `rgb(${NR},${NG},${NB})`;
      ctx.globalAlpha = 0.34;
      ctx.beginPath();
      for (const e of edges) {
        ctx.moveTo(e.ax, e.ay);
        ctx.lineTo(e.bx, e.by);
      }
      ctx.stroke();

      // 外沿那一圈：用与动画里同一套分档逻辑，取波停在边缘的那一刻
      for (let i = 0; i < BANDS; i++) buckets[i].length = 0;
      for (const e of edges) {
        const rel = maxDist - e.dist;
        if (rel < 0 || rel >= trailDist) continue;
        const s = 1 - rel / trailDist;
        buckets[Math.min(BANDS - 1, Math.floor(s * BANDS))].push(e);
      }
      for (let i = 0; i < BANDS; i++) {
        if (buckets[i].length === 0) continue;
        const s = (i + 0.5) / BANDS;
        ctx.strokeStyle = bandColors[i];
        ctx.globalAlpha = (0.28 + s * 0.62) * 0.7;
        ctx.beginPath();
        for (const e of buckets[i]) {
          ctx.moveTo(e.ax, e.ay);
          ctx.lineTo(e.bx, e.by);
        }
        ctx.stroke();
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(raf);
  }, [color, oxRatio, oyRatio, reducedMotion]);

  return <canvas ref={canvasRef} className="dive__net" />;
}
