#!/usr/bin/env node
// PostToolUse hook: run Prettier (+ ESLint for JS/TS) on files Claude writes/edits.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const FORMAT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx"]);
const LINT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let filePath;
try {
  filePath = JSON.parse(raw)?.tool_input?.file_path;
} catch {
  process.exit(0);
}
if (!filePath) process.exit(0);

const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const abs = path.resolve(filePath);
const rel = path.relative(root, abs);
const ext = path.extname(abs).toLowerCase();

if (
  rel.startsWith("..") ||
  path.isAbsolute(rel) ||
  /(^|[\\/])(node_modules|\.next)([\\/]|$)/.test(rel) ||
  !FORMAT_EXT.has(ext) ||
  !existsSync(abs)
) {
  process.exit(0);
}

const run = (args) =>
  spawnSync("npx", ["--no-install", ...args], {
    cwd: root,
    encoding: "utf8",
    shell: true, // npx is a .cmd on Windows
  });

const prettier = run(["prettier", "--write", `"${abs}"`]);
if (prettier.status !== 0) {
  process.stderr.write(`Prettier failed on ${rel}:\n${prettier.stdout}${prettier.stderr}`);
  process.exit(2);
}

if (LINT_EXT.has(ext)) {
  const eslint = run(["eslint", "--fix", `"${abs}"`]);
  if (eslint.status !== 0) {
    process.stderr.write(`ESLint errors in ${rel} (fix them):\n${eslint.stdout}${eslint.stderr}`);
    process.exit(2);
  }
}

process.exit(0);
