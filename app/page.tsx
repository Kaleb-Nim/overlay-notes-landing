// app/page.tsx — Phase 2: the complete marker-on-paper landing page.
//
// Ported pixel-faithfully from .planning/design-handoff/concept-1a.html's <body>,
// using the section classes already promoted into app/globals.css (Phase 1 +
// Plan 02-01). Wired to lib/content.ts (faqs[], originStory) and lib/site-config.ts.
// Applies the 5 known-defect fixes documented in 02-UI-SPEC.md / 02-CONTEXT.md:
//   1. Nav "Features"/"FAQ" are real <a href="#…"> anchors (not <span>); "How it
//      works" dropped. Target sections carry matching ids.
//   2. Reduced-motion guard for the squiggle lives in globals.css already.
//   3. Support section uses the promoted .support-*/.tip-chip classes, not inline
//      styles.
//   4. Tip chips ($3/$8/$20/"or whatever!") are non-interactive plain <span>s.
//   5. No stale prototype <head>/meta/JSON-LD content is ported into the body —
//      Phase 3 owns all metadata.
//
// Static Server Component — no client interactivity beyond CSS animation and
// next/image.

import Image from 'next/image';
import { faqs } from '@/lib/content';

const WEBSTORE_URL =
  'https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck';
const REPO_URL = 'https://github.com/kaleb-nim/overlay-notes';
const SUPPORT_URL = 'https://buymeacoffee.com/kaleb-nim';
const PRIVACY_URL = 'https://kaleb-nim.github.io/overlay-notes/';
const EXCALIDRAW_URL = 'https://excalidraw.com';

export default function Home() {
  return (
    <>
      <header>
        <div className="wrap">
          <nav>
            <div className="brand">
              <Image
                src="/icon.png"
                alt="Overlay Notes icon — a browser window with a purple marker sketch"
                width={34}
                height={34}
              />
              <span>Overlay&nbsp;Notes</span>
            </div>
            <div className="navlinks">
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
              <a className="btn-ghost" href={REPO_URL}>
                GitHub
              </a>
            </div>
          </nav>

          <div className="hero" id="hero">
            <div>
              <div className="pill">✦ Free · Chrome · 100% local</div>
              <h1>
                Draw &amp; annotate notes on <span>any webpage</span>
              </h1>
              <svg
                className="sq"
                viewBox="0 0 320 22"
                width="270"
                height="19"
                style={{ display: 'block', margin: '-2px 0 14px' }}
                aria-hidden="true"
              >
                <path
                  d="M4,14 C50,4 80,20 130,11 S220,2 260,13 S310,7 316,12"
                  fill="none"
                  stroke="#5b3df5"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
              <p>
                Sketch diagrams that have a hand-drawn feel to them on any website in real
                time. Add text, lines, arrows, and shapes as you write your study notes. Saved
                automatically every time you revisit the site.
              </p>
              <div className="cta-row">
                <a className="btn-primary" href={WEBSTORE_URL}>
                  + Add to Chrome
                </a>
                <a className="btn-dashed" href={REPO_URL}>
                  View on GitHub
                </a>
              </div>
            </div>
            <div className="shot">
              <div className="frame">
                <Image
                  src="/annotate-hero.png"
                  alt="Handwritten notes, arrows and underlines drawn over a CS2030 lecture-notes webpage"
                  width={1280}
                  height={800}
                  priority
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div className="tape"></div>
              <div className="note-r">
                scrolls with
                <br />
                the page →
              </div>
              <svg className="arrow" viewBox="0 0 90 60" aria-hidden="true">
                <path
                  d="M84,8 C50,4 20,26 10,52"
                  fill="none"
                  stroke="#211d2e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M4,40 L9,54 L22,48"
                  fill="none"
                  stroke="#211d2e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="note-b">
                your real notes,
                <br />
                saved here
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="who" id="who">
        <div className="wrap">
          <div className="kicker">made for margin-scribblers ↴</div>
          <h2>Who it&apos;s for</h2>
          <div className="chips">
            <span className="chip">📚 Students</span>
            <span className="chip">🔬 Researchers</span>
            <span className="chip">🧠 Self-learners</span>
            <span className="chip">💻 Devs reading docs</span>
          </div>
          <p>
            Anyone who marks up what they read — arrows, question marks, &quot;wait, why?&quot;
            — right on the page.
          </p>
        </div>
      </section>

      <section className="band" id="features">
        <div className="wrap">
          <h2>What you can do</h2>
          <p className="sub">Freehand marker, shapes, arrows and text — right on the live page.</p>
          <div className="cards">
            <div className="card">
              <div className="t">✎ Sketch anywhere</div>
              <div className="d">Draw over any website — freehand, arrows, shapes, text.</div>
            </div>
            <div className="card">
              <div className="t">↕ Scrolls with it</div>
              <div className="d">Notes pin to the content, not the screen.</div>
            </div>
            <div className="card">
              <div className="t">💾 Autosaves</div>
              <div className="d">Saved per URL, locally. Reappears on revisit — no account.</div>
            </div>
            <div className="card">
              <div className="t">🌐 Everywhere</div>
              <div className="d">Works on strict sites like GitHub. Offline too.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="diff" id="how-its-different">
        <div className="wrap">
          <h2>How it&apos;s different</h2>
          <div className="cols">
            <div>
              <div className="h">vs. highlighters</div>
              <div className="b">
                They only mark text. Draw arrows, diagrams and handwriting <i>anywhere</i>.
              </div>
            </div>
            <div>
              <div className="h">vs. Excalidraw</div>
              <div className="b">
                The excalidraw chrome extension that draws on the <i>live page</i> — not a blank
                canvas.
              </div>
            </div>
            <div>
              <div className="h">vs. screenshots</div>
              <div className="b">
                Notes stay attached to the living page and come back on revisit. Keep browsing.
              </div>
            </div>
          </div>

          <div className="origin" id="origin-story">
            <div className="tag">the story</div>
            <p>
              Built while cramming for <b>NUS CS2030 (Programming Methodology II)</b>. I wanted
              to scribble on lecture notes in the browser the way I do on paper — arrows,
              question marks, &quot;wait, why?&quot; — so I made a marker that lives on top of
              the web.
            </p>
          </div>
        </div>
      </section>

      <section className="diff" id="faq">
        <div className="wrap">
          <h2>FAQ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {faqs.map((faq) => (
              <div key={faq.question}>
                <div className="h">{faq.question}</div>
                <div className="b">{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="support" id="support">
        <div className="wrap">
          <div className="support-card">
            <div className="support-tag">☕ support</div>
            <div className="support-grid">
              <div>
                <h2>Keep the marker uncapped</h2>
                <p>
                  Overlay Notes is <b>free and always will be</b> — no accounts, no ads, nothing
                  tracked. I&apos;m a solo developer covering the hosting and build costs myself.
                  If it&apos;s saved you some scribbling, a small tip keeps it alive and growing.
                </p>
                <div className="support-cta-row">
                  <a className="btn-coffee" href={SUPPORT_URL}>
                    ☕ Buy me a coffee
                  </a>
                </div>
              </div>
              <div className="support-tips">
                <div className="support-tip-kicker">every tip = one more late-night feature ↴</div>
                <div className="support-tip-chips">
                  <span className="tip-chip">$3</span>
                  <span className="tip-chip tip-chip--alt">$8</span>
                  <span className="tip-chip tip-chip--featured">$20</span>
                  <span className="tip-note">or whatever!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="footer">
        <div className="wrap">
          <span className="footer-year">© Overlay Notes</span>
          <span className="flinks">
            <a href={REPO_URL}>GitHub</a>
            <a href={PRIVACY_URL}>Privacy</a>
            <a href={EXCALIDRAW_URL}>Excalidraw (MIT)</a>
          </span>
        </div>
      </footer>
    </>
  );
}
