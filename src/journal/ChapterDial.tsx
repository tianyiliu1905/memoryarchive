import { useMemo } from 'react';
import type { Chapter } from '@/data/types';
import './dial.css';

interface Props {
  chapters: Chapter[];
  /** 0 ~ 1 的横向阅读进度 */
  progress: number;
  /** 当前所在章节 */
  current: number;
  accent: string;
  /** 点击刻度跳转到某一章 */
  onSeek: (index: number) => void;
  hint: string;
}

/**
 * 表盘式章节进度。
 *
 * 横躺在底部的一把尺：每章一道主刻度，章与章之间填四道细刻度。
 * 游标随阅读进度平滑滑过，经过的刻度被点亮。
 * 章节多的时候不会像圆点那样挤成一团——刻度可以无限细分。
 */
export function ChapterDial({ chapters, progress, current, accent, onSeek, hint }: Props) {
  const total = chapters.length;

  /** 主刻度之间插入的细刻度，纯装饰，给尺子一点密度 */
  const MINOR = 4;

  const ticks = useMemo(() => {
    const out: { pos: number; major: boolean; index: number }[] = [];
    for (let i = 0; i < total; i++) {
      out.push({ pos: total === 1 ? 0 : i / (total - 1), major: true, index: i });
      if (i < total - 1) {
        for (let m = 1; m <= MINOR; m++) {
          out.push({
            pos: (i + m / (MINOR + 1)) / (total - 1),
            major: false,
            index: i,
          });
        }
      }
    }
    return out;
  }, [total]);

  const label = chapters[current]?.marker ?? '';

  return (
    <div className="dial" style={{ ['--dial-accent' as string]: accent }}>
      {/* ---- 左：当前章节读数 ---- */}
      <div className="dial__readout">
        <span className="dial__readout-num">{String(current + 1).padStart(2, '0')}</span>
        <span className="dial__readout-sep">/</span>
        <span className="dial__readout-total">{String(total).padStart(2, '0')}</span>
      </div>

      {/* ---- 中：尺身 ---- */}
      <div className="dial__scale">
        <div className="dial__baseline" />
        <div className="dial__baseline-fill" style={{ transform: `scaleX(${progress})` }} />

        {ticks.map((t, i) => {
          const passed = t.pos <= progress + 0.0001;
          return t.major ? (
            <button
              key={`M${i}`}
              className={`dial__tick dial__tick--major ${passed ? 'is-passed' : ''} ${
                t.index === current ? 'is-current' : ''
              }`}
              style={{ left: `${t.pos * 100}%` }}
              onClick={() => onSeek(t.index)}
              aria-label={chapters[t.index]?.marker}
              title={chapters[t.index]?.marker}
            />
          ) : (
            <span
              key={`m${i}`}
              className={`dial__tick dial__tick--minor ${passed ? 'is-passed' : ''}`}
              style={{ left: `${t.pos * 100}%` }}
            />
          );
        })}

        {/* 游标 */}
        <div className="dial__needle" style={{ left: `${progress * 100}%` }}>
          <span className="dial__needle-stem" />
          <span className="dial__needle-head" />
        </div>
      </div>

      {/* ---- 右：章节名 + 提示 ---- */}
      <div className="dial__tail">
        <span className="dial__label archive-tag">{label}</span>
        <span className="dial__hint archive-tag">{hint}</span>
      </div>
    </div>
  );
}
