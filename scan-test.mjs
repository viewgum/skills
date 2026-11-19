// Tests for skills/deslop-script/scan.mjs: node scan-test.mjs, from any folder. No dependencies.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { report, scan, spokenOf } from "./skills/deslop-script/scan.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SCAN = here("./skills/deslop-script/scan.mjs");
const DASH = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
const tellsOf = (text) => scan(text).findings.filter((f) => f.kind === "tell").map((f) => f.rule);
const checksOf = (text) => scan(text).findings.filter((f) => f.kind === "check").map((f) => f.rule);
const has = (text, rule) => assert.ok(tellsOf(text).includes(rule), `${rule} in: ${text}\n got ${tellsOf(text).join(", ")}`);
const lacks = (text, rule) => assert.ok(!tellsOf(text).includes(rule), `no ${rule} in: ${text}`);
const checks = (text, rule) => assert.ok(checksOf(text).includes(rule), `check ${rule} in: ${text}\n got ${checksOf(text).join(", ")}`);

// Openings and set-ups.
has("In today's video we look at salt.", "meta-opener");
has("In this reel I'm going to show you three knots.", "meta-opener");
has("Stop scrolling. Your knees hurt for a reason.", "scroll-stopper");
has("You've been doing mornings wrong your whole life.", "scroll-stopper");
has("Nobody is talking about this tax rule.", "scroll-stopper");
has("POV: you just found the cheapest flight.", "scroll-stopper");
has("Have you ever wondered why bread goes stale?", "stock-opener");
has("In today's fast-paced world, saving is hard.", "stock-opener");
checks("Hey guys, salt is weird.", "greeting");
lacks("Hey guys, salt is weird.", "greeting");
assert.ok(!checksOf("Salt is weird. It costs a dollar. Hey guys, look at this.").includes("greeting"), "greetings only count at the start");
has("First, let's look at the problem.", "signposting");
has("Here's the thing: salt is cheap.", "announced-turn");
has("Here's the truth: nobody budgets.", "hype-colon");
// Contrasts: the rhetorical ones are tells, a plain correction is a check.
has("Cold brew isn't just coffee, it's a ritual.", "fake-contrast");
has("It's not about willpower, it's about order.", "fake-contrast");
has("You're not lazy. You're just unoptimized.", "fake-contrast");
has("This isn't just another chatbot. It's your unfair advantage.", "fake-contrast");
checks("It's not broken, it's the flapper.", "contrast");
lacks("It's not broken, it's the flapper.", "fake-contrast");
lacks("He wasn't home, but his dog was.", "fake-contrast");
// Questions and fragments.
has("The result? A smoother cup that nobody can stop drinking.", "instant-answer");
checks("Still leaking? Tighten the nut.", "short-answer");
lacks("Still leaking? Tighten the nut.", "instant-answer");
has("We drove home. No warning. No plan. Nothing.", "fragments");
lacks("Chop the onion. Heat the oil. Add the garlic.", "fragments");
lacks("Meet Dr. Kim at 6 a.m. on St. Clair Ave. today.", "fragments");
// Words.
has("This trick is mind-blowing.", "hype");
checks("I literally stood on her porch.", "intensifier");
lacks("I literally stood on her porch.", "hype");
lacks("After chilling the dough for an hour, roll it out.", "told-feeling");
has("It was a spine-chilling night.", "told-feeling");
has("Studies show it works.", "vague-source");
has("Moreover, it is cheap.", "page-word");
has("Bring snacks, e.g. nuts.", "page-word");
has("Little did they know the bridge was closed.", "stock-phrase");
has("Let us delve into the tapestry of bread.", "stock-phrase");
has("We are embarking on a new plan.", "stock-phrase");
checks("This pivotal step underscores everything.", "stock-word");
lacks("Turn the key to unlock the door, then take the dog's harness off.", "stock-phrase");
assert.equal(scan("Turn the key to unlock the door, then take the dog's harness off.").tells, 0);
// Punctuation.
has(`It took eighteen hours ${String.fromCharCode(0x2014)} in cold water.`, "dash");
has("Cold brew--it's an experience.", "dash");
has("Cold brew - it's an experience.", "dash");
lacks(`Wait 10${String.fromCharCode(0x2013)}15 minutes before slicing.`, "dash");
has("And then... nothing.", "ellipsis");
has(`Save first ${String.fromCodePoint(0x1f4b8)}`, "emoji");
// Endings.
has("We saved two hundred dollars. And that's why you should always budget. Like and subscribe.", "explained-ending");
has("We saved two hundred dollars. Ultimately, small habits shape our future.", "explained-ending");
has("We saved two hundred dollars. What would you do?", "audience-question");
lacks("Have you tried the spot behind the tire shop on Fifth?", "audience-question");
has("Like and subscribe for more.", "generic-cta");
has("Let us know in the comments.", "generic-cta");
has("Comment BREAD below and I'll send the recipe.", "generic-cta");
has("Save this before your next trip.", "generic-cta");
has("Link in bio.", "generic-cta");
has("**Hook:** Save first.", "leftover");
has("Sure, here's your script. Save first.", "leftover");
// Pet words and one finding per phrase.
checks("I actually like it. It actually works.", "pet-word");
assert.equal(tellsOf("Let's dive into this topic.").length, 1, "one habit for one phrase");
// Apostrophes, layouts, wraps, lists.
const curly = "In today’s video, here’s the thing: it’s not about diets, it’s about sleep.";
for (const rule of ["meta-opener", "announced-turn", "fake-contrast"]) has(curly, rule);
assert.ok(scan(curly).findings.some((f) => f.text.includes("’")), "quotes keep the creator's own apostrophes");
has("HOOK: I tried it.\nIt was mind-blowing.\nCLOSE: I went home.", "hype");
assert.equal(scan("HOOK: I tried it.\nIt was mind-blowing.\nCLOSE: I went home.").words, 9);
assert.deepEqual(spokenOf("HOOK: Hi.\n1. TEXT: Big title | SAY: Mind-blowing claim.").map((l) => l.text), ["Hi.", "Mind-blowing claim."]);
assert.deepEqual(spokenOf("HOOK: Hi.\nALT HOOKS:\n- Another hook\nSAY: Body line.").map((l) => l.text), ["Hi.", "Body line."]);
const layout = "HOOK: Your savings start last.\nHOOK TEXT: Here's the thing\nHOOK VISUAL: A mind-blowing chart\nLINES:\n1. SAY: Flip the order. | TEXT: Studies show | VISUAL: none\nCLOSE: Save first.";
assert.deepEqual(spokenOf(layout).map((l) => l.text), ["Your savings start last.", "Flip the order.", "Save first."]);
assert.equal(scan(layout).tells, 0);
assert.equal(scan("We drove all night to get there and the place was\nclosed when we arrived at six in the morning.").tells, 0, "a soft wrap is not a sentence break");
lacks("1. Bring water.\n2. Pack food.\n3. Check tires.", "fragments");
assert.equal(scan("").grade, "none");
assert.equal(scan("HOOK:\nLINES:\n1. SAY: | TEXT: x\nCLOSE:").grade, "none");
assert.match(report(scan("")), /No spoken words/);
assert.equal(scan("It cost $12.50 at the time and still does today.").tells, 0);
assert.equal(scan(Array.from({ length: 2000 }, () => "We drove home and slept well that night.").join("\r\n")).tells, 0);

// A small corpus: ordinary scripts a person wrote should come out clean; sloppy ones should not.
const human = [
  "My toilet ran all night. I lifted the tank lid and the flapper was warped, so it never sealed. A new one cost four dollars and took ten minutes. Turn the water off at the wall first, flush to empty the tank, unhook the old flapper and clip the new one on. It's not broken, it's just worn out.",
  "I got locked out last Tuesday. My neighbor wasn't home, but her teenager was, and he knew the window trick. Two minutes later I was inside. I bought a lockbox the next morning.",
  "These tacos come from a truck behind the tire shop on Fifth. The tortillas aren't store-bought, they're pressed to order. Get the al pastor, and ask for the green salsa on the side because it's hot.",
  "Our rescue dog wouldn't walk past the mailbox for a month. Every day we stopped one step closer and gave her a piece of chicken. Yesterday she walked right by it and didn't look up.",
  "Sourdough takes us two days. We mix on day one, let it rise slowly in the fridge overnight, then shape and bake in the morning. The cold rise is where the sour taste comes from. What's the one baking step you always used to skip?",
];
for (const text of human) assert.equal(scan(text).tells, 0, `a person's script came out with tells: ${tellsOf(text).join(", ")}\n${text}`);
const sloppy = [
  "Stop scrolling! You've been doing mornings wrong your whole life. Here's the thing: it's not about discipline, it's about design. The result? Chaos. Studies show this is a game-changer. Follow for more.",
  "In today's fast-paced world, nobody is talking about this. Let's dive in. POV: you finally fixed your sleep. It's mind-blowing... truly. Ultimately, small habits shape our future. Comment SLEEP below.",
  "Have you ever wondered why your coffee tastes bitter? This isn't just coffee. It's a ritual. Number one: grind fresh. Little did they know the secret was water. Like and subscribe!",
];
for (const text of sloppy) assert.ok(scan(text).tells >= 5, `a sloppy script came out too clean (${scan(text).tells} tells):\n${text}`);

// The CLI, and the published examples match a live run and hold no dashes.
const dir = mkdtempSync(join(tmpdir(), "scan-"));
writeFileSync(join(dir, "s.txt"), "Hey guys, this is mind-blowing and a game-changer.");
const cli = spawnSync(process.execPath, [SCAN, join(dir, "s.txt"), "--json"], { encoding: "utf8" });
assert.equal(cli.status, 0);
assert.ok(JSON.parse(cli.stdout).tells >= 2);
for (const args of [[], [join(dir, "missing.txt")], ["a.txt", "b.txt"], ["--jsno", "a.txt"]]) assert.equal(spawnSync(process.execPath, [SCAN, ...args], { encoding: "utf8" }).status, 2, args.join(" "));
for (const f of ["./skills/deslop-script/scan.mjs", "./skills/deslop-script/SKILL.md"]) assert.doesNotMatch(readFileSync(here(f), "utf8"), DASH, `${f} has a dash character`);
const examples = here("./examples/deslop-script/");
if (existsSync(examples)) {
  for (const name of readdirSync(examples).filter((n) => n.endsWith(".md"))) {
    const page = readFileSync(join(examples, name), "utf8");
    assert.doesNotMatch(page, DASH, `${name} has a dash character`);
    const blocks = [...page.matchAll(/```\n([\s\S]*?)\n```/g)].map((m) => m[1]);
    // Pairs: a script block followed by its scanner block.
    for (let i = 0; i + 1 < blocks.length; i++) {
      if (/^\d+ tells and \d+ to check/.test(blocks[i + 1]) && !/^\d+ tells and/.test(blocks[i])) assert.equal(blocks[i + 1], report(scan(blocks[i])), `${name}: the scanner output shown is not what the scanner says now`);
    }
  }
}
console.log("ok: scan tests passed");
