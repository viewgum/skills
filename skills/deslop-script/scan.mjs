#!/usr/bin/env node
// Flags the habits that make a short-form script sound machine-written. No dependencies. Usage: node scan.mjs <file|-> [--json]
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const W = (list) => new RegExp(`\\b(?:${list.join("|")})\\b`, "gi");

/** Each rule: an id, a group, whether it counts as a tell or is only worth a look ("check"), a pattern or a test, and why. */
export const RULES = [
  { id: "meta-opener", group: "Opening", kind: "tell", re: W(["in (?:today'?s|this) (?:video|short|clip)", "today (?:we'?re|i'?m) (?:going to|gonna)", "welcome back", "let'?s (?:dive|jump|get) (?:in|into it|right into it)", "let'?s (?:dive|delve) into", "before we (?:start|begin|get started)", "without further ado"]), why: "talks about the video instead of starting it" },
  { id: "stock-opener", group: "Opening", kind: "tell", where: "start", re: W(["have you ever (?:wondered|noticed|thought)", "what if i told you", "in today'?s (?:fast[- ]paced|modern|digital) world", "when it comes to", "picture this", "imagine this", "ever wondered", "hey (?:guys|everyone|everybody|friends)", "hi (?:guys|everyone|everybody)", "what'?s up (?:guys|everyone)"]), why: "a stock way in that viewers have heard a thousand times" },
  { id: "announced-turn", group: "Fake suspense", kind: "tell", re: W(["here'?s the (?:thing|twist|kicker|catch|crazy part|best part)", "here'?s where it gets", "but here'?s", "now get this", "get this", "let that sink in", "buckle up", "plot twist", "spoiler alert", "but wait", "wait for it", "and that'?s when everything changed", "everything changed"]), why: "announces a turn instead of letting it land" },
  { id: "retention-bait", group: "Fake suspense", kind: "tell", re: W(["stick around", "stay (?:until|till|to) the end", "watch (?:until|till|to) the end", "keep watching", "you won'?t believe", "you'?ll never guess", "what happens next will"]), why: "asks for attention the story should earn" },
  { id: "generic-cta", group: "Ending", kind: "tell", re: W(["like and subscribe", "smash (?:that|the) (?:like|follow|subscribe)", "hit (?:that|the) (?:like|follow|subscribe)", "follow for more", "comment below", "let (?:me|us) know in the comments", "tell (?:me|us) in the comments", "drop a comment", "let (?:me|us) know what you think", "don'?t forget to (?:like|follow|subscribe|share)", "share this with"]), why: "a call to action that could end any video" },
  { id: "hype", group: "Hype", kind: "tell", re: W(["insane(?:ly)?", "mind[- ]?blowing", "game[- ]?chang(?:er|ing)", "jaw[- ]?dropping", "unbelievabl[ey]", "incredibl[ey]", "epic", "revolutionary", "ultimate", "life[- ]?changing", "next[- ]?level", "absolutely", "truly", "totally", "literally"]), why: "a word of size standing in for a fact" },
  { id: "told-feeling", group: "Hype", kind: "tell", re: W(["shocking(?:ly)?", "heartbreaking", "chilling", "terrifying", "stunning", "jaw-dropping"]), why: "tells the viewer how to feel instead of showing why" },
  { id: "stock-phrase", group: "Stock phrasing", kind: "tell", re: W(["little did (?:he|she|they|we|i|anyone) know", "the rest is history", "changed everything", "a testament to", "in a world where", "at the end of the day", "the secret to", "level up", "unlock(?:s|ed|ing)?", "unleash(?:es|ed|ing)?", "delv(?:e|es|ed|ing)", "deep dive", "dive (?:into|deep)", "navigat(?:e|es|ing) the", "landscape", "elevate(?:s|d)?", "embark(?:s|ed)?", "tapestry", "realm", "seamless(?:ly)?", "harness(?:es|ed)?", "supercharge(?:s|d)?", "nestled", "boasts?", "intricate", "underscor(?:e|es|ed|ing)", "showcas(?:e|es|ed|ing)", "pivotal", "meticulous(?:ly)?", "commendable", "crucial"]), why: "a phrase that marks text as generated" },
  { id: "page-word", group: "Written, not spoken", kind: "tell", re: W(["moreover", "furthermore", "additionally", "utiliz(?:e|es|ed|ing)", "numerous", "individuals", "in order to", "thus", "hence", "whilst", "amidst", "upon", "it is important to note", "it'?s worth noting", "notably"]), why: "a word for the page that nobody says out loud" },
  { id: "vague-source", group: "Claims", kind: "tell", re: W(["studies (?:show|say|suggest)", "research (?:shows|says|suggests)", "experts (?:say|agree|recommend)", "scientists (?:say|agree)", "according to (?:experts|studies|research)"]), why: "a source nobody can check; name it or cut it" },
  { id: "fake-contrast", group: "Fake contrast", kind: "tell", re: /\b(?:it'?s|this is|that'?s|they'?re|he'?s|she'?s|you'?re|we'?re) not (?:just |only |about |a |an |the )?[^.,;!?]{1,40}[,;:]? (?:it'?s|this is|that'?s|they'?re|he'?s|she'?s|you'?re|we'?re|but)\b|\b(?:isn'?t|is not|aren'?t|are not|wasn'?t|was not) (?:just |only |about )?[^.,;!?]{1,40}[,;:]? (?:it'?s|it is|they'?re|that'?s|it was|but)\b|\bnot because\b[^.!?]{1,60}\bbut because\b/gi, why: "knocks down a view nobody held; say what the thing is" },
  { id: "essay-closer", group: "Ending", kind: "tell", re: W(["in conclusion", "to sum (?:it )?up", "in summary", "all in all"]), why: "an essay's way of ending, not a person's" },
  { id: "hype-colon", group: "Fake suspense", kind: "tell", re: /\b(?:here'?s the (?:truth|secret|kicker)|the (?:secret|truth|catch|answer|trick)|plot twist)\s*:/gi, why: "a colon set up to reveal something; just say it" },
  { id: "leftover", group: "Leftovers", kind: "tell", re: /\*\*|^#{1,6}\s|\[(?:hook|intro|outro|music|cut to|b-roll)[^\]]*\]|\b(?:voiceover|narrator)\s*:|\b(?:sure|certainly|absolutely)[,!] here'?s\b/gim, why: "formatting or chat text left in the script" },
  { id: "semicolon", group: "Punctuation", kind: "check", re: /;/g, why: "a semicolon reads as written; spoken lines use a full stop" },
  { id: "dash", group: "Punctuation", kind: "tell", re: /[\u2014\u2013]| -- /g, why: "a dash used as a dramatic pause; spoken lines need a full stop or a comma" },
  { id: "ellipsis", group: "Punctuation", kind: "tell", re: /\.\.\.|\u2026/g, why: "an ellipsis for suspense" },
  { id: "emoji", group: "Punctuation", kind: "tell", re: /\p{Extended_Pictographic}/gu, why: "an emoji in a line that will be spoken" },
  { id: "intro-question", group: "Opening", kind: "check", where: "start", re: W(["did you know"]), why: "can work, but it is the most common opening there is" },
];

const PET_WORDS = ["actually", "honestly", "basically", "just", "really", "simply", "seriously"];
const ENDINGS = /^(?:and that'?s (?:why|how|what)|so (?:next time|remember|the next time)|the (?:lesson|moral|takeaway)|remember[,:]|what (?:would|do) you|which (?:one|would) you|would you)\b/i;

/** The spoken words of a script: plain text as is; in the HOOK / SAY / CLOSE layout, only the spoken fields. */
export function spokenOf(text) {
  const rows = String(text).replace(/\r/g, "").split("\n");
  if (!rows.some((r) => /^\s*(?:\d+[.)]\s*)?(?:HOOK|SAY|CLOSE)\s*:/i.test(r))) return rows.map((r, i) => ({ line: i + 1, text: r }));
  const out = [];
  rows.forEach((row, i) => {
    const say = /(?:^|\|)\s*(?:\d+[.)]\s*)?(?:HOOK|SAY|CLOSE)\s*:\s*([^|]*)/i.exec(row);
    if (say && !/^\s*HOOK (?:TEXT|VISUAL)\s*:/i.test(row)) out.push({ line: i + 1, text: say[1].trim() });
  });
  return out;
}

const wordsIn = (s) => s.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean);
const sentencesOf = (lines) => {
  const out = [];
  for (const { line, text } of lines) for (const s of text.split(/(?<=[.!?])\s+/)) if (wordsIn(s).length) out.push({ line, text: s.trim() });
  return out;
};

export function scan(text) {
  const lines = spokenOf(text);
  const findings = [];
  const add = (rule, line, match, extra = {}) => findings.push({ line, rule: rule.id ?? rule, group: rule.group ?? extra.group, kind: rule.kind ?? extra.kind ?? "tell", text: match, why: rule.why ?? extra.why });
  const firstLine = lines.find((l) => wordsIn(l.text).length);
  // Opening rules look only at the first sentence.
  const first = firstLine ? { line: firstLine.line, text: firstLine.text.split(/(?<=[.!?])\s+/)[0] } : null;
  for (const rule of RULES) {
    for (const { line, text: t } of rule.where === "start" ? (first ? [first] : []) : lines) {
      for (const m of t.matchAll(new RegExp(rule.re.source, rule.re.flags))) add(rule, line, m[0]);
    }
  }
  const sentences = sentencesOf(lines);
  const sizes = sentences.map((s) => wordsIn(s.text).length);
  // A question of a few words answered at once by a few words: "The result? Chaos."
  for (let i = 0; i + 1 < sentences.length; i++) {
    if (/\?$/.test(sentences[i].text) && sizes[i] <= 5 && sizes[i + 1] <= 4) add({ id: "instant-answer", group: "Fake suspense", kind: "tell", why: "a question answered in the next breath; just say it" }, sentences[i].line, `${sentences[i].text} ${sentences[i + 1].text}`);
  }
  // Three or more very short sentences in a row: "No warning. No plan. Nothing."
  for (let i = 0; i + 2 < sentences.length; i++) {
    if (sizes[i] <= 3 && sizes[i + 1] <= 3 && sizes[i + 2] <= 3 && (i === 0 || sizes[i - 1] > 3)) add({ id: "fragments", group: "Rhythm", kind: "tell", why: "chopped fragments for drama; a person speaks in whole thoughts" }, sentences[i].line, sentences.slice(i, i + 3).map((s) => s.text).join(" "));
  }
  // Every sentence the same size.
  if (sizes.length >= 6) {
    const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const sd = Math.sqrt(sizes.reduce((a, b) => a + (b - mean) ** 2, 0) / sizes.length);
    if (sd < 2) add({ id: "even-beat", group: "Rhythm", kind: "check", why: "every sentence is about the same length; vary it the way speech does" }, sentences[0].line, `${sizes.length} sentences of about ${Math.round(mean)} words`);
  }
  // Lists of exactly three: worth a look, because three is the reflex.
  for (const { line, text: t } of lines) {
    for (const m of t.matchAll(/\b[\p{L}'-]+(?: [\p{L}'-]+)?, [\p{L}'-]+(?: [\p{L}'-]+)?,? and [\p{L}'-]+(?: [\p{L}'-]+)?\b|\b[\p{L}'-]+, [\p{L}'-]+, [\p{L}'-]+ [\p{L}'-]+\b/gu)) add({ id: "three", group: "Rhythm", kind: "check", why: "a list of three; keep it only if the story has three" }, line, m[0]);
  }
  // A pet word on repeat.
  const all = lines.map((l) => l.text).join(" ").toLowerCase();
  for (const w of PET_WORDS) {
    const n = (all.match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length;
    if (n >= 2) add({ id: "pet-word", group: "Stock phrasing", kind: "tell", why: `"${w}" ${n} times; once is natural, twice is a habit` }, lines.find((l) => new RegExp(`\\b${w}\\b`, "i").test(l.text)).line, w);
  }
  // An ending that explains, moralises or asks the audience.
  const last = sentences.at(-1);
  if (last && (ENDINGS.test(last.text) || (/\?$/.test(last.text) && /\byou\b/i.test(last.text)))) add({ id: "explained-ending", group: "Ending", kind: "tell", why: "the last line explains the point or turns to the audience; stop one line earlier" }, last.line, last.text);
  findings.sort((a, b) => a.line - b.line);
  const words = wordsIn(lines.map((l) => l.text).join(" ")).length;
  const tells = findings.filter((f) => f.kind === "tell").length;
  const perHundred = words ? Math.round((tells / words) * 1000) / 10 : 0;
  const grade = tells === 0 ? "A" : perHundred <= 1 ? "B" : perHundred <= 3 ? "C" : "D";
  return { words, tells, checks: findings.length - tells, perHundred, grade, findings };
}

export function report(result) {
  const rows = result.findings.map((f) => `  line ${String(f.line).padStart(3)}  ${f.kind === "tell" ? "tell " : "check"}  ${f.rule.padEnd(16)} "${f.text}": ${f.why}`);
  return [`${result.tells} tells and ${result.checks} to check in ${result.words} spoken words (${result.perHundred} tells per 100 words, grade ${result.grade})`, ...rows].join("\n");
}

const invoked = (() => {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();
if (invoked) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("usage: node scan.mjs <script.txt | -> [--json]");
    process.exit(2);
  }
  let text;
  try {
    text = readFileSync(file === "-" ? 0 : file, "utf8");
  } catch (error) {
    console.error(`cannot read ${file}: ${error.message}`);
    process.exit(2);
  }
  const result = scan(text);
  console.log(args.includes("--json") ? JSON.stringify(result, null, 2) : report(result));
}
