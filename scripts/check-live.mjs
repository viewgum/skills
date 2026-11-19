// Compares this repo with its sources: the skill and tool list viewgum.com serves, and the specs repository's data. Exit 1 on drift.
import { readFileSync } from "node:fs";

const local = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const localBytes = (p) => readFileSync(new URL(`../${p}`, import.meta.url));
const getBytes = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": "viewgum-skills-check" } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};
const get = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": "viewgum-skills-check" } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
};

const drift = [];
const liveSkill = await getBytes("https://viewgum.com/agents/skill.md");
if (!liveSkill.equals(localBytes("skills/viewgum-shorts/SKILL.md"))) drift.push("skills/viewgum-shorts/SKILL.md differs from https://viewgum.com/agents/skill.md");

const card = JSON.parse(await get("https://viewgum.com/.well-known/mcp/server-card.json"));
const live = card.tools.map((t) => `${t.name}: ${t.description ?? ""}`).sort();
const ours = JSON.parse(local("mcp/tools.json")).tools.map((t) => `${t.name}: ${t.description}`).sort();
if (JSON.stringify(live) !== JSON.stringify(ours)) drift.push("mcp/tools.json differs from the live server card");

const names = ["safe-zones", "length-limits", "text-limits", "speaking-rates"];
const specs = await Promise.all(names.map((name) => fetch(`https://raw.githubusercontent.com/viewgum/short-form-video-specs/main/data/${name}.json`)));
const repo = await fetch("https://api.github.com/repos/viewgum/short-form-video-specs", { headers: { "user-agent": "viewgum-skills-check" } });
if (repo.status !== 200 && repo.status !== 404) throw new Error(`api.github.com answered ${repo.status}`);
const unpublished = repo.status === 404;
if (unpublished) console.log("The specs repository is not published yet: references/ was not compared.");
else {
  for (const [i, res] of specs.entries()) {
    const file = `skills/short-form-specs/references/${names[i]}.json`;
    if (!res.ok) drift.push(`${file}: the specs repository answered ${res.status}`);
    else if (!Buffer.from(await res.arrayBuffer()).equals(localBytes(file))) drift.push(`${file} differs from the specs repository`);
  }
}

if (drift.length) {
  console.error(drift.join("\n"));
  process.exit(1);
}
console.log(unpublished ? "in step with viewgum.com" : "in step with viewgum.com and the specs repository");
