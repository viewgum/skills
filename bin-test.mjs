// Tests for bin/viewgum.mjs: node bin-test.mjs. No network; nothing is opened or run.
import assert from "node:assert/strict";

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { CLIENTS, cursorLink, main, makeUrl, MCP_URL, vscodeLink } from "./bin/viewgum.mjs";

const scratch = mkdtempSync(join(tmpdir(), "viewgum-bin-"));
writeFileSync(join(scratch, "s.txt"), "Hey guys, in today's video this is literally insane.");

const url = new URL(makeUrl("  How a hippo\nholds its breath ", { look: "build3d" }));
assert.equal(url.origin + url.pathname, "https://viewgum.com/shorts");
assert.equal(url.searchParams.get("topic"), "How a hippo holds its breath");
assert.equal(url.searchParams.get("look"), "build3d");
assert.equal(url.searchParams.get("ref"), "github-cli");
assert.equal(new URL(makeUrl("x".repeat(500))).searchParams.get("topic").length, 200);
const wide = makeUrl("\u8336".repeat(60), { look: "build3d" });
assert.ok(new URL(wide).pathname.length + new URL(wide).search.length <= 400, "the return path fits through sign-in");
assert.equal(new URL(wide).searchParams.get("look"), "build3d");
assert.throws(() => makeUrl("   "), /give the idea/);
assert.throws(() => makeUrl("idea", { look: "Build 3D" }), /not a look id/);
assert.equal(new URL(makeUrl("idea", { ref: "github-skills" })).searchParams.get("ref"), "github-skills");

assert.equal(cursorLink(), `cursor://anysphere.cursor-deeplink/mcp/install?name=viewgum&config=${encodeURIComponent(Buffer.from(JSON.stringify({ url: MCP_URL })).toString("base64"))}`);
assert.equal(JSON.parse(decodeURIComponent(vscodeLink().split("?")[1])).url, "https://viewgum.com/mcp");
assert.deepEqual(CLIENTS.claude.run[0], ["claude", "mcp", "add", "--transport", "http", "viewgum", "https://viewgum.com/mcp"]);

const opened = [];
const ran = [];
const log = console.log;
const err = console.error;
const out = [];
console.log = (line) => out.push(String(line));
console.error = (line) => out.push(String(line));
try {
  assert.equal(main(["make", "Why", "cats", "bring", "gifts", "--look", "paper"], { open: (u) => opened.push(u) || true }), 0);
  assert.equal(new URL(opened[0]).searchParams.get("topic"), "Why cats bring gifts");
  assert.equal(new URL(opened[0]).searchParams.get("look"), "paper");
  assert.equal(main(["make", "idea", "--print"], { open: () => assert.fail("should not open") }), 0);
  assert.equal(main(["make", "idea", "--look"], { open: () => true }), 2);
  assert.equal(main(["make"], { open: () => true }), 2);
  assert.equal(main(["connect", "codex"], { run: (a) => ran.push(a) && 0 }), 0);
  assert.equal(ran.length, 0, "connect prints unless --run");
  assert.equal(main(["connect", "codex", "--run"], { run: (a) => { ran.push(a); return 0; } }), 0);
  assert.equal(ran.length, 1, "codex signs in while adding the server; login is the fallback");
  assert.equal(main(["connect", "claude", "--run"], { run: () => 1 }), 1);
  assert.equal(main(["connect", "nope"]), 2);
  assert.equal(main(["connect", "toString"]), 2, "inherited names are not clients");
  assert.equal(main(["connect", "cursor", "--run"]), 2, "--run only where there is something to run");
  assert.equal(main(["make", "idea", "--prnt"], { open: () => assert.fail("a typo must not open the browser") }), 2);
  assert.equal(main(["connect", "--run", "codex"], { run: () => 0 }), 0, "flags may come before the client");
  assert.equal(main(["connect", "claude", "extra"]), 2, "one client only");
  assert.equal(main(["make", "-h"], { open: () => assert.fail("help must not open") }), 0);
  assert.equal(main(["-h"]), 0);
  assert.equal(main(["make", "-p", "test"], { open: () => assert.fail("an unknown short flag must not open") }), 2);
  assert.equal(main(["make", "--print", "--", "--not-a-flag idea"], { open: () => assert.fail("print only") }), 0);
  assert.equal(main(["make", "idea", "--look", "paper", "--look", "flat"], { open: () => true }), 2, "a repeated flag is refused");
  assert.equal(main(["connect", "codex", "--run"], { run: () => ({ status: null, missing: true }) }), 1);
  assert.equal(main(["deslop", join(scratch, "s.txt")]), 0);
  assert.equal(main(["deslop", join(scratch, "s.txt"), "--json"]), 0);
  assert.equal(main(["deslop"]), 2);
  assert.equal(main(["deslop", join(scratch, "missing.txt")]), 2);
  assert.equal(main(["frobnicate"]), 2);
  assert.equal(main([]), 2);
} finally {
  console.log = log;
  console.error = err;
}
assert.ok(out.some((line) => line.includes("/mcp auth viewgum") || line.includes("codex mcp login viewgum")));
assert.ok(out.some((line) => /tells and \d+ to check/.test(line)), "deslop prints the report");
for (const line of out) assert.doesNotMatch(line, /[\u2013\u2014]/);
log("ok: bin tests passed");
