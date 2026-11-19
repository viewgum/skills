#!/usr/bin/env node
// Opens ViewGum's Make stage on an idea, or adds the ViewGum connector to an agent. No dependencies.
import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { report, scan } from "../skills/deslop-script/scan.mjs";

export const SITE = "https://viewgum.com";
export const MCP_URL = `${SITE}/mcp`;
export const REF = "github-cli";
const LOOK_SHAPE = /^[a-z][a-z0-9]{1,31}$/;
const TOPIC_MAX = 200;

/** The Make link: the idea as one plain line, an optional look id, and where the visit came from. */
export function makeUrl(idea, { look, ref = REF } = {}) {
  const topic = String(idea ?? "").replace(/\s+/g, " ").trim();
  if (!topic) throw new Error("give the idea in quotes, for example: make \"How a hippo holds its breath\"");
  if (look !== undefined && !LOOK_SHAPE.test(look)) throw new Error(`"${look}" is not a look id (lowercase letters and digits)`);
  const params = new URLSearchParams({ topic: Array.from(topic).slice(0, TOPIC_MAX).join("") });
  if (look) params.set("look", look);
  params.set("ref", ref);
  return `${SITE}/shorts?${params.toString()}`;
}

export const cursorLink = () => `cursor://anysphere.cursor-deeplink/mcp/install?name=viewgum&config=${encodeURIComponent(Buffer.from(JSON.stringify({ url: MCP_URL })).toString("base64"))}`;
export const vscodeLink = () => `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name: "viewgum", type: "http", url: MCP_URL }))}`;

/** What `connect` does for each client: commands it can run, and what to tell the person. */
export const CLIENTS = {
  claude: { name: "Claude Code", run: [["claude", "mcp", "add", "--transport", "http", "viewgum", MCP_URL]], then: "Inside Claude Code, run /mcp and sign in to ViewGum." },
  codex: { name: "Codex CLI", run: [["codex", "mcp", "add", "viewgum", "--url", MCP_URL], ["codex", "mcp", "login", "viewgum"]], then: "The login step opens ViewGum's sign-in page." },
  gemini: { name: "Gemini CLI", show: JSON.stringify({ mcpServers: { viewgum: { httpUrl: MCP_URL } } }, null, 2), then: "Add this to ~/.gemini/settings.json, then run /mcp auth viewgum to sign in." },
  cursor: { name: "Cursor", show: cursorLink(), then: "Open this link to add the server, then Settings, MCP, Connect to sign in." },
  vscode: { name: "VS Code", show: vscodeLink(), then: "Open this link to add the server; VS Code opens the sign-in page." },
};

// No shell on any system: cmd would split the link at each "&".
function openInBrowser(url) {
  const [cmd, args] = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["rundll32", ["url.dll,FileProtocolHandler", url]] : ["xdg-open", [url]];
  return spawnSync(cmd, args, { stdio: "ignore", shell: false }).status === 0;
}

const HELP = `Usage:
  viewgum deslop <script.txt | -> [--json]           list the habits that make a script sound machine-written
  viewgum make "<idea>" [--look <look id>] [--print]   open ViewGum's Make stage with the idea filled in
  viewgum connect <claude|codex|gemini|cursor|vscode> [--run]   show the steps to add the ViewGum connector;
                                                     --run runs them for claude and codex

Making a short needs a ViewGum account; every paid step shows its price before it starts.
Exit codes: 0 done, 1 a connect command failed, 2 bad input.`;

/** Runs a fixed command; npm installs claude and codex as .cmd shims on Windows, which only start through the shell there. */
const runFixed = (args) => {
  const result = spawnSync(args[0], args.slice(1), { stdio: "inherit", shell: process.platform === "win32" });
  return { status: result.status, missing: result.error?.code === "ENOENT" };
};

/** Splits arguments into positionals and known flags; an unknown flag, a repeated flag or a flag without its value is an error. */
function parse(rest, known) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "-h" || arg === "--help") { flags.help = true; continue; }
    if (!arg.startsWith("--")) { positional.push(arg); continue; }
    const name = arg.slice(2);
    if (!(name in known)) throw new Error(`unknown option ${arg}`);
    if (name in flags) throw new Error(`${arg} given twice`);
    if (known[name] === "value") {
      const next = rest[i + 1];
      if (next === undefined || next.startsWith("-")) throw new Error(`${arg} needs a value`);
      flags[name] = next;
      i++;
    } else flags[name] = true;
  }
  return { flags, positional };
}

export function main(argv, { open = openInBrowser, run = runFixed } = {}) {
  const [command, ...rest] = argv;
  try {
    if (!command || command === "help" || command === "--help" || command === "-h") {
      console.log(HELP);
      return command ? 0 : 2;
    }
    if (command === "deslop") {
      const { flags, positional } = parse(rest, { json: "flag" });
      if (flags.help) { console.log(HELP); return 0; }
      if (positional.length !== 1) throw new Error("deslop needs one script file, or - for standard input");
      let text;
      try {
        text = readFileSync(positional[0] === "-" ? 0 : positional[0], "utf8");
      } catch (error) {
        throw new Error(`cannot read ${positional[0]}: ${error.message}`);
      }
      const result = scan(text);
      console.log(flags.json ? JSON.stringify(result, null, 2) : report(result));
      return 0;
    }
    if (command === "make") {
      const { flags, positional } = parse(rest, { look: "value", print: "flag" });
      if (flags.help) { console.log(HELP); return 0; }
      const url = makeUrl(positional.join(" "), { look: flags.look });
      console.log(url);
      if (!flags.print && !open(url)) console.log("Open the link above in your browser.");
      return 0;
    }
    if (command === "connect") {
      const { flags, positional } = parse(rest, { run: "flag" });
      if (flags.help) { console.log(HELP); return 0; }
      if (positional.length !== 1 || !Object.hasOwn(CLIENTS, positional[0])) throw new Error(`connect needs one of: ${Object.keys(CLIENTS).join(", ")}`);
      const name = positional[0];
      const client = CLIENTS[name];
      if (flags.run && !client.run) throw new Error(`--run works for claude and codex; for ${name}, follow the steps it prints without --run`);
      if (client.run) {
        for (const args of client.run) {
          console.log(`$ ${args.join(" ")}`);
          if (flags.run) {
            const done = run(args);
            const status = typeof done === "number" ? done : done.status;
            if (status !== 0) {
              console.error(done?.missing ? `${args[0]} was not found; install it first.` : `${args.join(" ")} did not finish (exit ${status}).`);
              return 1;
            }
          }
        }
        if (!flags.run) console.log("Run the commands above, or add --run to run them now.");
      } else {
        console.log(client.show);
      }
      console.log(client.then);
      return 0;
    }
    throw new Error(`unknown command "${command}"`);
  } catch (error) {
    console.error(`viewgum: ${error.message}\n\n${HELP}`);
    return 2;
  }
}

const invoked = (() => {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();
if (invoked) process.exitCode = main(process.argv.slice(2));
