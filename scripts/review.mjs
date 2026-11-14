import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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

const promptParts = [
  `Review every email in ${folder} against brand/voice.md and .claude/rules/emails.md.`,
  "Report only real problems.",
];

const findingsPath = resolve(root, "review", "findings.json");
if (existsSync(findingsPath)) {
  try {
    const prev = JSON.parse(readFileSync(findingsPath, "utf-8"));
    if (prev.folder === folder && prev.findings?.length > 0) {
      promptParts.push(
        "",
        "These are findings from the last review:",
        JSON.stringify(prev.findings, null, 2),
        "",
        "Report only problems that are new or still not fixed. Don't repeat ones that have been fixed.",
      );
    }
  } catch {}
}

const prompt = promptParts.join("\n");

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

  if (result.is_error) {
    console.error("Claude returned an error.");
    console.error(JSON.stringify(result).slice(0, 500));
    process.exit(2);
  }

  const so = result.structured_output;
  if (!so || !Array.isArray(so.findings)) {
    console.error("No structured_output with a findings array.");
    console.error(JSON.stringify(result).slice(0, 500));
    process.exit(2);
  }

  const output = { folder, findings: so.findings };

  mkdirSync(resolve(root, "review"), { recursive: true });
  writeFileSync(findingsPath, JSON.stringify(output, null, 2));

  const total = output.findings.length;
  const high = output.findings.filter((f) => f.severity === "high").length;
  const medium = output.findings.filter((f) => f.severity === "medium").length;
  const low = output.findings.filter((f) => f.severity === "low").length;

  console.log(
    `Review done: ${total} finding(s) — ${high} high, ${medium} medium, ${low} low.`
  );

  if (high > 0) {
    process.exit(1);
  }
});
