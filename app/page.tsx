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

const WEBSTORE_URL =
  'https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck';
const REPO_URL = 'https://github.com/kaleb-nim/overlay-notes';

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
                A transparent, Excalidraw-style sketch canvas on top of any website. Handwrite
                over what you&apos;re reading — notes pin to the content, scroll with the page,
                and save locally per URL.
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
    </>
  );
}
