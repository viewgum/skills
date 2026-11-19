// Tests for skills/deslop-script/scan.mjs: node scan-test.mjs. No dependencies.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { scan, spokenOf } from "./skills/deslop-script/scan.mjs";

const rules = (text) => scan(text).findings.filter((f) => f.kind === "tell").map((f) => f.rule);
const checksOf = (text) => scan(text).findings.filter((f) => f.kind === "check").map((f) => f.rule);
const has = (text, rule) => assert.ok(rules(text).includes(rule), `${rule} in: ${text}\n got ${rules(text).join(", ")}`);
const lacks = (text, rule) => assert.ok(!rules(text).includes(rule), `no ${rule} in: ${text}`);

has("In today's video we look at salt.", "meta-opener");
has("Hey guys, salt is weird.", "stock-opener");
lacks("Salt is weird. Hey guys, look at this.", "stock-opener");
has("Here's the thing: salt is cheap.", "announced-turn");
has("It's not a diet, it's a lifestyle.", "fake-contrast");
has("Cold brew isn't just coffee, it's a ritual.", "fake-contrast");
lacks("It's not cheap, so buy less.", "fake-contrast");
has("The result? Chaos. We left early and never went back.", "instant-answer");
lacks("What did the receipt say? It listed forty-one items, every one of them on sale.", "instant-answer");
has("We drove home. No warning. No plan. Nothing.", "fragments");
has("This trick is literally insane.", "hype");
has("Studies show it works.", "vague-source");
has("Moreover, it is cheap.", "page-word");
has("Little did they know the bridge was closed.", "stock-phrase");
has("It took eighteen hours \u2014 in cold water.", "dash");
has("And then... nothing.", "ellipsis");
has("Save first \u{1F4B8}", "emoji");
assert.ok(checksOf("I actually like it. It actually works.").includes("pet-word"));
assert.ok(!checksOf("I actually like it.").includes("pet-word"));
has("We saved two hundred dollars. And that's why you should always budget.", "explained-ending");
has("We saved two hundred dollars. What would you do?", "explained-ending");
has("Like and subscribe for more.", "generic-cta");
has("Let us know in the comments.", "generic-cta");
lacks("Your savings aren't growing because you save last. Flip the order. Set an automatic transfer for payday morning.", "fake-contrast");
has("In conclusion, save first.", "essay-closer");
has("Here's the truth: nobody budgets.", "hype-colon");
has("**Hook:** Save first.", "leftover");
has("Sure, here's your script. Save first.", "leftover");
has("In today's fast-paced world, saving is hard.", "stock-opener");
assert.ok(checksOf("This pivotal step underscores everything.").includes("stock-word"));
has("Let us delve into the tapestry of bread.", "stock-phrase");

const clean = scan("Your savings aren't growing because you save last.\nFlip the order.\nSet an automatic transfer for payday morning, into an account you don't spend from.");
assert.equal(clean.tells, 0);
assert.equal(clean.grade, "A");
const dirty = scan("Hey guys, in today's video, here's the thing. It's literally insane.");
assert.equal(dirty.grade, "D");
assert.ok(dirty.perHundred > 3);

// The HOOK / LINES / CLOSE layout: only spoken fields are scanned, never on-screen text or visuals.
const layout = "HOOK: Your savings start last.\nHOOK TEXT: Here's the thing\nHOOK VISUAL: A literally insane chart\nLINES:\n1. SAY: Flip the order. | TEXT: Studies show | VISUAL: none\nCLOSE: Save first.";
assert.deepEqual(spokenOf(layout).map((l) => l.text), ["Your savings start last.", "Flip the order.", "Save first."]);
assert.equal(scan(layout).tells, 0);

const dir = mkdtempSync(join(tmpdir(), "scan-"));
writeFileSync(join(dir, "s.txt"), "Hey guys, this is literally insane.");
const cli = spawnSync(process.execPath, ["skills/deslop-script/scan.mjs", join(dir, "s.txt"), "--json"], { encoding: "utf8" });
assert.equal(cli.status, 0);
assert.ok(JSON.parse(cli.stdout).tells >= 3);
assert.equal(spawnSync(process.execPath, ["skills/deslop-script/scan.mjs"], { encoding: "utf8" }).status, 2);
assert.equal(spawnSync(process.execPath, ["skills/deslop-script/scan.mjs", join(dir, "missing.txt")], { encoding: "utf8" }).status, 2);
for (const f of ["skills/deslop-script/scan.mjs", "skills/deslop-script/SKILL.md"]) assert.doesNotMatch(readFileSync(f, "utf8"), /[\u2013\u2014]/, `${f} has a dash character`);
// Fixes from review: normal speech is not punished, layouts are read whole.
lacks("Turn the key to unlock the door, then take the dog's harness off.", "stock-phrase");
assert.equal(scan("Turn the key to unlock the door, then take the dog's harness off.").tells, 0);
lacks("Wait 10\u201315 minutes before slicing.", "dash");
has("It took a day\u2013and a night.", "dash");
const curly = "In today\u2019s video, here\u2019s the thing: it\u2019s not a diet, it\u2019s a lifestyle.";
for (const rule of ["meta-opener", "announced-turn", "fake-contrast"]) has(curly, rule);
assert.ok(scan(curly).findings.some((f) => f.text.includes("\u2019")), "quotes keep the creator's own apostrophes");
const mixed = "HOOK: I tried it.\nIt was literally insane.\nCLOSE: I went home.";
has(mixed, "hype");
assert.equal(scan(mixed).words, 10);
const wrapped = "We drove all night to get there and the place was\nclosed when we arrived at six in the morning.";
assert.equal(scan(wrapped).tells, 0, "a soft wrap is not a sentence break");
const steps = "1. Bring water.\n2. Pack food.\n3. Check tires.";
lacks(steps, "fragments");
assert.equal(scan(steps).words, 6);
assert.equal(scan("").grade, "none");
assert.equal(scan("HOOK:\nLINES:\n1. SAY: | TEXT: x\nCLOSE:").grade, "none");
assert.equal(scan("It cost $12.50 at the time and still does today.").tells, 0);
const longText = Array.from({ length: 2000 }, () => "We drove home and slept well that night.").join("\r\n");
assert.equal(scan(longText).tells, 0);
assert.equal(spawnSync(process.execPath, ["skills/deslop-script/scan.mjs", "a.txt", "b.txt"], { encoding: "utf8" }).status, 2);
assert.equal(spawnSync(process.execPath, ["skills/deslop-script/scan.mjs", "--jsno", "a.txt"], { encoding: "utf8" }).status, 2);
console.log("ok: scan tests passed");
