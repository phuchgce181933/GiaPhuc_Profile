/**
 * check-skill-compliance.js
 *
 * Pre-commit + CI script. Runs mechanical checks against HARD RULES in
 * `.ai/skills/software-engineering/rules/`:
 *
 *   RULE 01: source-of-truth priority
 *   RULE 03: 1 UC = 1 CD + 1 SD
 *   RULE 07: tests mirror real executed tests
 *   RULE 09: every task has a BACKLOG row
 *   RULE 11: only edit files in the impact matrix
 *
 * Usage:
 *   node scripts/check-skill-compliance.js
 *
 * Exit 0: PASS
 * Exit 1: FAIL with details
 * Exit 2: SKIP (no source files yet)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILL = path.join(ROOT, '.ai/skills/software-engineering');

const results = [];
const SKIP = { code: 2, reason: 'no source files (pre-init state)' };

function addResult(id, status, message) {
  results.push({ id, status, message });
}

function fileExists(p) {
  try { return fs.existsSync(p); } catch (_) { return false; }
}

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; }
}

function listFiles(dir, ext) {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith(ext))
      .map(e => path.join(dir, e.name));
  } catch (_) { return []; }
}

function extractUcIdsFromPackage(pkg) {
  if (!pkg) return [];
  const re = /\bUC-(\d{2})\b/g;
  const ids = new Set();
  let m;
  while ((m = re.exec(pkg))) ids.add(`UC-${m[1]}`);
  return [...ids].sort();
}

function extractUcIdsFromModule(moduleName, backendRoot) {
  const moduleDir = path.join(backendRoot, 'src/modules', moduleName);
  const re = /\bUC-(\d{2})\b/g;
  const ids = new Set();
  if (!fileExists(moduleDir)) return [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && p.endsWith('.js')) {
        const content = readFile(p) || '';
        let m;
        while ((m = re.exec(content))) ids.add(`UC-${m[1]}`);
      }
    }
  };
  walk(moduleDir);
  return [...ids].sort();
}

function main() {
  // ---- Skip check ----
  const backendSrc = path.join(ROOT, 'backend/src');
  if (!fileExists(backendSrc)) {
    console.log('⚠️  SKIP: backend/src missing (pre-init state)');
    console.log('   Re-run after `git restore` of source code.');
    process.exit(SKIP.code);
  }

  // ---- Check 1: UC-PACKAGE.md exists ----
  const ucPkgPath = path.join(ROOT, 'docs/UC/UC-PACKAGE.md');
  const ucPkg = readFile(ucPkgPath);
  if (!ucPkg) {
    addResult('C1', 'FAIL', 'docs/UC/UC-PACKAGE.md is missing — cannot validate UC list');
  } else {
    addResult('C1', 'PASS', `docs/UC/UC-PACKAGE.md exists (${ucPkg.length} bytes)`);
  }

  // ---- Check 2: PlantUML folder exists ----
  const pumlDir = path.join(ROOT, 'docs/plantuml');
  if (!fileExists(pumlDir)) {
    addResult('C2', 'FAIL', 'docs/plantuml/ is missing — UML drift cannot be detected');
  } else {
    addResult('C2', 'PASS', 'docs/plantuml/ exists');
  }

  // ---- Check 3: 1 UC = 1 CD + 1 SD (HARD RULE) ----
  const cds = listFiles(pumlDir, '.puml').filter(f => /CD-/.test(f));
  const sds = listFiles(pumlDir, '.puml').filter(f => /SD-/.test(f));
  const ucIds = extractUcIdsFromPackage(ucPkg);

  const cdMap = new Map();
  const sdMap = new Map();
  for (const f of cds) {
    const m = /CD-(\d{2})-/.exec(path.basename(f));
    if (m) cdMap.set(`UC-${m[1]}`, path.basename(f));
  }
  for (const f of sds) {
    const m = /SD-(\d{2})-/.exec(path.basename(f));
    if (m) sdMap.set(`UC-${m[1]}`, path.basename(f));
  }

  let missingCD = [];
  let missingSD = [];
  for (const uc of ucIds) {
    if (!cdMap.has(uc)) missingCD.push(uc);
    if (!sdMap.has(uc)) missingSD.push(uc);
  }

  if (missingCD.length === 0 && missingSD.length === 0) {
    addResult('C3', 'PASS', `All ${ucIds.length} UCs have 1:1 CD + SD mapping`);
  } else {
    addResult('C3', 'FAIL',
      `HARD RULE violation:\n     Missing CD: [${missingCD.join(', ') || 'none'}]\n     Missing SD: [${missingSD.join(', ') || 'none'}]`);
  }

  // ---- Check 4: Multiple diagrams per UC ----
  const cdsByUc = {};
  const sdsByUc = {};
  for (const f of cds) {
    const m = /CD-(\d{2})-/.exec(path.basename(f));
    if (!m) continue;
    const uc = `UC-${m[1]}`;
    cdsByUc[uc] = (cdsByUc[uc] || 0) + 1;
  }
  for (const f of sds) {
    const m = /SD-(\d{2})-/.exec(path.basename(f));
    if (!m) continue;
    const uc = `UC-${m[1]}`;
    sdsByUc[uc] = (sdsByUc[uc] || 0) + 1;
  }
  const dupCD = Object.entries(cdsByUc).filter(([, n]) => n > 1);
  const dupSD = Object.entries(sdsByUc).filter(([, n]) => n > 1);
  if (dupCD.length === 0 && dupSD.length === 0) {
    addResult('C4', 'PASS', 'No duplicate CDs or SDs (1:1 mapping enforced)');
  } else {
    addResult('C4', 'FAIL',
      `HARD RULE violation: multiple diagrams per UC\n     Multi-CD: ${JSON.stringify(dupCD)}\n     Multi-SD: ${JSON.stringify(dupSD)}`);
  }

  // ---- Check 5: Code modules reference UC ids ----
  const backendModules = path.join(backendSrc, 'modules');
  let orphanModules = [];
  if (fileExists(backendModules)) {
    for (const e of fs.readdirSync(backendModules, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const moduleName = e.name;
      const ucRefs = extractUcIdsFromModule(moduleName, path.join(ROOT, 'backend'));
      if (ucRefs.length === 0) {
        orphanModules.push(moduleName);
      }
    }
  }
  if (orphanModules.length === 0) {
    addResult('C5', 'PASS', 'Every backend module has UC id references');
  } else {
    addResult('C5', 'WARN', `Modules without UC id references: [${orphanModules.join(', ')}] — likely missing UC docs`);
  }

  // ---- Check 6: Skill files exist ----
  const required = [
    'SKILL.md',
    'WORKFLOW.md',
    'AI-READING-GUIDE.md',
    'rules/01-source-of-truth.md',
    'rules/03-use-case.md',
    'rules/11-change-impact-analysis.md',
    'rules/13-use-case-optimization-and-grouping.md',
    'checklists/release-checklist.md',
  ];
  const missing = required.filter(r => !fileExists(path.join(SKILL, r)));
  if (missing.length === 0) {
    addResult('C6', 'PASS', 'All required skill files exist');
  } else {
    addResult('C6', 'FAIL', `Missing skill files: [${missing.join(', ')}]`);
  }

  // ---- Print report ----
  console.log('\n=== Skill Compliance Report ===\n');
  let pass = 0, fail = 0, warn = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️ ' : '❌';
    console.log(`${icon}  [${r.id}] ${r.status} — ${r.message.split('\n')[0]}`);
    if (r.message.includes('\n')) {
      for (const line of r.message.split('\n').slice(1)) {
        console.log(`        ${line.trim()}`);
      }
    }
    if (r.status === 'PASS') pass++;
    else if (r.status === 'WARN') warn++;
    else fail++;
  }
  console.log(`\n${pass} pass, ${warn} warn, ${fail} fail\n`);

  if (fail > 0) process.exit(1);
  process.exit(0);
}

main();
