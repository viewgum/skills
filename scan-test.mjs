// Tests for skills/deslop-script/scan.mjs: node scan-test.mjs. No dependencies.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { scan, spokenOf } from "./skills/deslop-script/scan.mjs";

const rules = (text) => scan(text).findings.filter((f) => f.kind === "tell").map((f) => f.rule);
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
has("I actually like it. It actually works.", "pet-word");
lacks("I actually like it.", "pet-word");
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
has("This pivotal step underscores everything.", "stock-phrase");

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
for (const f of ["skills/deslop-script/scan.mjs", "skills/deslop-script/SKILL.md"]) assert.doesNotMatch(spawnSync("cat", [f], { encoding: "utf8" }).stdout, /[\u2013\u2014]/, `${f} has a dash character`);
console.log("ok: scan tests passed");
