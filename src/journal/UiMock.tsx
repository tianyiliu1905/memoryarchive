import type { UiMock as UiMockData, MockBlock } from '@/data/types';
import './uimock.css';

/**
 * 界面复刻——用 DOM 搭出产品界面的「真实结构」。
 *
 * 不是截图、不是 iframe、不是录屏。整个界面由几十个 div 摆出来，
 * 文字全是真的，可选中、可检索、任意缩放都清晰。
 *
 * 关键的取舍是「只借结构，不借皮肤」：
 * 配色全部走本站自己的墨色令牌（--ink-* / --paper-*），
 * 只有极少数需要指出「当前所在」的地方才点一下项目主色。
 * 所以它看起来像一张画在档案本里的界面示意图，
 * 而不是从另一个产品里剪下来贴上的一块。
 *
 * 所有交互元素都是惰性的：没有 button、没有 input、没有 href。
 * 用 aria-hidden 把纯装饰的部分（红绿灯、占位块）对读屏隐藏，
 * 留下真正承载信息的文字。
 */

interface Props {
  mock: UiMockData;
  accent: string;
  /** 并排显示时标注这是「之前」，整体降一档存在感 */
  muted?: boolean;
}

/** 内容区的一块 */
function Block({ block, accent }: { block: MockBlock; accent: string }) {
  switch (block.kind) {
    case 'section':
      return <p className="uimock__section">{block.title}</p>;

    case 'toolbar':
      return (
        <div className="uimock__toolbar">
          {block.chips?.map((c, i) => (
            <span
              key={c}
              className={`uimock__chip ${i === 0 ? 'is-on' : ''}`}
              /* 选中项用主色描边而非填充：填充会形成一块实心色，
                 在这张以线条为主的示意图里显得过重 */
              style={i === 0 ? { borderColor: accent, color: 'var(--ink)' } : undefined}
            >
              {c}
            </span>
          ))}
        </div>
      );

    case 'cards':
      return (
        <div className="uimock__cards">
          {block.items?.map((it) => (
            <div key={it.title} className="uimock__card">
              {/* 缩略图区：不画具体内容，只留一块带斜纹的空地。
                  画了反而会让人去读它，注意力就散了。

                  需要点主色时用 8 位十六进制追加透明度（'1f' ≈ 12%），
                  而不是 color-mix——全站其余地方都没用过后者，
                  且这里的 accent 一定是 #rrggbb 形式，拼接是安全的。 */}
              <span
                className="uimock__card-thumb"
                aria-hidden="true"
                style={it.accent ? { background: `${accent}1f` } : undefined}
              />
              <span className="uimock__card-title">{it.title}</span>
              {it.sub && <span className="uimock__card-sub">{it.sub}</span>}
              {it.tag && <span className="uimock__card-tag">{it.tag}</span>}
            </div>
          ))}
        </div>
      );

    case 'rows':
      return (
        <ul className="uimock__rows">
          {block.items?.map((it) => (
            <li key={it.title} className="uimock__row">
              <span
                className="uimock__row-dot"
                aria-hidden="true"
                style={it.accent ? { background: accent } : undefined}
              />
              <span className="uimock__row-main">
                <span className="uimock__row-title">{it.title}</span>
                {it.sub && <span className="uimock__row-sub">{it.sub}</span>}
              </span>
              {it.tag && <span className="uimock__row-tag">{it.tag}</span>}
            </li>
          ))}
        </ul>
      );

    case 'prompt':
      return (
        /* 静态输入框，不可输入也不会发送。
           刻意不用 <input>：那会进入 Tab 焦点序列，
           让人以为能打字。 */
        <div className="uimock__prompt" aria-label="静态输入框，不可输入">
          <span className="uimock__prompt-text">{block.placeholder}</span>
          <span className="uimock__prompt-send" aria-hidden="true" style={{ background: accent }} />
        </div>
      );

    default:
      return null;
  }
}

export function UiMock({ mock, accent, muted }: Props) {
  const hasSidebar = !!mock.sidebar;

  return (
    <figure className={`uimock ${muted ? 'is-muted' : ''}`}>
      <div
        className={`uimock__frame ${hasSidebar ? '' : 'is-plain'}`}
        role="img"
        aria-label={`${mock.title} 的界面结构示意`}
      >
        {/* ---- 标题栏 ---- */}
        <div className="uimock__bar">
          <span className="uimock__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="uimock__bar-title">{mock.title}</span>
          {/* 明确告诉读者这是重绘的结构，不是产品截图。
              这一点很重要——作品集里放界面，最忌让人误以为是实拍 */}
          <span className="uimock__badge archive-tag">{mock.badge ?? '结构示意'}</span>
        </div>

        <div className="uimock__body">
          {/* ---- 侧边栏 ---- */}
          {mock.sidebar && (
            <nav className="uimock__side" aria-label="静态侧边栏演示">
              {mock.sidebar.brand && (
                <span className="uimock__brand">
                  <i aria-hidden="true" style={{ background: accent }} />
                  {mock.sidebar.brand}
                </span>
              )}
              <ul className="uimock__nav">
                {mock.sidebar.items.map((it, i) =>
                  it.group ? (
                    <li key={i} className="uimock__nav-group archive-tag">
                      {it.label}
                    </li>
                  ) : (
                    <li
                      key={i}
                      className={`uimock__nav-item ${it.active ? 'is-on' : ''}`}
                      style={it.active ? { color: 'var(--ink)' } : undefined}
                    >
                      {/* 当前项用一道主色竖条标出。
                          比整行底色更轻，不会在示意图里压出一块 */}
                      {it.active && (
                        <span className="uimock__nav-mark" aria-hidden="true" style={{ background: accent }} />
                      )}
                      <span className="uimock__nav-label">{it.label}</span>
                      {it.trailing && <span className="uimock__nav-trail">{it.trailing}</span>}
                    </li>
                  )
                )}
              </ul>
            </nav>
          )}

          {/* ---- 内容区 ---- */}
          <div className="uimock__main">
            {mock.blocks.map((b, i) => (
              <Block key={i} block={b} accent={accent} />
            ))}
          </div>
        </div>
      </div>

      {mock.caption && <figcaption className="uimock__caption">{mock.caption}</figcaption>}
    </figure>
  );
}
