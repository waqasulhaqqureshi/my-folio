/*
 * Preflight: runs before `npm run dev` / `npm run build`.
 *
 * WHY THIS EXISTS
 * A failed dependency install does not announce itself. npm aborts the whole
 * transaction when any postinstall fails, leaving node_modules empty or
 * partial — and the first symptom the developer sees is Next reporting
 * "Module not found: Can't resolve 'marked'". That message points at the
 * wrong thing entirely: marked is fine, the install never finished.
 *
 * This turns that confusing failure into an explicit diagnosis plus the exact
 * command that fixes it.
 *
 * Must use only Node builtins and zero imports from node_modules — the whole
 * point is that node_modules may be broken.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const problems = [];

// --- 1. Node version -------------------------------------------------------
// Next 16 requires >=20.9.0. On Node 18 the install succeeds and then fails at
// runtime with errors that look like application bugs.
const required = { major: 20, minor: 9 };
const running = process.versions.node;
const [major, minor] = running.split(".").map(Number);
if (major < required.major || (major === required.major && minor < required.minor)) {
  problems.push({
    title: `Node ${running} is too old — this project needs >= 20.9.0`,
    fix: [
      "Install Node 20 LTS or newer, then re-run the install:",
      "  nvm install 20 && nvm use 20      # or download from nodejs.org",
      "  rm -rf node_modules package-lock.json && npm install",
    ],
  });
}

// --- 2. Dependencies physically present ------------------------------------
// Reading package.json is not enough: the failure mode is that the declared
// package is absent from disk. Check the directory itself.
let declared = [];
try {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  declared = Object.keys(pkg.dependencies ?? {});
} catch {
  problems.push({ title: "package.json could not be read", fix: ["Are you in the project root?"] });
}

if (!existsSync(join(root, "node_modules"))) {
  problems.push({
    title: "node_modules is missing — dependencies were never installed",
    fix: ["  npm install"],
  });
} else {
  const missing = declared.filter((name) => !existsSync(join(root, "node_modules", name)));
  if (missing.length > 0) {
    problems.push({
      title: `${missing.length} declared package(s) missing from node_modules: ${missing.join(", ")}`,
      fix: [
        "This means a previous `npm install` aborted part-way (a failed postinstall",
        "rolls back the whole transaction). Installing over the top often reports",
        "\"up to date\" and leaves the gaps, so remove the tree first:",
        "",
        "  rm -rf node_modules package-lock.json .next",
        "  npm install",
      ],
    });
  }
}

if (problems.length === 0) process.exit(0);

console.error(`\n${RED}${BOLD}✖ Preflight failed — the dev server was not started.${RESET}\n`);
for (const p of problems) {
  console.error(`${YELLOW}${BOLD}• ${p.title}${RESET}`);
  for (const line of p.fix) console.error(`  ${line}`);
  console.error("");
}
console.error(`${BOLD}Fix the above, then run the command again.${RESET}\n`);
process.exit(1);
