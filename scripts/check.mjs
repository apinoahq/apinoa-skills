// Every skill must load in every agent that reads the Agent Skills format: a SKILL.md whose frontmatter has a
// `name` equal to its folder (lowercase, digits and hyphens, at most 64 characters) and a `description` of at
// most 1,024 characters. The plugin manifests must parse and name only skills that exist.
import { readdirSync, readFileSync, existsSync } from "node:fs";

let failed = 0;
const fail = (m) => { console.error(`✘ ${m}`); failed++; };

const dirs = readdirSync("skills", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
if (dirs.length === 0) fail("no skills under skills/");
for (const dir of dirs) {
  const file = `skills/${dir}/SKILL.md`;
  if (!existsSync(file)) { fail(`${file} is missing`); continue; }
  const m = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) { fail(`${file} has no frontmatter`); continue; }
  const fields = Object.fromEntries(
    m[1].split("\n").filter((l) => /^[a-z-]+:/.test(l)).map((l) => {
      const i = l.indexOf(":");
      let v = l.slice(i + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = JSON.parse(v);
      return [l.slice(0, i), v];
    }),
  );
  if (fields.name !== dir) fail(`${file}: name "${fields.name}" is not its folder "${dir}"`);
  if (!/^[a-z0-9-]{1,64}$/.test(fields.name ?? "")) fail(`${file}: name must be lowercase letters, digits and hyphens, at most 64`);
  const n = [...(fields.description ?? "")].length;
  if (n === 0 || n > 1024) fail(`${file}: description is ${n} characters (1-1,024)`);
  console.log(`✔ ${dir} (${n})`);
}
for (const f of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", ".mcp.json"]) {
  try { JSON.parse(readFileSync(f, "utf8")); } catch (e) { fail(`${f}: ${e.message}`); }
}
process.exit(failed ? 1 : 0);
