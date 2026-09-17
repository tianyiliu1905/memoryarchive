import { useRef, useEffect, useState } from 'react';
import type { Chapter, MemoryCluster, Project } from '@/data/types';
import { Plate } from './Plate';
import { UiMock } from './UiMock';
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
                    <span
                  className="chapter__bullet"
                  style={{ background: accent.color, color: accent.color }}
                />
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

      {/* ================= 整屏一句话 ================= */}
      {kind === 'statement' && (
        <div className="chapter__statement" data-parallax="0.2">
          <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
            {chapter.marker}
          </span>
          <p className="chapter__statement-line">{chapter.statement}</p>
          {chapter.annotation && (
            <span className="chapter__statement-sub serif-note">{chapter.annotation}</span>
          )}
          <span className="chapter__glow" style={{ background: accent.color }} />
        </div>
      )}

      {/* ================= 左右对照 ================= */}
      {kind === 'contrast' && chapter.contrast && (
        <div className="chapter__contrast">
          <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
            {chapter.marker}
          </span>
          {chapter.heading && <h2 className="chapter__heading">{chapter.heading}</h2>}

          <div className="chapter__contrast-pair" data-parallax="0.06">
            {chapter.contrast.map((side, i) => (
              <div
                key={i}
                className={`chapter__side ${i === 1 ? 'is-after' : ''}`}
                style={{ ['--p' as string]: i }}
              >
                <span
                  className="chapter__side-tag archive-tag"
                  style={i === 1 ? { color: accent.colorDeep } : undefined}
                >
                  {side.tag}
                </span>
                <h3 className="chapter__side-heading">{side.heading}</h3>
                <ul className="chapter__side-list">
                  {side.lines.map((l, j) => (
                    <li key={j}>{l}</li>
                  ))}
                </ul>
                {i === 1 && (
                  <span className="chapter__side-mark" style={{ background: accent.color }} />
                )}
              </div>
            ))}
            <span className="chapter__contrast-arrow" style={{ color: accent.colorDeep }}>
              →
            </span>
          </div>
        </div>
      )}

      {/* ================= 行话 → 人话 ================= */}
      {kind === 'translate' && chapter.translations && (
        <div className="chapter__translate">
          <div className="chapter__translate-head">
            <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
              {chapter.marker}
            </span>
            {chapter.heading && <h2 className="chapter__heading">{chapter.heading}</h2>}
            {chapter.body?.map((p, i) => (
              <p key={i} className="chapter__para" style={{ ['--p' as string]: i }}>
                {p}
              </p>
            ))}
          </div>

          <ul className="chapter__pairs" data-parallax="0.05">
            {chapter.translations.map((t, i) => (
              <li key={i} className="chapter__pair" style={{ ['--p' as string]: i }}>
                <span className="chapter__pair-from">{t.from}</span>
                <span className="chapter__pair-arrow" style={{ color: accent.color }}>
                  →
                </span>
                <span className="chapter__pair-to">{t.to}</span>
                <span className="chapter__pair-why">{t.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= 编号推进 ================= */}
      {kind === 'steps' && chapter.steps && (
        <div className="chapter__steps-wrap">
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
          </div>

          <ol className="chapter__steps" data-parallax="0.04">
            {chapter.steps.map((s, i) => (
              <li key={i} className="chapter__step" style={{ ['--p' as string]: i }}>
                <span className="chapter__step-no archive-tag" style={{ color: accent.colorDeep }}>
                  {s.no}
                </span>
                <span className="chapter__step-body">
                  <span className="chapter__step-title">{s.title}</span>
                  <span className="chapter__step-detail">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ================= 界面复刻 ================= */}
      {kind === 'uimock' && chapter.mocks && (
        <div className="chapter__uimock-wrap">
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

          {/* 两个 Mock 则左右对照（改版前 / 后），一个则单独站住。
              对照时把第一个压暗，视线会自己落到后者上 */}
          <div
            className={`chapter__mocks ${chapter.mocks.length > 1 ? 'is-pair' : ''}`}
            data-parallax="0.035"
          >
            {chapter.mocks.map((m, i) => (
              <UiMock
                key={i}
                mock={m}
                accent={accent.color}
                muted={chapter.mocks!.length > 1 && i === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================= 资料：条目开篇 ================= */}
      {kind === 'brief' && (
        <div className="chapter__brief">
          <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
            {chapter.marker}
          </span>
          <h1 className="chapter__brief-title">{chapter.heading}</h1>
          {chapter.body?.map((p, i) => (
            <p key={i} className="chapter__para" style={{ ['--p' as string]: i }}>
              {p}
            </p>
          ))}
          {chapter.meta && (
            <dl className="chapter__meta chapter__meta--tight">
              {chapter.meta.map((m) => (
                <div key={m.label} className="chapter__meta-row">
                  <dt className="archive-tag">{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {/* ================= 资料：一张表 ================= */}
      {kind === 'table' && chapter.table && (
        <div className="chapter__table-wrap">
          <div className="chapter__table-head">
            <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
              {chapter.marker}
            </span>
            {chapter.heading && <h2 className="chapter__heading chapter__heading--ref">{chapter.heading}</h2>}
          </div>

          <table className="chapter__table">
            <thead>
              <tr>
                {chapter.table.head.map((h, i) => (
                  <th key={i} className="archive-tag">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chapter.table.rows.map((row, i) => (
                <tr key={i} style={{ ['--p' as string]: i }}>
                  {row.map((cell, j) => (
                    <td key={j} className={j === 0 ? 'is-key' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {chapter.table.note && (
            <p className="chapter__table-note">{chapter.table.note}</p>
          )}
        </div>
      )}

      {/* ================= 资料：键值清单 ================= */}
      {kind === 'specs' && (
        <div className="chapter__specs-wrap">
          <div className="chapter__table-head">
            <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
              {chapter.marker}
            </span>
            {chapter.heading && <h2 className="chapter__heading chapter__heading--ref">{chapter.heading}</h2>}
          </div>

          <ul className="chapter__specs">
            {chapter.points?.map((pt, i) => {
              const [k, ...rest] = pt.split('｜');
              return (
                <li key={i} style={{ ['--p' as string]: i }}>
                  <span className="chapter__spec-key">{k}</span>
                  <span className="chapter__spec-val">{rest.join('｜')}</span>
                </li>
              );
            })}
          </ul>

          {chapter.plates && (
            <div className="chapter__plates" data-parallax="0.03">
              {chapter.plates.map((pl) => (
                <Plate key={pl.index} plate={pl} accent={accent.color} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 资料：代码片段 ================= */}
      {kind === 'snippet' && chapter.code && (
        <div className="chapter__snippet-wrap">
          <div className="chapter__table-head">
            <span className="chapter__marker archive-tag" style={{ color: accent.colorDeep }}>
              {chapter.marker}
            </span>
            {chapter.heading && <h2 className="chapter__heading chapter__heading--ref">{chapter.heading}</h2>}
          </div>

          {chapter.body?.map((p, i) => (
            <p key={i} className="chapter__para" style={{ ['--p' as string]: i }}>
              {p}
            </p>
          ))}

          <pre className="chapter__code">
            <span className="chapter__code-lang archive-tag">{chapter.code.lang}</span>
            <code>
              {chapter.code.lines.map((l, i) => (
                <span key={i} className="chapter__code-line">
                  <span className="chapter__code-no">{String(i + 1).padStart(2, '0')}</span>
                  {l}
                </span>
              ))}
            </code>
          </pre>
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
              <span
              className="chapter__return-core"
              style={{ background: accent.color, color: accent.color }}
            />
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
