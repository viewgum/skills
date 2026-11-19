// Offline checks: skill frontmatter, tool names the skills use, manifests agreeing, spec figures matching the data.
import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const json = (p) => JSON.parse(read(p));
const MCP_URL = "https://viewgum.com/mcp";

const skillDirs = readdirSync(new URL("./skills/", import.meta.url), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
assert.deepEqual(skillDirs.sort(), ["ai-label-check", "deslop-script", "hook-check", "post-copy", "short-form-script", "short-form-specs", "upload-preflight", "viewgum-shorts"]);
for (const dir of skillDirs) {
  const text = read(`./skills/${dir}/SKILL.md`);
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(fm, `${dir}: SKILL.md needs frontmatter`);
  const name = /^name: (.+)$/m.exec(fm[1])?.[1];
  const description = /^description: (.+)$/m.exec(fm[1])?.[1];
  assert.equal(name, dir, `${dir}: name must match the folder`);
  assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(description && description.length <= 1024, `${dir}: description must be 1 to 1024 characters`);
}

const tools = json("./mcp/tools.json");
const toolNames = new Set(tools.tools.map((t) => t.name));
const params = new Set(["quote_id", "wait_seconds", "session_id", "kit_id"]);
const named = read("./skills/viewgum-shorts/SKILL.md").match(/\b[a-z]+(?:_[a-z]+)+\b/g) ?? [];
for (const token of new Set(named)) if (!params.has(token)) assert.ok(toolNames.has(token), `viewgum-shorts names ${token}, which the connector does not list`);

const claude = json("./.claude-plugin/plugin.json");
const portable = json("./plugin.json");
const gemini = json("./gemini-extension.json");
const market = json("./.claude-plugin/marketplace.json");
for (const m of [claude, portable, gemini]) {
  assert.equal(m.name, "viewgum");
  assert.equal(m.version, claude.version);
  assert.equal(m.description, claude.description);
}
assert.equal(market.plugins[0].name, claude.name);
assert.equal(market.plugins[0].source, "./");
assert.equal(json("./.mcp.json").mcpServers.viewgum.url, MCP_URL);
assert.equal(json("./.mcp.json").mcpServers.viewgum.type, "http");
assert.equal(json("./mcp.json").mcpServers.viewgum.url, MCP_URL);
assert.equal(json("./mcp.json").mcpServers.viewgum.type, "streamable-http");
assert.equal(gemini.mcpServers.viewgum.httpUrl, MCP_URL);
assert.equal(tools.server, MCP_URL);

const z = json("./skills/short-form-specs/references/safe-zones.json");
const boxes = Object.values(z.platforms).map((p) => p.box);
const all = z.clearOnEvery.box;
assert.equal(all.left, Math.max(...boxes.map((b) => b.left)));
assert.equal(all.right, Math.min(...boxes.map((b) => b.right)));
assert.equal(all.top, Math.max(...boxes.map((b) => b.top)));
assert.equal(all.bottom, Math.min(...boxes.map((b) => b.bottom)));
const specs = read("./skills/short-form-specs/SKILL.md");
assert.ok(specs.includes(`y from ${all.top} to ${all.bottom}`));
assert.ok(specs.includes(`x from ${all.left} to ${all.right}`));
assert.ok(specs.includes(`below y = ${all.railTop}, x no further right than ${all.railLeft}`));
for (const [id, label] of [["tiktok", "TikTok"], ["youtube-shorts", "YouTube Shorts"], ["instagram-reels", "Instagram Reels, Facebook Reels"]]) {
  const b = z.platforms[id].box;
  assert.ok(specs.includes(`| ${label} | ${b.left}, ${b.top}, ${b.right}, ${b.bottom} |`), `${id} row disagrees with the data`);
}

const files = ["README.md", "skills/viewgum-shorts/SKILL.md", "skills/short-form-specs/SKILL.md", "skills/hook-check/SKILL.md", "skills/short-form-script/SKILL.md", "skills/post-copy/SKILL.md", "skills/upload-preflight/SKILL.md", "skills/ai-label-check/SKILL.md", "skills/deslop-script/SKILL.md", "skills/deslop-script/scan.mjs", "examples/deslop-script/2026-11-19-pay-yourself-first.md", "examples/deslop-script/2026-11-19-cold-brew.md", "examples/hook-check/2026-11-19-cat-gifts.md", "examples/upload-preflight/2026-11-19-demo-clip.md", "examples/short-form-script/2026-11-19-sunscreen-window.md", "bin/viewgum.mjs", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", "plugin.json", "gemini-extension.json"];
for (const f of files) assert.doesNotMatch(read(`./${f}`), /[\u2013\u2014]/, `${f} has a dash character`);
console.log("ok");
