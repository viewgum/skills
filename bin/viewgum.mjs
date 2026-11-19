#!/usr/bin/env node
// Opens ViewGum's Make stage on an idea, or adds the ViewGum connector to an agent. No dependencies.
import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

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

export const cursorLink = () => `cursor://anysphere.cursor-deeplink/mcp/install?name=viewgum&config=${Buffer.from(JSON.stringify({ url: MCP_URL })).toString("base64")}`;
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
  viewgum make "<idea>" [--look <look id>] [--print]   open ViewGum's Make stage with the idea filled in
  viewgum connect <claude|codex|gemini|cursor|vscode> [--run]   show the steps to add the ViewGum connector;
                                                     --run runs them for claude and codex

Making a short needs a ViewGum account; every paid step shows its price before it starts.
Exit codes: 0 done, 1 a connect command failed, 2 bad input.`;

export function main(argv, { open = openInBrowser, run = (args) => spawnSync(args[0], args.slice(1), { stdio: "inherit" }).status } = {}) {
  const [command, ...rest] = argv;
  const flag = (name) => rest.includes(`--${name}`);
  const value = (name) => {
    const i = rest.indexOf(`--${name}`);
    return i >= 0 ? rest[i + 1] : undefined;
  };
  const allowOnly = (names) => {
    const bad = rest.find((arg) => arg.startsWith("--") && !names.includes(arg.slice(2)));
    if (bad) throw new Error(`unknown option ${bad}`);
  };
  try {
    if (command === "make") {
      allowOnly(["look", "print"]);
      const look = value("look");
      if (rest.includes("--look") && (look === undefined || look.startsWith("--"))) throw new Error("--look needs a look id");
      const idea = rest.filter((arg, i) => !arg.startsWith("--") && rest[i - 1] !== "--look").join(" ");
      const url = makeUrl(idea, { look });
      console.log(url);
      if (!flag("print") && !open(url)) console.log("Open the link above in your browser.");
      return 0;
    }
    if (command === "connect") {
      allowOnly(["run"]);
      const client = Object.hasOwn(CLIENTS, rest[0]) ? CLIENTS[rest[0]] : null;
      if (!client) throw new Error(`connect needs one of: ${Object.keys(CLIENTS).join(", ")}`);
      if (flag("run") && !client.run) throw new Error(`--run works for claude and codex; for ${rest[0]}, follow the steps it prints without --run`);
      if (client.run) {
        for (const args of client.run) {
          console.log(`$ ${args.join(" ")}`);
          if (flag("run") && run(args) !== 0) {
            console.log(`That did not finish. Is ${args[0]} installed?`);
            return 1;
          }
        }
        if (!flag("run")) console.log("Run the commands above, or add --run to run them now.");
      } else {
        console.log(client.show);
      }
      console.log(client.then);
      return 0;
    }
    if (command === "help" || command === "--help") { console.log(HELP); return 0; }
    throw new Error(command ? `unknown command "${command}"` : "no command");
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
