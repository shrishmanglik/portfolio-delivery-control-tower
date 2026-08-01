import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const healthPath = resolve("src/domain/health.ts");
const original = readFileSync(healthPath, "utf8");
const detectorPattern = /export const criticalSourceIntegrityDetector = \(input: HealthInput\): boolean =>[\s\S]*?input\.hasUnvalidatedFinancials;/;
const mutant = original.replace(detectorPattern, "export const criticalSourceIntegrityDetector = (_input: HealthInput): boolean => false;");

if (mutant === original) throw new Error("Mutation target was not found; detector proof is invalid.");

function runCriticalSuite() {
  return spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", "src/domain/health.test.ts"], { encoding: "utf8" });
}

try {
  const clean = runCriticalSuite();
  if (clean.status !== 0) throw new Error(`Restored control failed before mutation:\n${clean.stdout}\n${clean.stderr}`);
  writeFileSync(healthPath, mutant, "utf8");
  const killed = runCriticalSuite();
  if (killed.status === 0) throw new Error("Critical detector mutant survived; suite did not detect the disabled guard.");
  process.stdout.write("PASS clean control\nPASS mutant killed (disabled source-integrity detector caused a failing suite)\n");
} finally {
  writeFileSync(healthPath, original, "utf8");
}

const restored = runCriticalSuite();
if (restored.status !== 0) throw new Error(`Restored control failed after mutation:\n${restored.stdout}\n${restored.stderr}`);
process.stdout.write("PASS restored control\n");
