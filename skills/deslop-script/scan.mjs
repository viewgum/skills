#!/usr/bin/env node
// Flags the habits that make a short-form script sound machine-written. No dependencies. Usage: node scan.mjs <file|-> [--json]
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const W = (list) => new RegExp(`\\b(?:${list.join("|")})\\b`, "gi");
// Characters built from code points, so this file holds none of them literally.
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);
const ELLIPSIS = String.fromCharCode(0x2026);
const CURLY = new RegExp(`[${String.fromCharCode(0x2018)}${String.fromCharCode(0x2019)}]`, "g");

/** Each rule: an id, a group, a kind ("tell" counts; "check" is worth a look but often fine), a pattern, and why. */
export const RULES = [
  { id: "meta-opener", group: "Opening", kind: "tell", re: W(["in (?:today'?s|this) (?:video|short|clip)", "today (?:we'?re|i'?m) (?:going to|gonna)", "welcome back", "let'?s (?:dive|jump|get) (?:in|into it|right into it)", "let'?s (?:dive|delve) into", "before we (?:start|begin|get started)", "without further ado"]), why: "talks about the video instead of starting it" },
  { id: "stock-opener", group: "Opening", kind: "tell", where: "start", re: W(["have you ever (?:wondered|noticed|thought)", "what if i told you", "in today'?s (?:fast[- ]paced|modern|digital) world", "when it comes to", "picture this", "imagine this", "ever wondered", "hey (?:guys|everyone|everybody|friends)", "hi (?:guys|everyone|everybody)", "what'?s up (?:guys|everyone)"]), why: "a stock way in that viewers have heard a thousand times" },
  { id: "announced-turn", group: "Fake suspense", kind: "tell", re: W(["here'?s the (?:thing|twist|kicker|catch|crazy part|best part)", "here'?s where it gets", "but here'?s", "now get this", "let that sink in", "buckle up", "plot twist", "spoiler alert", "but wait", "wait for it", "and that'?s when everything changed", "everything changed"]), why: "announces a turn instead of letting it land" },
  { id: "retention-bait", group: "Fake suspense", kind: "tell", re: W(["stick around", "stay (?:until|till|to) the end", "watch (?:until|till|to) the end", "keep watching", "you won'?t believe", "you'?ll never guess", "what happens next will"]), why: "asks for attention the story should earn" },
  { id: "generic-cta", group: "Ending", kind: "tell", re: W(["like and subscribe", "smash (?:that|the) (?:like|follow|subscribe)", "hit (?:that|the) (?:like|follow|subscribe)", "follow for more", "comment below", "let (?:me|us) know in the comments", "tell (?:me|us) in the comments", "drop a comment", "let (?:me|us) know what you think", "don'?t forget to (?:like|follow|subscribe|share)", "share this with"]), why: "a call to action that could end any video" },
  { id: "hype", group: "Hype", kind: "tell", re: W(["insane(?:ly)?", "mind[- ]?blowing", "game[- ]?chang(?:er|ing)", "jaw[- ]?dropping", "unbelievabl[ey]", "incredibl[ey]", "epic", "revolutionary", "life[- ]?changing", "next[- ]?level", "absolutely", "truly", "totally", "literally"]), why: "a word of size standing in for a fact" },
  { id: "told-feeling", group: "Hype", kind: "tell", re: W(["shocking(?:ly)?", "heartbreaking", "chilling", "terrifying", "stunning"]), why: "tells the viewer how to feel instead of showing why" },
  { id: "stock-phrase", group: "Stock phrasing", kind: "tell", re: W(["little did (?:he|she|they|we|i|anyone) know", "the rest is history", "changed everything", "a testament to", "in a world where", "at the end of the day", "delv(?:e|es|ed|ing)", "tapestry", "embark(?:s|ed)? on", "seamless(?:ly)?", "meticulous(?:ly)?", "commendable", "unleash(?:es|ed|ing)? (?:your|the)", "supercharge(?:s|d)?", "elevate(?:s|d)? your"]), why: "a phrase that marks text as generated" },
  { id: "stock-word", group: "Stock phrasing", kind: "check", re: W(["unlock(?:s|ed|ing)? (?:your|the secret|the power|the potential)", "harness(?:es|ed|ing)? the power", "landscape", "realm", "navigat(?:e|es|ing) the", "level up", "the secret to", "deep dive", "dive (?:into|deep)", "intricate", "underscor(?:e|es|ed|ing)", "showcas(?:e|es|ed|ing)", "pivotal", "crucial", "nestled", "boasts?", "journey", "ultimate"]), why: "often generated, sometimes the plain word; keep it if a person would say it here" },
  { id: "page-word", group: "Written, not spoken", kind: "tell", re: W(["moreover", "furthermore", "additionally", "utiliz(?:e|es|ed|ing)", "numerous", "individuals", "in order to", "thus", "hence", "whilst", "amidst", "it is important to note", "it'?s worth noting", "notably"]), why: "a word for the page that nobody says out loud" },
  { id: "vague-source", group: "Claims", kind: "tell", re: W(["studies (?:show|say|suggest)", "research (?:shows|says|suggests)", "experts (?:say|agree|recommend)", "scientists (?:say|agree)", "according to (?:experts|studies|research)"]), why: "a source nobody can check: name it, or flag the claim" },
  { id: "fake-contrast", group: "Fake contrast", kind: "tell", re: /\b(?:it'?s|this is|that'?s|they'?re|he'?s|she'?s|you'?re|we'?re) not (?:just |only |about |a |an |the )?[^.,;!?]{1,40}[,;:]? (?:it'?s|this is|that'?s|they'?re|he'?s|she'?s|you'?re|we'?re|but)\b|\b(?:isn'?t|is not|aren'?t|are not|wasn'?t|was not) (?:just |only |about )?[^.,;!?]{1,40}[,;:]? (?:it'?s|it is|they'?re|that'?s|it was|but)\b|\bnot because\b[^.!?]{1,60}\bbut because\b/gi, why: "knocks down a view nobody held; say what the thing is" },
  { id: "essay-closer", group: "Ending", kind: "tell", re: W(["in conclusion", "to sum (?:it )?up", "in summary", "all in all"]), why: "an essay's way of ending, not a person's" },
  { id: "hype-colon", group: "Fake suspense", kind: "tell", re: /\b(?:here'?s the (?:truth|secret|kicker)|the (?:secret|truth|catch|answer|trick)|plot twist)\s*:/gi, why: "a colon set up to reveal something; just say it" },
  { id: "leftover", group: "Leftovers", kind: "tell", re: /\*\*|^#{1,6}\s|\[(?:hook|intro|outro|music|cut to|b-roll)[^\]]*\]|\b(?:voiceover|narrator)\s*:|\b(?:sure|certainly|absolutely)[,!] here'?s\b/gim, why: "formatting or chat text left in the script" },
  { id: "semicolon", group: "Punctuation", kind: "check", re: /;/g, why: "a semicolon reads as written; spoken lines use a full stop" },
  // A dash between two numbers is a range, not a pause.
  { id: "dash", group: "Punctuation", kind: "tell", re: new RegExp(`${EM}|(?<!\\d\\s?)${EN}|${EN}(?!\\s?\\d)| -- `, "g"), why: "a dash used as a dramatic pause; spoken lines need a full stop or a comma" },
  { id: "ellipsis", group: "Punctuation", kind: "tell", re: new RegExp(`\\.\\.\\.|${ELLIPSIS}`, "g"), why: "an ellipsis for suspense" },
  { id: "emoji", group: "Punctuation", kind: "tell", re: /\p{Extended_Pictographic}/gu, why: "an emoji in a line that will be spoken" },
  { id: "intro-question", group: "Opening", kind: "check", where: "start", re: W(["did you know"]), why: "can work, but it is the most common opening there is" },
];

const PET_WORDS = ["actually", "honestly", "basically", "just", "really", "simply", "seriously"];
const ENDINGS = /^(?:and that'?s (?:why|how|what)|so (?:next time|remember|the next time)|the (?:lesson|moral|takeaway)|remember[,:]|what (?:would|do) you|which (?:one|would) you|would you)\b/i;
const LIST_MARK = /^\s*(?:\d+[.)]|[-*•])\s+/;
const LABEL = /^\s*(?:\d+[.)]\s*)?(HOOK TEXT|HOOK VISUAL|HOOK|SAY|CLOSE|TEXT|VISUAL|LINES|ALT(?:ERNATE)? HOOKS)\s*:/i;

/**
 * The spoken words of a script, as { line, text, list, para }: plain text line by line with list marks removed; in the
 * HOOK / SAY / CLOSE layout, the spoken fields plus any unlabelled narration, never on-screen text, visuals or alternative hooks.
 */
export function spokenOf(text) {
  const rows = String(text).replace(/\r\n?/g, "\n").split("\n");
  const labelled = rows.some((r) => /^\s*(?:\d+[.)]\s*)?(?:HOOK|SAY|CLOSE)\s*:/i.test(r));
  const out = [];
  let para = 0;
  let inAlts = false;
  rows.forEach((row, i) => {
    if (!row.trim()) { para += 1; return; }
    if (labelled) {
      const label = LABEL.exec(row)?.[1]?.toUpperCase();
      if (label?.startsWith("ALT")) { inAlts = true; return; }
      if (label === "HOOK" || label === "CLOSE" || label === "LINES") inAlts = false;
      if (inAlts || label === "HOOK TEXT" || label === "HOOK VISUAL" || label === "LINES" || label === "TEXT" || label === "VISUAL") return;
      const say = /(?:^|\|)\s*(?:\d+[.)]\s*)?(?:HOOK|SAY|CLOSE)\s*:\s*([^|]*)/i.exec(row);
      const spoken = say ? say[1].trim() : row.replace(LIST_MARK, "").trim();
      if (spoken) out.push({ line: i + 1, text: spoken, list: false, para });
      return;
    }
    const list = LIST_MARK.test(row);
    out.push({ line: i + 1, text: row.replace(LIST_MARK, "").trim(), list, para });
  });
  return out;
}

const wordsIn = (s) => s.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean);

/** Sentences across soft line wraps: lines of one paragraph join; each sentence keeps the line it starts on. */
function sentencesOf(lines) {
  const out = [];
  const groups = [];
  for (const l of lines) {
    const last = groups.at(-1);
    if (last && last.para === l.para && !l.list && !last.list) last.items.push(l);
    else groups.push({ para: l.para, list: l.list, items: [l] });
  }
  for (const g of groups) {
    let joined = "";
    const starts = [];
    for (const item of g.items) {
      starts.push({ at: joined.length, line: item.line });
      joined += `${item.text} `;
    }
    for (const m of joined.matchAll(/\S[^]*?(?:[.!?]+(?=\s|$)|$)/gu)) {
      const text = m[0].trim();
      if (!wordsIn(text).length) continue;
      const at = m.index + (m[0].length - m[0].trimStart().length);
      const line = [...starts].reverse().find((s) => s.at <= at)?.line ?? g.items[0].line;
      out.push({ line, text, list: g.list });
    }
  }
  return out;
}

export function scan(text) {
  const lines = spokenOf(text).map((l) => ({ ...l, norm: l.text.replace(CURLY, "'") }));
  const findings = [];
  const add = (rule, line, match) => findings.push({ line, rule: rule.id, group: rule.group, kind: rule.kind, text: match, why: rule.why });
  const firstLine = lines.find((l) => wordsIn(l.text).length);
  const firstSentence = firstLine ? firstLine.norm.split(/(?<=[.!?])\s+/)[0] : "";
  for (const rule of RULES) {
    const targets = rule.where === "start" ? (firstLine ? [{ ...firstLine, norm: firstSentence }] : []) : lines;
    for (const { line, text: original, norm } of targets) {
      // Matched on straight apostrophes, quoted from the creator's own text (same length, so the same span).
      for (const m of norm.matchAll(new RegExp(rule.re.source, rule.re.flags))) add(rule, line, original.slice(m.index, m.index + m[0].length));
    }
  }
  const sentences = sentencesOf(lines.map((l) => ({ ...l, text: l.norm })));
  const sizes = sentences.map((s) => wordsIn(s.text).length);
  for (let i = 0; i + 1 < sentences.length; i++) {
    if (/\?$/.test(sentences[i].text) && sizes[i] <= 5 && sizes[i + 1] <= 4 && !sentences[i].list) add({ id: "instant-answer", group: "Fake suspense", kind: "tell", why: "a question answered in the next breath; just say it" }, sentences[i].line, `${sentences[i].text} ${sentences[i + 1].text}`);
  }
  // Three or more very short sentences in a row, outside lists: "No warning. No plan. Nothing."
  for (let i = 0; i + 2 < sentences.length; i++) {
    const run = [i, i + 1, i + 2];
    if (run.every((k) => sizes[k] <= 3 && !sentences[k].list) && (i === 0 || sizes[i - 1] > 3 || sentences[i - 1].list)) add({ id: "fragments", group: "Rhythm", kind: "tell", why: "chopped fragments for drama; a person speaks in whole thoughts" }, sentences[i].line, run.map((k) => sentences[k].text).join(" "));
  }
  if (sizes.length >= 6) {
    const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const sd = Math.sqrt(sizes.reduce((a, b) => a + (b - mean) ** 2, 0) / sizes.length);
    if (sd < 2) add({ id: "even-beat", group: "Rhythm", kind: "check", why: "every sentence is about the same length; vary it the way speech does" }, sentences[0].line, `${sizes.length} sentences of about ${Math.round(mean)} words`);
  }
  for (const { line, text: t } of lines) {
    for (const m of t.matchAll(/\b[\p{L}'-]+(?: [\p{L}'-]+)?, [\p{L}'-]+(?: [\p{L}'-]+)?,? and [\p{L}'-]+(?: [\p{L}'-]+)?\b|\b[\p{L}'-]+, [\p{L}'-]+, [\p{L}'-]+ [\p{L}'-]+\b/gu)) add({ id: "three", group: "Rhythm", kind: "check", why: "a list of three; keep it only if the story has three" }, line, m[0]);
  }
  const all = lines.map((l) => l.norm).join(" ").toLowerCase();
  for (const w of PET_WORDS) {
    const n = (all.match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length;
    if (n >= 2) add({ id: "pet-word", group: "Stock phrasing", kind: "check", why: `"${w}" ${n} times; cut the repeats that add nothing, keep the ones that carry meaning` }, lines.find((l) => new RegExp(`\\b${w}\\b`, "i").test(l.norm)).line, w);
  }
  const last = sentences.at(-1);
  if (last && (ENDINGS.test(last.text) || (/\?$/.test(last.text) && /\byou\b/i.test(last.text)))) add({ id: "explained-ending", group: "Ending", kind: "tell", why: "the last line explains the point or turns to the audience; stop one line earlier" }, last.line, last.text);
  findings.sort((a, b) => a.line - b.line);
  const words = wordsIn(lines.map((l) => l.text).join(" ")).length;
  const tells = findings.filter((f) => f.kind === "tell").length;
  const perHundred = words ? Math.round((tells / words) * 1000) / 10 : 0;
  const grade = !words ? "none" : tells === 0 ? "A" : perHundred <= 1 ? "B" : perHundred <= 3 ? "C" : "D";
  return { words, seconds: Math.round((words / 165) * 60), tells, checks: findings.length - tells, perHundred, grade, findings };
}

export function report(result) {
  if (!result.words) return "No spoken words found. Give the script as plain text, or in the HOOK / LINES / CLOSE layout.";
  const rows = result.findings.map((f) => `  line ${String(f.line).padStart(3)}  ${f.kind === "tell" ? "tell " : "check"}  ${f.rule.padEnd(16)} "${f.text}": ${f.why}`);
  return [`${result.tells} tells and ${result.checks} to check in ${result.words} spoken words, about ${result.seconds} s at 165 words a minute (${result.perHundred} tells per 100 words, grade ${result.grade})`, ...rows].join("\n");
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
  const literal = args.indexOf("--");
  const opts = literal >= 0 ? args.slice(0, literal) : args;
  const files = [...opts.filter((a) => a === "-" || !a.startsWith("-")), ...(literal >= 0 ? args.slice(literal + 1) : [])];
  const bad = opts.find((a) => a.startsWith("-") && a !== "-" && a !== "--json");
  if (bad || files.length !== 1) {
    console.error(bad ? `unknown option ${bad}` : "usage: node scan.mjs <script.txt | -> [--json]");
    process.exit(2);
  }
  let text;
  try {
    text = readFileSync(files[0] === "-" ? 0 : files[0], "utf8");
  } catch (error) {
    console.error(`cannot read ${files[0]}: ${error.message}`);
    process.exit(2);
  }
  const result = scan(text);
  console.log(opts.includes("--json") ? JSON.stringify(result, null, 2) : report(result));
}
