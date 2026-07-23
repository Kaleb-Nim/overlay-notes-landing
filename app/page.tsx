// app/page.tsx — Phase 1 walking-skeleton placeholder ONLY.
// Not a real section (nav/hero/who/band/diff/origin/faq/support/footer are
// Phase 2's job). This exists to prove the ruled-paper background, both
// self-hosted typefaces, and a design token all render together.
export default function Home() {
  return (
    <main className="wrap" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <h1
        style={{
          fontFamily: 'var(--font-shantell), cursive',
          color: 'var(--purple)',
          fontWeight: 700,
          fontSize: 32,
        }}
      >
        Overlay Notes
      </h1>
      <p style={{ fontFamily: 'var(--font-public), sans-serif' }}>
        Foundation phase — draw &amp; annotate notes on any webpage.
      </p>
    </main>
  );
}
