/**
 * scripts/drift-detect.js
 *
 * Standalone drift detector — chạy ở CI (GitHub Actions) hoặc weekly cron.
 *
 * Kiểm tra các loại drift:
 *   D1. Code chưa có UC doc — backend/src/ thay đổi nhưng docs/UC/ không có
 *   D2. Code chưa có UML — backend/src/ thay đổi nhưng docs/plantuml/ không có
 *   D3. UC id không tồn tại trong UC-PACKAGE
 *   D4. Module mới name không match UC-PACKAGE
 *   D5. Permission mới không nằm trong permissions.js
 *   D6. Endpoint mới (trong router) không có trong UC-PACKAGE
 *   D7. Diagram SD/CD có UC id trong filename nhưng UC doc không tồn tại
 *
 * Usage:
 *   node scripts/drift-detect.js                          # check working tree vs HEAD
 *   node scripts/drift-detect.js --base=origin/main       # check vs base branch
 *   node scripts/drift-detect.js --staged                 # check staged vs HEAD
 *   node scripts/drift-detect.js --all                   # full repo check (default for CI)
 *
 * Exit codes:
 *   0 — PASS (no drift, or only WARN)
 *   1 — FAIL (drift found, must fix)
 *   2 — SKIP (no source code yet, pre-init)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const MODE = (() => {
  if (args.includes('--base')) return 'vs-base';
  if (args.includes('--staged')) return 'staged';
  return 'all';
})();
const BASE = (args.find(a => a.startsWith('--base=')) || '').split('=')[1] || 'origin/main';

// ---- Helpers ----
function fileExists(p) {
  try { return fs.existsSync(p); } catch (_) { return false; }
}

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; }
}

function exec(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }); }
  catch (e) { return ''; }
}

function listFiles(dir, ext) {
  try {
    if (!fileExists(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith(ext))
      .map(e => path.join(dir, e.name));
  } catch (_) { return []; }
}

function walkJs(dir) {
  const out = [];
  if (!fileExists(dir)) return out;
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile() && full.endsWith('.js')) out.push(full);
    }
  }
  return out;
}

// ---- Get changed files ----
function getChangedFiles(mode, base) {
  let cmd = '';
  if (mode === 'staged') {
    cmd = 'git diff --cached --name-only';
  } else if (mode === 'vs-base') {
    cmd = `git diff --name-only ${base}...HEAD 2>/dev/null || git diff --name-only HEAD`;
  } else {
    // all — full repo source files
    return walkJs(path.join(ROOT, 'backend/src'))
      .concat(walkJs(path.join(ROOT, 'frontend/src')))
      .map(p => path.relative(ROOT, p).replace(/\\/g, '/'));
  }
  const out = exec(cmd);
  return out.split('\n').map(s => s.trim()).filter(Boolean);
}

// ---- Find UC ids from a string ----
function extractUcIds(s) {
  if (!s) return [];
  const re = /\bUC-(\d{2})\b/g;
  const ids = new Set();
  let m;
  while ((m = re.exec(s))) ids.add(`UC-${m[1]}`);
  return [...ids].sort();
}

// ---- Find UC ids from UC-PACKAGE ----
function findUcIdsInPackage() {
  const pkgPath = path.join(ROOT, 'docs/UC/UC-PACKAGE.md');
  const content = readFile(pkgPath) || '';
  return extractUcIds(content);
}

// ---- Find UC ids from per-UC README files ----
function findUcIdsInDocs() {
  const ucDir = path.join(ROOT, 'docs/UC');
  if (!fileExists(ucDir)) return [];
  const ids = new Set();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && p.endsWith('.md')) {
        for (const id of extractUcIds(readFile(p) || '')) ids.add(id);
      }
    }
  };
  walk(ucDir);
  return [...ids].sort();
}

// ---- Find permission constants ----
function findPermissions() {
  const permPath = path.join(ROOT, 'backend/src/constants/permissions.js');
  const content = readFile(permPath) || '';
  const re = /\b([A-Z][A-Z_]+)\s*[:=]/g;
  const perms = new Set();
  let m;
  while ((m = re.exec(content))) perms.add(m[1]);
  return [...perms].sort();
}

// ---- Find router files ----
function findRouterEndpoints() {
  const routerDir = path.join(ROOT, 'backend/src/modules');
  const endpoints = [];
  if (!fileExists(routerDir)) return endpoints;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && /\.router\.(js|ts)$/.test(e.name)) {
        const content = readFile(p) || '';
        const re = /\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
        let m;
        while ((m = re.exec(content))) {
          endpoints.push({ method: m[1].toUpperCase(), path: m[2], file: path.relative(ROOT, p) });
        }
      }
    }
  };
  walk(routerDir);
  return endpoints;
}

// ---- Find UC names in UC-PACKAGE ----
function findUcPackageEndpoints() {
  const pkgPath = path.join(ROOT, 'docs/UC/UC-PACKAGE.md');
  const content = readFile(pkgPath) || '';
  const endpoints = [];
  // Match `METHOD /path` patterns under Related API section
  const re = /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[A-Za-z0-9_\-\/:]+)/g;
  let m;
  while ((m = re.exec(content))) {
    endpoints.push({ method: m[1], path: m[2] });
  }
  return endpoints;
}

// ---- Find puml files ----
function findPumlFiles() {
  const dir = path.join(ROOT, 'docs/plantuml');
  if (!fileExists(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.puml'))
    .map(f => {
      const m = /(CD|SD)-(\d{2})-/.exec(f);
      return m ? { type: m[1], uc: `UC-${m[2]}`, file: f } : null;
    })
    .filter(Boolean);
}

// ---- Main ----
function main() {
  // Skip if pre-init
  if (!fileExists(path.join(ROOT, 'backend/src')) && !fileExists(path.join(ROOT, 'frontend/src'))) {
    console.log('⚠️  SKIP: no backend/src or frontend/src (template skill state)');
    process.exit(2);
  }

  console.log(`\n=== Drift Detect (mode: ${MODE}${MODE === 'vs-base' ? ', base=' + BASE : ''}) ===\n`);

  const results = [];
  const changed = getChangedFiles(MODE, BASE);

  // ---- D1 / D2: code without doc ----
  if (MODE !== 'all') {
    const codeChanged = changed.filter(f =>
      /^backend\/src\//.test(f) || /^frontend\/src\//.test(f));
    const docChanged = changed.filter(f =>
      /^docs\/UC\//.test(f) || /^docs\/plantuml\//.test(f) || /^docs\/BACKLOG\.md$/.test(f));

    if (codeChanged.length > 0 && docChanged.length === 0) {
      results.push({ id: 'D1', severity: 'FAIL',
        text: `Code changed (${codeChanged.length} files) but no UC/UML/BACKLOG updated.` });
    } else {
      results.push({ id: 'D1', severity: 'PASS',
        text: `${codeChanged.length} code files / ${docChanged.length} doc files` });
    }
  }

  // ---- D3: UC ids in code that don't exist in UC-PACKAGE ----
  const declaredUcs = new Set([...findUcIdsInPackage(), ...findUcIdsInDocs()]);
  const codeUcs = new Set();
  for (const f of changed) {
    if (!/\.(js|jsx|ts|tsx)$/.test(f)) continue;
    const content = readFile(path.join(ROOT, f));
    if (!content) continue;
    for (const id of extractUcIds(content)) codeUcs.add(id);
  }
  const orphanUcs = [...codeUcs].filter(u => !declaredUcs.has(u));
  if (orphanUcs.length > 0) {
    results.push({ id: 'D3', severity: 'FAIL',
      text: `UC ids referenced in code but not in UC-PACKAGE/docs: [${orphanUcs.join(', ')}]` });
  } else if (codeUcs.size > 0) {
    results.push({ id: 'D3', severity: 'PASS',
      text: `All ${codeUcs.size} UC ids in code are declared in docs` });
  }

  // ---- D4: backend modules without UC reference ----
  const backendModules = path.join(ROOT, 'backend/src/modules');
  if (fileExists(backendModules)) {
    const orphanModules = [];
    for (const e of fs.readdirSync(backendModules, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const moduleDir = path.join(backendModules, e.name);
      let hasUc = false;
      const walk = (d) => {
        for (const f of fs.readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, f.name);
          if (f.isDirectory()) walk(p);
          else if (f.isFile() && p.endsWith('.js')) {
            const c = readFile(p) || '';
            if (extractUcIds(c).length > 0) { hasUc = true; return; }
          }
        }
      };
      walk(moduleDir);
      if (!hasUc) orphanModules.push(e.name);
    }
    if (orphanModules.length > 0) {
      results.push({ id: 'D4', severity: 'WARN',
        text: `Modules without UC id references: [${orphanModules.join(', ')}]` });
    } else {
      results.push({ id: 'D4', severity: 'PASS', text: 'All modules have UC id references' });
    }
  }

  // ---- D5: permission constants check ----
  const declaredPerms = new Set(findPermissions());
  if (declaredPerms.size > 0) {
    const codePerms = new Set();
    for (const f of walkJs(path.join(ROOT, 'backend/src/modules'))) {
      const c = readFile(f) || '';
      const re = /requirePermission\s*\(\s*['"`]([A-Z_]+)['"`]\s*\)/g;
      let m;
      while ((m = re.exec(c))) codePerms.add(m[1]);
    }
    const orphanPerms = [...codePerms].filter(p => !declaredPerms.has(p));
    if (orphanPerms.length > 0) {
      results.push({ id: 'D5', severity: 'FAIL',
        text: `Permissions used in code but not in permissions.js: [${orphanPerms.join(', ')}]` });
    } else if (codePerms.size > 0) {
      results.push({ id: 'D5', severity: 'PASS',
        text: `All ${codePerms.size} permissions declared in permissions.js` });
    }
  }

  // ---- D6: endpoints in router not in UC-PACKAGE ----
  const routerEps = findRouterEndpoints();
  const pkgEps = findUcPackageEndpoints();
  if (routerEps.length > 0 && pkgEps.length > 0) {
    const pkgSet = new Set(pkgEps.map(e => `${e.method} ${e.path}`));
    const missing = routerEps.filter(e => !pkgSet.has(`${e.method} ${e.path}`));
    if (missing.length > 0) {
      results.push({ id: 'D6', severity: 'FAIL',
        text: `Endpoints in routers but not in UC-PACKAGE:\n     ${missing.map(e => `  ${e.method} ${e.path} (${e.file})`).join('\n     ')}` });
    } else {
      results.push({ id: 'D6', severity: 'PASS',
        text: `All ${routerEps.length} endpoints declared in UC-PACKAGE` });
    }
  }

  // ---- D7: PlantUML ↔ UC doc mapping ----
  const pumls = findPumlFiles();
  if (pumls.length > 0) {
    const orphanDiagrams = pumls.filter(f => !declaredUcs.has(f.uc))
      .filter(f => f.type === 'CD');  // only CD missing classes triggers
    if (orphanDiagrams.length > 0) {
      results.push({ id: 'D7', severity: 'WARN',
        text: `CD files for UC without doc: [${orphanDiagrams.map(d => d.file).join(', ')}]` });
    } else {
      results.push({ id: 'D7', severity: 'PASS',
        text: `All ${pumls.length} puml files have matching UC docs` });
    }
  }

  // ---- Report ----
  console.log('');
  let nFail = 0, nWarn = 0, nPass = 0;
  for (const r of results) {
    const icon = r.severity === 'PASS' ? '✅' : r.severity === 'WARN' ? '⚠️ ' : '❌';
    console.log(`${icon}  [${r.id}] ${r.severity}`);
    for (const line of r.text.split('\n')) console.log(`        ${line.trim()}`);
    if (r.severity === 'FAIL') nFail++;
    else if (r.severity === 'WARN') nWarn++;
    else nPass++;
  }
  console.log(`\n${nPass} pass, ${nWarn} warn, ${nFail} fail\n`);

  if (nFail > 0) {
    console.error('Fix the FAIL rows above before merging. Reference:');
    console.error('  .ai/skills/software-engineering/rules/10-validation.md');
    process.exit(1);
  }
  process.exit(0);
}

main();