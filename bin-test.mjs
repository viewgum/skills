// Tests for bin/viewgum.mjs: node bin-test.mjs. No network; nothing is opened or run.
import assert from "node:assert/strict";

import { CLIENTS, cursorLink, main, makeUrl, MCP_URL, vscodeLink } from "./bin/viewgum.mjs";

const url = new URL(makeUrl("  How a hippo\nholds its breath ", { look: "build3d" }));
assert.equal(url.origin + url.pathname, "https://viewgum.com/shorts");
assert.equal(url.searchParams.get("topic"), "How a hippo holds its breath");
assert.equal(url.searchParams.get("look"), "build3d");
assert.equal(url.searchParams.get("ref"), "github-cli");
assert.equal(new URL(makeUrl("x".repeat(500))).searchParams.get("topic").length, 200);
assert.throws(() => makeUrl("   "), /give the idea/);
assert.throws(() => makeUrl("idea", { look: "Build 3D" }), /not a look id/);
assert.equal(new URL(makeUrl("idea", { ref: "github-skills" })).searchParams.get("ref"), "github-skills");

assert.equal(cursorLink(), `cursor://anysphere.cursor-deeplink/mcp/install?name=viewgum&config=${Buffer.from(JSON.stringify({ url: MCP_URL })).toString("base64")}`);
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
  assert.equal(ran.length, 2);
  assert.equal(main(["connect", "claude", "--run"], { run: () => 1 }), 1);
  assert.equal(main(["connect", "nope"]), 2);
  assert.equal(main(["frobnicate"]), 2);
  assert.equal(main([]), 2);
} finally {
  console.log = log;
  console.error = err;
}
assert.ok(out.some((line) => line.includes("/mcp auth viewgum") || line.includes("codex mcp login viewgum")));
for (const line of out) assert.doesNotMatch(line, /[\u2013\u2014]/);
log("ok: bin tests passed");
