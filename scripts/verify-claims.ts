#!/usr/bin/env bun
// scripts/verify-claims.ts
//
// Standalone Bun script (no external deps, no node_modules required) — run via
// `bun scripts/verify-claims.ts`. Kept OUT of scripts/test-gate.sh's Playwright gate
// per plan 01-02: this is a build-time content/claim-integrity check, not an E2E test.
//
// Verifies:
//   1. Zero unexpected banned-term matches (whole-word, case-insensitive) across
//      lib/content.ts's faqs[] + originStory.text, aside from two documented
//      whitelisted phrases (CONT-02).
//   2. The privacy FAQ answer contains the CONT-03 statement verbatim.
//   3. siteConfig.baseUrl is the exact domain, no trailing slash (FOUND-02).
//   4. faqs.length === 6 (CONT-06).
//   5. 01-CLAIM-TRACEABILITY.md contains the CONT-04 phrase and the CONT-08 claims.
//
// Exits 0 on PASS. Exits non-zero with a clear, itemized message on any failure.

import { faqs, originStory } from '../lib/content';
import { siteConfig } from '../lib/site-config';

const failures: string[] = [];

function fail(message: string): void {
  failures.push(message);
}

// ---------------------------------------------------------------------------
// (1) Whole-word banned-term scan, with documented whitelist exceptions
// ---------------------------------------------------------------------------

const BANNED_TERMS = [
  'PDF',
  'Firefox',
  'Safari',
  'sync',
  'accounts',
  'export',
  'cross-note search',
  'dashboards',
  'collaboration',
  'sharing',
];

// The two locked phrases that would otherwise false-positive against BANNED_TERMS.
// See 01-CLAIM-TRACEABILITY.md "Documented Whitelist Exceptions" for the rationale.
const WHITELISTED_PHRASES = [
  'no accounts, no ads, nothing tracked', // CONT-08 negation — contains "accounts"
  'nothing is collected, transmitted, sold, or shared', // CONT-03 privacy statement
];

interface TextEntry {
  label: string;
  text: string;
}

const textEntries: TextEntry[] = [
  ...faqs.flatMap((faq, i) => [
    { label: `faqs[${i}].question`, text: faq.question },
    { label: `faqs[${i}].answer`, text: faq.answer },
  ]),
  { label: 'originStory.text', text: originStory.text },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findWhitelistedSpans(text: string): Array<[number, number]> {
  const lower = text.toLowerCase();
  const spans: Array<[number, number]> = [];
  for (const phrase of WHITELISTED_PHRASES) {
    const phraseLower = phrase.toLowerCase();
    let idx = lower.indexOf(phraseLower);
    while (idx !== -1) {
      spans.push([idx, idx + phraseLower.length]);
      idx = lower.indexOf(phraseLower, idx + 1);
    }
  }
  return spans;
}

function overlapsAnySpan(start: number, end: number, spans: Array<[number, number]>): boolean {
  return spans.some(([spanStart, spanEnd]) => start < spanEnd && end > spanStart);
}

const skippedExceptions = new Set<string>();

for (const { label, text } of textEntries) {
  const whitelistedSpans = findWhitelistedSpans(text);

  for (const term of BANNED_TERMS) {
    // Whole-word / whole-phrase boundary matching — not substring/String.includes —
    // so "shared" never matches "sharing" and multi-word terms like "cross-note
    // search" match only the exact phrase, not a partial stem.
    const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (overlapsAnySpan(start, end, whitelistedSpans)) {
        skippedExceptions.add(`"${match[0]}" in ${label} (inside a documented whitelisted phrase)`);
        continue;
      }
      fail(
        `Banned term "${term}" found as "${match[0]}" in ${label}: "${text}" — not inside a whitelisted phrase.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// (2) Privacy FAQ answer must contain the CONT-03 statement verbatim
// ---------------------------------------------------------------------------

const PRIVACY_STATEMENT = 'nothing is collected, transmitted, sold, or shared';
const privacyFaq = faqs.find((f) => f.answer.toLowerCase().includes(PRIVACY_STATEMENT));
if (!privacyFaq) {
  fail(`No FAQ answer contains the verbatim CONT-03 privacy statement: "${PRIVACY_STATEMENT}"`);
}

// ---------------------------------------------------------------------------
// (3) siteConfig.baseUrl exact value, no trailing slash
// ---------------------------------------------------------------------------

const EXPECTED_BASE_URL = 'https://overlay-notes.kalebnim.dev';
if (siteConfig.baseUrl !== EXPECTED_BASE_URL) {
  fail(`siteConfig.baseUrl is "${siteConfig.baseUrl}", expected exactly "${EXPECTED_BASE_URL}" (no trailing slash).`);
}
if (siteConfig.baseUrl.endsWith('/')) {
  fail(`siteConfig.baseUrl must not have a trailing slash: "${siteConfig.baseUrl}"`);
}

// ---------------------------------------------------------------------------
// (4) Exactly 6 FAQ pairs
// ---------------------------------------------------------------------------

if (faqs.length !== 6) {
  fail(`faqs.length is ${faqs.length}, expected exactly 6.`);
}

// ---------------------------------------------------------------------------
// (5) 01-CLAIM-TRACEABILITY.md contains the CONT-04 phrase and CONT-08 claims
// ---------------------------------------------------------------------------

const traceabilityUrl = new URL(
  '../.planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md',
  import.meta.url
);
const traceabilityFile = Bun.file(traceabilityUrl);
const traceabilityExists = await traceabilityFile.exists();

if (!traceabilityExists) {
  fail(`01-CLAIM-TRACEABILITY.md not found at ${traceabilityUrl.pathname}`);
} else {
  const traceabilityText = await traceabilityFile.text();

  // CONT-04 must appear exactly lowercase, matching how it must render on the page.
  if (!traceabilityText.includes('excalidraw chrome extension')) {
    fail('01-CLAIM-TRACEABILITY.md must contain the exact lowercase phrase "excalidraw chrome extension"');
  }

  const requiredCaseInsensitiveStrings = [
    'free and always will be',
    'no accounts, no ads, nothing tracked',
    'solo developer',
  ];
  for (const required of requiredCaseInsensitiveStrings) {
    if (!traceabilityText.toLowerCase().includes(required.toLowerCase())) {
      fail(`01-CLAIM-TRACEABILITY.md is missing required CONT-08 text: "${required}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error('FAIL: scripts/verify-claims.ts found the following problem(s):\n');
  for (const f of failures) {
    console.error(`  - ${f}`);
  }
  console.error(
    `\n${failures.length} failure(s). See .planning/phases/01-foundation-verified-copy/01-CLAIM-TRACEABILITY.md for claim provenance.`
  );
  process.exit(1);
}

console.log('PASS: scripts/verify-claims.ts');
console.log(`  - Banned-term scan: 0 unexpected matches across ${textEntries.length} copy entries.`);
console.log('  - Whitelisted exceptions intentionally skipped:');
if (skippedExceptions.size === 0) {
  console.log('      (none matched in this run — the two whitelisted phrases are not present in lib/content.ts today)');
} else {
  for (const exception of skippedExceptions) {
    console.log(`      - ${exception}`);
  }
}
console.log('  - Privacy FAQ answer contains the CONT-03 statement verbatim.');
console.log(`  - siteConfig.baseUrl === "${siteConfig.baseUrl}" (no trailing slash).`);
console.log('  - faqs.length === 6.');
console.log('  - 01-CLAIM-TRACEABILITY.md contains the CONT-04 phrase and CONT-08 claims.');
process.exit(0);
