#!/usr/bin/env node
// Flags the habits that make a short-form script sound machine-written. No dependencies. Usage: node scan.mjs <file|-> [--json]
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const W = (list) => new RegExp(`\\b(?:${list.join("|")})\\b`, "gi");
// Characters built from code points, so this file holds none of them literally.
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);
const ELLIPSIS = String.fromCharCode(0x2026);
const BULLET = String.fromCharCode(0x2022);
const CURLY = new RegExp(`[${String.fromCharCode(0x2018)}${String.fromCharCode(0x2019)}]`, "g");
const PRONOUN = "(?:it'?s|this is|that'?s|they'?re|he'?s|she'?s|you'?re|we'?re|i'?m)";

/**
 * Each rule: an id, a group, a kind ("tell" counts; "check" is worth a look but often fine), a pattern, and why.
 * "start" rules read only the first two sentences. Earlier rules win when two match the same words.
 */
export const RULES = [
  { id: "meta-opener", group: "Opening", kind: "tell", re: W(["in (?:today'?s|this) (?:video|short|clip|reel)", "today (?:we'?re|i'?m) (?:going to|gonna)", "i'?m going to show you", "let'?s (?:dive|jump|get) (?:in|into it|right into it)", "let'?s (?:dive|delve) into", "before we (?:start|begin|get started)", "without further ado"]), why: "talks about the video instead of starting it" },
  { id: "scroll-stopper", group: "Opening", kind: "tell", re: W(["stop scrolling", "you'?(?:ve|re) been doing (?:it|this|that|[\\w ]{1,30}) wrong(?: (?:your|all your) (?:whole |entire )?life)?", "(?:no ?one|nobody) is talking about", "what (?:no ?one|nobody) tells you", "most people (?:don'?t|never) (?:realize|know)", "pov(?=\\s*:)", "will blow your mind", "(?:number|#) ?(?:one|two|three|four|five|\\d) will (?:shock|surprise|blow)"]), why: "a stock scroll-stopper or fake reveal" },
  { id: "stock-opener", group: "Opening", kind: "tell", where: "start", re: W(["have you ever (?:wondered|noticed|thought)", "what if i told you", "in today'?s (?:fast[- ]paced|modern|digital) world", "when it comes to", "picture this", "imagine this", "ever wondered"]), why: "a stock way in that viewers have heard a thousand times" },
  { id: "greeting", group: "Opening", kind: "check", where: "start", re: W(["hey (?:guys|everyone|everybody|friends)", "hi (?:guys|everyone|everybody)", "what'?s up (?:guys|everyone)", "welcome back"]), why: "a greeting; keep it only if the creator opens every video this way" },
  { id: "signposting", group: "Structure", kind: "tell", re: /\b(?:first(?:ly)?, let'?s (?:look|talk|start)|(?:number|step) (?:one|two|three|1|2|3)\s*:|let'?s break (?:it|this) down)/gi, why: "a slide deck's structure read aloud" },
  { id: "announced-turn", group: "Fake suspense", kind: "tell", re: W(["here'?s the (?:thing|twist|kicker|catch|crazy part|best part)", "here'?s where it gets", "but here'?s", "now get this", "let that sink in", "buckle up", "plot twist", "spoiler alert", "but wait", "wait for it", "and that'?s when everything changed", "everything changed"]), why: "announces a turn instead of letting it land" },
  { id: "retention-bait", group: "Fake suspense", kind: "tell", re: W(["stick around", "stay (?:until|till|to) the end", "watch (?:until|till|to) the end", "keep watching", "you won'?t believe", "you'?ll never guess", "what happens next will"]), why: "asks for attention the story should earn" },
  { id: "generic-cta", group: "Ending", kind: "tell", re: W(["like and subscribe", "smash (?:that|the) (?:like|follow|subscribe)", "hit (?:that|the) (?:like|follow|subscribe)", "follow for more", "comment below", "comment \"?[a-z]+\"? (?:below|and)", "let (?:me|us) know in the comments", "tell (?:me|us) in the comments", "drop a comment", "let (?:me|us) know what you think", "don'?t forget to (?:like|follow|subscribe|share)", "share this with", "tag (?:a|your) (?:friend|buddy|bestie)", "save this (?:for later|before|so)", "link in (?:my )?bio"]), why: "a call to action or engagement bait that could end any video" },
  { id: "visual-narration", group: "Written, not spoken", kind: "check", re: W(["as you can see(?: here)?", "look at this", "on (?:the )?screen (?:now|right now)"]), why: "describes what the picture already shows" },
  { id: "hype", group: "Hype", kind: "tell", re: W(["insane(?:ly)?", "mind[- ]?blowing", "game[- ]?chang(?:er|ing)", "jaw[- ]?dropping", "unbelievabl[ey]", "incredibl[ey]", "epic", "revolutionary", "life[- ]?changing", "next[- ]?level"]), why: "a word of size standing in for a fact" },
  { id: "intensifier", group: "Hype", kind: "check", re: W(["absolutely", "truly", "totally", "literally"]), why: "fine in speech once; stacked, it stands in for a fact" },
  { id: "told-feeling", group: "Hype", kind: "tell", re: W(["shocking(?:ly)?", "heartbreaking", "spine[- ]chilling", "terrifying"]), why: "tells the viewer how to feel instead of showing why" },
  { id: "stock-phrase", group: "Stock phrasing", kind: "tell", re: W(["little did (?:he|she|they|we|i|anyone) know", "the rest is history", "changed everything", "a testament to", "in a world where", "at the end of the day", "delv(?:e|es|ed|ing)", "tapestry", "embark(?:s|ed|ing)? on", "seamless(?:ly)?", "meticulous(?:ly)?", "commendable", "unleash(?:es|ed|ing)? (?:your|the)", "supercharg(?:e|es|ed|ing)", "elevat(?:e|es|ed|ing) (?:your|the)"]), why: "a phrase that marks text as generated" },
  { id: "stock-word", group: "Stock phrasing", kind: "check", re: W(["unlock(?:s|ed|ing)? (?:your|the secret|the power|the potential)", "harness(?:es|ed|ing)? the power", "landscape", "realm", "navigat(?:e|es|ing) the", "level up", "the secret to", "deep dive", "dive (?:into|deep)", "intricate", "underscor(?:e|es|ed|ing)", "showcas(?:e|es|ed|ing)", "pivotal", "crucial", "nestled", "boasts?", "journey", "ultimate"]), why: "often generated, sometimes the plain word; keep it if a person would say it here" },
  { id: "page-word", group: "Written, not spoken", kind: "tell", re: W(["moreover", "furthermore", "additionally", "utiliz(?:e|es|ed|ing)", "numerous", "individuals", "in order to", "thus", "hence", "whilst", "amidst", "it is important to note", "it'?s worth noting", "notably", "e\\.g", "i\\.e", "etc", "and/or"]), why: "written for the page; nobody says it out loud" },
  { id: "vague-source", group: "Claims", kind: "tell", re: W(["studies (?:show|say|suggest)", "research (?:shows|says|suggests)", "experts (?:say|agree|recommend)", "scientists (?:say|agree)", "according to (?:experts|studies|research)"]), why: "a source nobody can check: name it, or flag the claim" },
  { id: "fake-contrast", group: "Fake contrast", kind: "tell", re: new RegExp(`\\b(?:${PRONOUN} not|isn'?t|aren'?t|wasn'?t) (?:just|only|merely) [^.,;!?]{1,40}[.,;:!]? ${PRONOUN}\\b|\\bnot about [^.,;!?]{1,40}[.,;:]? ${PRONOUN} about\\b|\\bnot because\\b[^.!?]{1,60}\\bbut because\\b|\\b(you'?re|we'?re|they'?re|it'?s|this is) not [^.,;!?]{1,25}\\. \\1 (?:just )?[^.!?]{1,40}`, "gi"), why: "knocks down a view nobody held; say what the thing is" },
  { id: "contrast", group: "Fake contrast", kind: "check", re: new RegExp(`\\b${PRONOUN} not [^.,;!?]{1,30}, ${PRONOUN}\\b`, "gi"), why: "a not-this-but-that; keep it if someone really thought the first half" },
  { id: "essay-closer", group: "Ending", kind: "tell", re: W(["in conclusion", "to sum (?:it )?up", "in summary", "all in all", "ultimately,"]), why: "an essay's way of ending, not a person's" },
  { id: "hype-colon", group: "Fake suspense", kind: "tell", re: /\b(?:here'?s the (?:truth|secret)|the (?:secret|truth|catch|answer|trick))\s*:/gi, why: "a colon set up to reveal something; just say it" },
  { id: "leftover", group: "Leftovers", kind: "tell", re: /\*\*|^#{1,6}\s|\[(?:hook|intro|outro|music|cut to|b-roll|scene)[^\]]*\]|\b(?:voiceover|narrator)\s*:|\b(?:sure|certainly)[,!] here'?s\b/gim, why: "formatting or chat text left in the script" },
  { id: "aside", group: "Written, not spoken", kind: "check", re: /\([^)]{3,}\)/g, why: "a bracketed aside; the voice cannot say brackets" },
  { id: "semicolon", group: "Punctuation", kind: "check", re: /;/g, why: "a semicolon reads as written; spoken lines use a full stop" },
  // A dash between two numbers is a range, not a pause.
  { id: "dash", group: "Punctuation", kind: "tell", re: new RegExp(`${EM}|(?<!\\d\\s?)${EN}|${EN}(?!\\s?\\d)|--|(?<!\\d) - (?!\\d)`, "g"), why: "a dash used as a dramatic pause; spoken lines need a full stop or a comma" },
  { id: "ellipsis", group: "Punctuation", kind: "tell", re: new RegExp(`\\.\\.\\.|${ELLIPSIS}`, "g"), why: "an ellipsis for suspense" },
  { id: "emoji", group: "Punctuation", kind: "tell", re: /\p{Extended_Pictographic}/gu, why: "an emoji in a line that will be spoken" },
  { id: "intro-question", group: "Opening", kind: "check", where: "start", re: W(["did you know"]), why: "can work, but it is the most common opening there is" },
];

const PET_WORDS = ["actually", "honestly", "basically", "just", "really", "simply", "seriously"];
const ENDINGS = /^(?:and that'?s (?:why|how|what)|so (?:next time|remember|the next time)|the (?:lesson|moral|takeaway)|remember[,:]|ultimately\b)/i;
const AUDIENCE_Q = /\b(?:what do you think|what would you do|which (?:one )?would you|would you rather|are you (?:team|with me))\b/i;
const STOCK_Q = /^(?:the (?:result|catch|truth|twist|secret|answer|plan|problem|crazy part|best part|kicker)|why|how|guess what|the reason)\?$/i;
const LIST_MARK = new RegExp(`^\\s*(?:\\d+[.)]|[-*${BULLET}])\\s+`);
const LABEL = /^\s*(?:\d+[.)]\s*)?(HOOK TEXT|HOOK VISUAL|HOOK|SAY|CLOSE|TEXT|VISUAL|LINES|ALT(?:ERNATE)? HOOKS)\s*:/i;
const SAY = /(?:^|\|)\s*(?:\d+[.)]\s*)?(?:HOOK|SAY|CLOSE)\s*:\s*([^|]*)/i;
// Abbreviations whose full stop does not end a sentence.
const ABBREV = /\b(?:dr|mr|mrs|ms|st|ave|vs|etc|no|oz|lb|ft|approx|a\.m|p\.m|u\.s|u\.k|e\.g|i\.e)\.$/i;

/**
 * The spoken words of a script, as { line, text, list, para }: plain text line by line with list marks removed; in the
 * HOOK / SAY / CLOSE layout, the spoken fields plus any unlabelled narration, never on-screen text, visuals or alternative hooks.
 */
export function spokenOf(text) {
  const rows = String(text).replace(/\r\n?/g, "\n").split("\n");
  const labelled = rows.some((r) => /(?:^|\|)\s*(?:\d+[.)]\s*)?(?:HOOK|SAY|CLOSE)\s*:/i.test(r));
  const out = [];
  let para = 0;
  let inAlts = false;
  rows.forEach((row, i) => {
    if (!row.trim()) { para += 1; return; }
    if (labelled) {
      const label = LABEL.exec(row)?.[1]?.toUpperCase();
      const say = SAY.exec(row);
      if (label?.startsWith("ALT")) { inAlts = true; return; }
      if (say || label === "LINES") inAlts = false;
      if (say) {
        if (say[1].trim()) out.push({ line: i + 1, text: say[1].trim(), list: false, para });
        return;
      }
      if (inAlts || label) return;
      const spoken = row.replace(LIST_MARK, "").trim();
      if (spoken) out.push({ line: i + 1, text: spoken, list: false, para });
      return;
    }
    const list = LIST_MARK.test(row);
    out.push({ line: i + 1, text: row.replace(LIST_MARK, "").trim(), list, para });
  });
  return out;
}

const wordsIn = (s) => s.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean);

/** Splits text into sentences at . ! ? followed by a space, except after a known abbreviation; returns [{ text, at }]. */
function splitSentences(joined) {
  const out = [];
  let start = 0;
  for (const m of joined.matchAll(/[.!?]+(?=\s|$)/g)) {
    const end = m.index + m[0].length;
    if (ABBREV.test(joined.slice(start, end))) continue;
    out.push({ text: joined.slice(start, end), at: start });
    start = end;
  }
  if (joined.slice(start).trim()) out.push({ text: joined.slice(start), at: start });
  return out.map((s) => ({ text: s.text.trim(), at: s.at + (s.text.length - s.text.trimStart().length) })).filter((s) => wordsIn(s.text).length);
}

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
    for (const s of splitSentences(joined)) {
      const line = [...starts].reverse().find((x) => x.at <= s.at)?.line ?? g.items[0].line;
      out.push({ line, text: s.text, list: g.list });
    }
  }
  return out;
}

export function scan(text) {
  const lines = spokenOf(text).map((l) => ({ ...l, norm: l.text.replace(CURLY, "'") }));
  const raw = [];
  const add = (rule, line, match, at = -1, order = RULES.length) => raw.push({ line, at, end: at < 0 ? -1 : at + match.length, order, rule: rule.id, group: rule.group, kind: rule.kind, text: match, why: rule.why });
  const sentences = sentencesOf(lines.map((l) => ({ ...l, text: l.norm })));
  const opening = sentences.slice(0, 2);
  RULES.forEach((rule, order) => {
    const targets = rule.where === "start" ? opening.map((s) => ({ line: s.line, original: s.text, norm: s.text, start: true })) : lines.map((l) => ({ line: l.line, original: l.text, norm: l.norm }));
    for (const { line, original, norm, start } of targets) {
      // Matched on straight apostrophes, quoted from the creator's own text (same length, so the same span).
      for (const m of norm.matchAll(new RegExp(rule.re.source, rule.re.flags))) add(rule, line, original.slice(m.index, m.index + m[0].length), start ? -1 : m.index, order);
    }
  });
  const sizes = sentences.map((s) => wordsIn(s.text).length);
  for (let i = 0; i + 1 < sentences.length; i++) {
    if (!/\?$/.test(sentences[i].text) || sentences[i].list) continue;
    if (STOCK_Q.test(sentences[i].text) && sizes[i + 1] <= 12) add({ id: "instant-answer", group: "Fake suspense", kind: "tell", why: "a stock question answered in the next breath; just say it" }, sentences[i].line, `${sentences[i].text} ${sentences[i + 1].text}`);
    else if (sizes[i] <= 5 && sizes[i + 1] <= 4) add({ id: "short-answer", group: "Fake suspense", kind: "check", why: "a short question answered at once; fine in a how-to, a habit in a story" }, sentences[i].line, `${sentences[i].text} ${sentences[i + 1].text}`);
  }
  // Runs of very short sentences outside lists: "No warning. No plan. Nothing." Two-word runs are the habit; three-word steps may be a recipe.
  for (let i = 0; i + 2 < sentences.length; i++) {
    const run = [i, i + 1, i + 2];
    if (!run.every((k) => sizes[k] <= 3 && !sentences[k].list) || (i > 0 && sizes[i - 1] <= 3 && !sentences[i - 1].list)) continue;
    const tell = run.every((k) => sizes[k] <= 2) || run.some((k) => /^(?:no|zero|nothing|none)\b/i.test(sentences[k].text));
    add({ id: "fragments", group: "Rhythm", kind: tell ? "tell" : "check", why: tell ? "chopped fragments for drama; a person speaks in whole thoughts" : "three short sentences; fine as steps, a habit as drama" }, sentences[i].line, run.map((k) => sentences[k].text).join(" "));
  }
  if (sizes.length >= 6) {
    const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const sd = Math.sqrt(sizes.reduce((a, b) => a + (b - mean) ** 2, 0) / sizes.length);
    if (sd < 2) add({ id: "even-beat", group: "Rhythm", kind: "check", why: "every sentence is about the same length; vary it the way speech does" }, sentences[0].line, `${sizes.length} sentences of about ${Math.round(mean)} words`);
  }
  for (const { line, text: t } of lines) {
    for (const m of t.matchAll(/(?<![\p{L}'-])[\p{L}'-]+, [\p{L}'-]+,? and [\p{L}'-]+(?![\p{L}'-])|(?<![\p{L}'-])[\p{L}'-]+, [\p{L}'-]+, [\p{L}'-]+(?= [\p{L}'-])/gu)) {
      if (/\band then\b/i.test(m[0])) continue;
      add({ id: "three", group: "Rhythm", kind: "check", why: "a list of three; keep it only if the story has three" }, line, m[0]);
    }
  }
  const all = lines.map((l) => l.norm).join(" ").toLowerCase();
  for (const w of PET_WORDS) {
    const n = (all.match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length;
    if (n >= 2) add({ id: "pet-word", group: "Stock phrasing", kind: "check", why: `"${w}" ${n} times; cut the repeats that add nothing, keep the ones that carry meaning` }, lines.find((l) => new RegExp(`\\b${w}\\b`, "i").test(l.norm)).line, w);
  }
  // The ending: the last two sentences, since a call to action often follows the moral.
  for (const s of sentences.slice(-2)) {
    if (ENDINGS.test(s.text)) add({ id: "explained-ending", group: "Ending", kind: "tell", why: "the ending explains the point; stop one line earlier" }, s.line, s.text);
    else if (AUDIENCE_Q.test(s.text)) add({ id: "audience-question", group: "Ending", kind: "tell", why: "a generic question to the audience; ask something specific to this video, or nothing" }, s.line, s.text);
  }
  // One habit per phrase: when one rule's words sit inside another's on the same line, the earlier rule keeps them.
  // Punctuation is its own habit and is never folded into a phrase.
  raw.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "tell" ? -1 : 1) || a.line - b.line || a.at - b.at || a.order - b.order);
  const findings = [];
  for (const f of raw) {
    const words = (g) => g.line === f.line && g.at >= 0 && g.group !== "Punctuation";
    const inside = (g) => (g.at <= f.at && f.end <= g.end) || (f.at <= g.at && g.end <= f.end);
    const overlaps = (g) => g.at < f.end && f.at < g.end;
    const clash = f.at >= 0 && f.group !== "Punctuation" && findings.some((g) => words(g) && (inside(g) || (f.kind === "check" && g.kind === "tell" && overlaps(g))));
    if (!clash) findings.push(f);
  }
  findings.sort((a, b) => a.line - b.line || (a.at < 0 ? -1 : b.at < 0 ? 1 : a.at - b.at) || a.order - b.order);
  const clean = findings.map(({ at, end, order, ...rest }) => rest);
  const words = wordsIn(lines.map((l) => l.text).join(" ")).length;
  const tells = clean.filter((f) => f.kind === "tell").length;
  const perHundred = words ? Math.round((tells / words) * 1000) / 10 : 0;
  const grade = !words ? "none" : tells === 0 ? "A" : perHundred <= 1 ? "B" : perHundred <= 3 ? "C" : "D";
  return { words, seconds: Math.round((words / 165) * 60), tells, checks: clean.length - tells, perHundred, grade, findings: clean };
}

export function report(result) {
  if (!result.words) return "No spoken words found. Give the script as plain text, or in the HOOK / LINES / CLOSE layout.";
  const rows = result.findings.map((f) => `  line ${String(f.line).padStart(3)}  ${f.kind === "tell" ? "tell " : "check"}  ${f.rule.padEnd(17)} "${f.text}": ${f.why}`);
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
