import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: node scripts/review.mjs <campaign-folder>");
  process.exit(2);
}

const schemaText = readFileSync(
  resolve(root, "review", "findings.schema.json"),
  "utf-8"
);

const prompt = [
  `Review every email in ${folder} against brand/voice.md and .claude/rules/emails.md.`,
  "Report only real problems.",
].join(" ");

const args = [
  "-p",
  prompt,
  "--output-format",
  "json",
  "--json-schema",
  schemaText,
  "--allowedTools",
  "Read,Glob,Grep",
];

const claude = process.platform === "win32" ? "claude.exe" : "claude";

const child = execFile(claude, args, {
  cwd: root,
  maxBuffer: 10 * 1024 * 1024,
  windowsHide: true,
}, (err, stdout, stderr) => {
  if (err) {
    console.error("Claude failed:", err.message);
    if (stderr) console.error(stderr);
    process.exit(2);
  }

  let result;
  try {
    const parsed = JSON.parse(stdout);
    if (Array.isArray(parsed)) {
      result = parsed[parsed.length - 1];
    } else {
      result = parsed;
    }
  } catch {
    console.error("Could not parse Claude output as JSON.");
    console.error(stdout.slice(0, 500));
    process.exit(2);
  }

  const findings = result.structured_output ?? result.result ?? result;

  mkdirSync(resolve(root, "review"), { recursive: true });
  writeFileSync(
    resolve(root, "review", "findings.json"),
    JSON.stringify(findings, null, 2)
  );

  const total = findings.findings?.length ?? 0;
  const high = findings.findings?.filter((f) => f.severity === "high").length ?? 0;
  const medium = findings.findings?.filter((f) => f.severity === "medium").length ?? 0;
  const low = findings.findings?.filter((f) => f.severity === "low").length ?? 0;

  console.log(
    `Review done: ${total} finding(s) — ${high} high, ${medium} medium, ${low} low.`
  );

  if (high > 0) {
    process.exit(1);
  }
});
