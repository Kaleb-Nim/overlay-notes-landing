---
phase: quick-260725-vdh
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/page.tsx
  - tests/landing.spec.ts
  - TESTING.md
  - .planning/PROJECT.md
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
autonomous: true
requirements: [PAGE-13]

must_haves:
  truths:
    - "The rendered support section's 'Buy me a coffee' CTA href is exactly https://buymeacoffee.com/kalebnim"
    - "The Playwright gate asserts that exact new URL and passes"
    - "No live source, test, or spec file still names the old hyphenated support handle"
    - "The unrelated kaleb-nim GitHub repo link and kaleb-nim.github.io privacy link are untouched"
  artifacts:
    - app/page.tsx
    - tests/landing.spec.ts
    - TESTING.md
    - .planning/PROJECT.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
  key_links:
    - "app/page.tsx SUPPORT_URL constant -> the single <a className=\"btn-coffee\"> at line ~242"
    - "tests/landing.spec.ts SUPPORT constant -> the 'support CTA points at Buy Me a Coffee' assertion"
    - "TESTING.md coverage-map row -> ROADMAP Phase 2 SC#3 -> REQUIREMENTS PAGE-13"
---

<objective>
Correct the support (donation) CTA destination on the landing page from the hyphenated
Buy Me a Coffee handle to the unhyphenated one the user actually owns:
`https://buymeacoffee.com/kalebnim`.

Purpose: The support CTA is the page's only monetization path. Pointing it at a handle the
author does not control sends donors nowhere (or, worse, to a page someone else could claim).

Output: One-line constant change in the page and its Playwright assertion, plus a sync of the
four live spec docs that quote the URL as a locked contract value.

Scope note: there is no separate donation page in this project. The "donation page" is the
`<section className="support" id="support">` block on the single landing route.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

@app/page.tsx
@tests/landing.spec.ts
</context>

<tasks>

<!-- planner-discipline-allow: buymeacoffee.com/kaleb-nim -->

<task type="auto">
  <name>Task 1: Repoint the support CTA constant and its locked test assertion</name>
  <files>app/page.tsx, tests/landing.spec.ts</files>
  <action>
    In `app/page.tsx` line ~25, change the `SUPPORT_URL` constant so the handle segment loses
    its hyphen: the value becomes `https://buymeacoffee.com/kalebnim`. This constant is the
    single source for the one `<a className="btn-coffee">` in the support section (line ~242) —
    do not touch the anchor itself, and do not introduce a second literal.

    In `tests/landing.spec.ts` line ~17, change the `SUPPORT` constant to the same new value.

    CRITICAL — do NOT weaken the assertion. `.claude/CLAUDE.md` forbids loosening the
    locked-URL checks in this spec. The user is changing the locked VALUE, not removing the
    lock: the test at "support CTA points at Buy Me a Coffee" must keep asserting an exact
    `a[href="${SUPPORT}"]` match. Never relax it to a substring, regex, or `toContain`.

    CRITICAL — do NOT do a blanket find-and-replace on the bare handle string. Three other
    values in these files legitimately keep the hyphen and must be left byte-identical:
    the `REPO_URL` / `REPO` GitHub repo link, and the `PRIVACY_URL` / `PRIVACY` github.io
    privacy-policy link. Only the buymeacoffee.com hostname's path segment changes.

    Leave the surrounding header comments in `tests/landing.spec.ts` (the "Locked URLs"
    docblock) intact — it describes the mechanism, not the specific value.
  </action>
  <verify>
    <automated>test "$(grep -c "buymeacoffee\.com/kalebnim" app/page.tsx tests/landing.spec.ts | grep -c ':1$')" = "2" &amp;&amp; test "$(grep -rn "buymeacoffee\.com/kaleb-nim" app tests | wc -l | tr -d ' ')" = "0" &amp;&amp; test "$(grep -rn "github\.com/kaleb-nim/overlay-notes" app tests | wc -l | tr -d ' ')" = "2"</automated>
  </verify>
  <done>
    Both constants hold the unhyphenated URL, neither file mentions the old support handle,
    and the two GitHub repo references are still present and unchanged.
  </done>
</task>

<task type="auto">
  <name>Task 2: Sync the four live spec docs that quote the URL as a contract value</name>
  <files>TESTING.md, .planning/PROJECT.md, .planning/ROADMAP.md, .planning/REQUIREMENTS.md</files>
  <action>
    Update the single occurrence in each of these four files to the new unhyphenated URL,
    using a scoped `Edit` per file — never `Write`, which would destroy surrounding content:

    - `TESTING.md` line ~49 — the coverage-map table row for the support CTA assertion.
      Preserve the row's existing shorthand style (no scheme prefix) and its `| SC#3 |` column.
    - `.planning/PROJECT.md` line ~96 — inside the "Support section, added to the handoff
      2026-07-24" paragraph.
    - `.planning/ROADMAP.md` line ~61 — Phase 2 Success Criterion #3. Change only the
      buymeacoffee URL inside that sentence; the Chrome Web Store URL and the GitHub repo
      clause in the same sentence stay exactly as they are.
    - `.planning/REQUIREMENTS.md` line ~43 — requirement PAGE-13. Keep its `- [x]` checked
      state; the requirement is still satisfied, the contract value just changed.

    Do NOT touch anything under `.planning/phases/01-*/` or `.planning/phases/02-*/`. Those
    CONTEXT.md / UI-SPEC.md / PLAN.md files are immutable records of what was planned and
    executed at the time; rewriting history there would falsify the audit trail.

    Same anti-blanket-replace rule as Task 1: `github.com/kaleb-nim/overlay-notes` and
    `kaleb-nim.github.io` appear throughout these docs and must survive untouched.
  </action>
  <verify>
    <automated>test "$(grep -rn "buymeacoffee\.com/kalebnim" TESTING.md .planning/PROJECT.md .planning/ROADMAP.md .planning/REQUIREMENTS.md | wc -l | tr -d ' ')" = "4" &amp;&amp; test "$(grep -rn "buymeacoffee\.com/kaleb-nim" TESTING.md .planning/PROJECT.md .planning/ROADMAP.md .planning/REQUIREMENTS.md | wc -l | tr -d ' ')" = "0" &amp;&amp; test "$(git status --porcelain .planning/phases | wc -l | tr -d ' ')" = "0"</automated>
  </verify>
  <done>
    Each of the four docs quotes the new URL exactly once, none quotes the old one, and
    `.planning/phases/` has zero working-tree changes.
  </done>
</task>

<task type="auto">
  <name>Task 3: Prove the change end-to-end through the build and the Playwright gate</name>
  <files>(no files modified — verification only)</files>
  <action>
    Run the full gate with Bun, never npm/npx:

    1. `bun run build` — confirms the page still type-checks and prerenders.
    2. `bash scripts/test-gate.sh` — the GSD-wired Playwright gate. Its "support CTA points at
       Buy Me a Coffee" test now asserts the new href against the actually-rendered DOM, which
       is the real proof the constant is wired through to the anchor.

    If `scripts/test-gate.sh` self-skips because Playwright is not installed, install it first
    with `bunx playwright install chromium` and re-run — a skipped gate is not a passing gate
    for this change, since that test is the only thing verifying the rendered href.

    Then run one informational (non-gating) reachability check and report the status code in
    the summary, so the user can confirm the new handle actually resolves rather than 404s:
    `curl -s -o /dev/null -w '%{http_code}\n' -L https://buymeacoffee.com/kalebnim`.
    Do NOT fail the task on this — Buy Me a Coffee may rate-limit or bot-block CI-style
    requests, and a flaky network check must not block a correct code change. Just surface it.
  </action>
  <verify>
    <automated>bun run build &amp;&amp; bash scripts/test-gate.sh</automated>
  </verify>
  <done>
    `bun run build` exits 0, `bash scripts/test-gate.sh` exits 0 with the support-CTA test
    reported as passed (not skipped), and the reachability status code is recorded in the summary.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| landing page → third-party donation host | Visitors leave the site to an external payment destination; a wrong handle sends money-intent traffic to a page the author does not control |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-vdh-01 | Spoofing | support CTA destination (`SUPPORT_URL`) | medium | mitigate | Task 3 records the live HTTP status of the new handle so an unclaimed/404 profile is caught before ship, rather than silently routing donors to a page a squatter could later claim |
| T-vdh-02 | Tampering | blanket find-and-replace across repo | medium | mitigate | Tasks 1 and 2 forbid bare-handle replacement and gate on the GitHub repo / github.io links remaining byte-identical, so the edit cannot collaterally break the repo or privacy-policy links |
| T-vdh-03 | Repudiation | completed phase artifacts under `.planning/phases/` | low | mitigate | Task 2 explicitly excludes historical phase records and gates on a clean `git status` for that directory, preserving the audit trail of what was actually planned and executed |

No package-manager installs are introduced by this change, so no package legitimacy gate applies.
</threat_model>

<verification>
Repo-wide sweep, scoped to exclude the immutable phase history:

```
grep -rn 'buymeacoffee\.com/kaleb-nim' app lib tests TESTING.md .planning/PROJECT.md .planning/ROADMAP.md .planning/REQUIREMENTS.md
```
must return zero lines, and

```
grep -rln 'buymeacoffee\.com/kalebnim' app tests TESTING.md .planning/PROJECT.md .planning/ROADMAP.md .planning/REQUIREMENTS.md
```
must list exactly 6 files.

Regression guard — these must still be present and unchanged:
- `https://github.com/kaleb-nim/overlay-notes` (nav GitHub button + footer)
- `https://kaleb-nim.github.io/overlay-notes/` (the one allowed github.io link, footer)
- `https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck`

`git status --porcelain .planning/phases` is empty.
</verification>

<success_criteria>
- [ ] `SUPPORT_URL` in `app/page.tsx` is `https://buymeacoffee.com/kalebnim`
- [ ] `SUPPORT` in `tests/landing.spec.ts` matches it, still asserted as an exact href
- [ ] TESTING.md, PROJECT.md, ROADMAP.md (SC#3), REQUIREMENTS.md (PAGE-13) all quote the new URL
- [ ] `bun run build` passes
- [ ] `bash scripts/test-gate.sh` passes with the support-CTA test executed, not skipped
- [ ] No file under `.planning/phases/` was modified
- [ ] GitHub repo, github.io privacy, and Chrome Web Store URLs are unchanged
</success_criteria>

<output>
Commit as a single atomic change:

```
fix(quick-260725-vdh): repoint support CTA to buymeacoffee.com/kalebnim
```

Include: `app/page.tsx`, `tests/landing.spec.ts`, `TESTING.md`, `.planning/PROJECT.md`,
`.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`.

Then write `.planning/quick/260725-vdh-update-support-cta-url-to-buymeacoffee-c/260725-vdh-SUMMARY.md`,
recording the reachability status code returned for the new handle.
</output>
