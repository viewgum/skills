// Compares this repo with its sources: the skill and tool list viewgum.com serves, and the specs repository's data. Exit 1 on drift.
import { readFileSync } from "node:fs";

const local = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const get = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": "viewgum-skills-check" } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
};

const drift = [];
const liveSkill = await get("https://viewgum.com/agents/skill.md");
if (liveSkill.trim() !== local("skills/viewgum-shorts/SKILL.md").trim()) drift.push("skills/viewgum-shorts/SKILL.md differs from https://viewgum.com/agents/skill.md");

const card = JSON.parse(await get("https://viewgum.com/.well-known/mcp/server-card.json"));
const live = card.tools.map((t) => `${t.name}: ${t.description ?? ""}`).sort();
const ours = JSON.parse(local("mcp/tools.json")).tools.map((t) => `${t.name}: ${t.description}`).sort();
if (JSON.stringify(live) !== JSON.stringify(ours)) drift.push("mcp/tools.json differs from the live server card");

for (const name of ["safe-zones", "length-limits", "text-limits", "speaking-rates"]) {
  const url = `https://raw.githubusercontent.com/viewgum/short-form-video-specs/main/data/${name}.json`;
  const res = await fetch(url);
  if (res.status === 404) {
    console.log(`${url} is not published yet; skipped`);
    continue;
  }
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  const theirs = JSON.stringify(await res.json());
  const ours = JSON.stringify(JSON.parse(local(`skills/short-form-specs/references/${name}.json`)));
  if (theirs !== ours) drift.push(`skills/short-form-specs/references/${name}.json differs from the specs repository`);
}

if (drift.length) {
  console.error(drift.join("\n"));
  process.exit(1);
}
console.log("in step with viewgum.com");
