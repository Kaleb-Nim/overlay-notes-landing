// lib/content.ts
//
// Single source of truth for the visible FAQ (CONT-06) and the origin story (CONT-07).
// Every string here is fixed, build-time-authored copy — never runtime-empty or
// user-generated. Each entry carries a `source` provenance tag pointing at the named
// line in `../overlay-notes/store/STORE-LISTING.md` or `../overlay-notes/README.md`
// (or the design handoff itself) that it was verified against this session.
//
// Shape note (CONT-06): `faqs[]` is `{question, answer, source}[]`, consumed by
// Phase 2's VISIBLE FAQ section only. Do NOT add FAQPage-JSON-LD-shaped fields here —
// FAQPage rich results are explicitly banned (REQUIREMENTS.md Out of Scope; Google
// removed FAQ rich results 2026-05-07). Phase 3's JSON-LD is SoftwareApplication only
// and does not consume this array.

export interface Faq {
  question: string;
  answer: string;
  /** Provenance: file + section this answer is verified against. */
  source: string;
}

export const faqs: Faq[] = [
  {
    question: 'How do I draw on a webpage in Chrome?',
    answer:
      'Install Overlay Notes, open the grab pill on any page, and draw directly over the content with the marker, shapes, arrows or text tools.',
    source:
      'store/STORE-LISTING.md "HOW TO USE" — "Grab the canvas to draw: click the green pill (or press Alt+Shift+E)"',
  },
  {
    question: 'Can I annotate a website and save my notes?',
    answer: 'Yes. Notes save automatically per URL in your browser and reappear when you return to the page.',
    source:
      'store/STORE-LISTING.md detailed description — "save per page, stay 100% local" / "reappear the next time you open that URL"',
  },
  {
    question: 'Is there an Excalidraw extension for Chrome?',
    answer:
      'Overlay Notes is an Excalidraw-style sketch canvas that draws on the live page instead of a separate blank canvas.',
    source:
      'store/STORE-LISTING.md "HOW IT\'S DIFFERENT" — "Excalidraw itself is a great whiteboard, but it\'s a blank canvas in its own tab... This puts that same canvas directly on the page."',
  },
  {
    question: 'Do my notes stay on the page when I scroll?',
    answer: 'Yes. Annotations pin to the content, not the screen, so they scroll with the page.',
    source:
      'README.md "Features" — "Scroll-anchored drawings — a sketch placed beside a paragraph stays beside that paragraph as you scroll"',
  },
  {
    question: 'Are my notes private or stored anywhere online?',
    answer: 'Everything is stored locally in your browser. Nothing is collected, transmitted, sold, or shared.',
    source:
      'store/STORE-LISTING.md "PRIVACY" — "Everything stays on your device... Nothing is collected, transmitted, sold, or shared." (this sentence IS the CONT-03 certified privacy statement, verbatim except for capitalization at the sentence start)',
  },
  {
    question: 'Does it work offline?',
    answer: 'Yes. Overlay Notes runs entirely in your browser and works offline.',
    source: 'store/STORE-LISTING.md "PRIVACY" — "it works offline" / README.md "Works on any site... online and offline."',
  },
];

export const originStory = {
  text:
    'Built while cramming for NUS CS2030 (Programming Methodology II). I wanted to scribble on lecture notes in the browser the way I do on paper — arrows, question marks, "wait, why?" — so I made a marker that lives on top of the web.',
  /** The bold span in the prototype wraps "NUS CS2030 (Programming Methodology II)" —
   * Phase 2's JSX should reproduce that <b> wrapping directly (matching concept-1a.html),
   * rather than deriving it from this plain string. */
  source:
    'design-handoff/concept-1a.html .origin p line 216 (verbatim, this IS the design handoff\'s source of truth per CONTEXT.md); corroborated by README.md "Why I built this" — "This started while I was studying for NUS CS2030."',
} as const;
