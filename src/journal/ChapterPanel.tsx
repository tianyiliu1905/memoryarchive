import { useRef, useEffect, useState } from 'react';
import type { Chapter, MemoryCluster, Project } from '@/data/types';
import { Plate } from './Plate';
import './chapter.css';

interface Props {
  chapter: Chapter;
  project: Project;
  accent: MemoryCluster;
  index: number;
  onExit: () => void;
}

/** 进入视野后触发显影，元素按序缓慢浮出 */
function useDevelop() {
  const ref = useRef<HTMLElement>(null);
  const [developed, setDeveloped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setDeveloped(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: '-8% 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, developed };
}

export function ChapterPanel({ chapter, project, accent, index, onExit }: Props) {
  const { ref, developed } = useDevelop();
  const kind = chapter.kind;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`chapter chapter--${kind} ${developed ? 'is-developed' : ''}`}
      style={{ ['--i' as string]: index }}
    >
      {/* ================= 封面 ================= */}
      {kind === 'cover' && (
        <div className="chapter__cover">
          <span className="chapter__marker archive-tag" data-parallax="0.16" style={{ color: accent.colorDeep }}>
            {chapter.marker}
          </span>

          <h1 className="chapter__title" data-parallax="0.04">
            {chapter.heading?.split('\n').map((line, i) => (
              <span key={i} className="chapter__title-line" style={{ ['--l' as string]: i }}>
                {line}
              </span>
            ))}
          </h1>

          {chapter.body?.[0] && (
            <p className="chapter__lede" data-parallax="0.1">
              {chapter.body[0]}
            </p>
          )}

          {chapter.meta && (
            <dl className="chapter__meta" data-parallax="0.13">
              {chapter.meta.map((m) => (
                <div key={m.label} className="chapter__meta-row">
                  <dt className="archive-tag">{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <span className="chapter__glow" style={{ background: accent.color }} />
        </div>
      )}

      {/* ================= 起因 / 过程 / 回望 ================= */}
      {(kind === 'origin' || kind === 'process' || kind === 'reflection') && (
        <div className="chapter__spread">
          <div className="chapter__text" data-parallax="0.12">
            <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
              {chapter.marker}
            </span>
            {chapter.heading && <h2 className="chapter__heading">{chapter.heading}</h2>}
            {chapter.body?.map((p, i) => (
              <p key={i} className="chapter__para" style={{ ['--p' as string]: i }}>
                {p}
              </p>
            ))}
            {chapter.annotation && (
              <aside className="chapter__annotation serif-note" style={{ borderColor: accent.color }}>
                {chapter.annotation}
              </aside>
            )}
          </div>

          {chapter.plates && chapter.plates.length > 0 && (
            <div className="chapter__plates" data-parallax="0.035">
              {chapter.plates.map((pl) => (
                <Plate key={pl.index} plate={pl} accent={accent.color} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 结果 ================= */}
      {kind === 'result' && (
        <div className="chapter__result">
          <div className="chapter__text" data-parallax="0.12">
            <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
              {chapter.marker}
            </span>
            {chapter.heading && <h2 className="chapter__heading chapter__heading--big">{chapter.heading}</h2>}
            {chapter.body?.map((p, i) => (
              <p key={i} className="chapter__para" style={{ ['--p' as string]: i }}>
                {p}
              </p>
            ))}
            {chapter.points && (
              <ul className="chapter__points">
                {chapter.points.map((pt, i) => (
                  <li key={i} style={{ ['--p' as string]: i }}>
                    <span className="chapter__bullet" style={{ background: accent.color }} />
                    {pt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {chapter.plates && (
            <div className="chapter__plates chapter__plates--wide" data-parallax="0.03">
              {chapter.plates.map((pl) => (
                <Plate key={pl.index} plate={pl} accent={accent.color} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 下一段记忆 ================= */}
      {kind === 'next' && (
        <div className="chapter__outro">
          <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
            {chapter.marker}
          </span>
          <p className="chapter__outro-line serif-note">{chapter.heading}</p>

          <button className="chapter__return" onClick={onExit}>
            <span className="chapter__return-ring" style={{ borderColor: accent.color }}>
              <span className="chapter__return-core" style={{ background: accent.color }} />
            </span>
            <span className="chapter__return-label">返回记忆盆</span>
            <span className="archive-tag">{project.archiveId} — end of memory</span>
          </button>

          <span className="chapter__outro-fade" />
        </div>
      )}
    </section>
  );
}
