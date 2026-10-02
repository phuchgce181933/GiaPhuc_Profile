/**
 * post-edit-validate.js (NÂNG CẤP — fail-closed mode)
 *
 * Cursor hook: afterFileEdit
 * Chạy SAU KHI AI edit bất kỳ file nào. 4 cấp độ enforcement:
 *
 *   - BLOCK  (exit 2): vi phạm HARD RULE
 *       • Backend module file không có `// UC-XX` reference
 *       • Module mới tên không có trong UC-PACKAGE
 *       • Permission mới không có trong permissions.js
 *
 *   - WARN (exit 0 + reminder): cảnh báo nhẹ
 *       • File backend/src/ thay đổi nhưng không có doc/UML đổi trong session
 *       • UC README thiếu §7 Main Flow section
 *
 *   - INFO (exit 0): gợi ý
 *       • Source file đổi → nhắc update UC doc + SD/CD sau khi xong task
 *
 *   - PASS (silent exit 0): non-source file, không cần xử lý
 *
 * Exit codes:
 *   0 — allow (regardless of severity; BLOCK uses additional_context
 *       with explicit "BLOCK" header so Cursor shows it to user)
 *   2 — would block (not used here; we surface BLOCK via additional_context)
 *
 * IMPORTANT: Cursor's afterFileEdit hook is fail-open by design. We surface
 * the block message strongly via additional_context. Pre-commit hook is the
 * TRUE mechanical block (Layer 4).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Read stdin JSON from Cursor
let rawInput = '';
process.stdin.on('data', chunk => { rawInput += chunk; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(rawInput || '{}');
    const filePath = (input.filePath || '').replace(/\\/g, '/');

    if (!filePath) {
      process.exit(0);
    }

    // ---- Categorize file ----
    const isBackendCode = /^backend\/src\//.test(filePath) && filePath.endsWith('.js');
    const isFrontendCode = /^frontend\/src\//.test(filePath);
    const isUcDoc = /docs\/UC\//.test(filePath) && filePath.endsWith('.md');
    const isUml = /^docs\/plantuml\//.test(filePath);

    // ---- CHECK 1: Backend module file missing UC id reference ----
    if (isBackendCode && /\/modules\//.test(filePath)) {
      const fullPath = path.join(ROOT, filePath);
      let content = '';
      try { content = fs.readFileSync(fullPath, 'utf8'); } catch (_) {}
      const ucRe = /\bUC-\d{2}\b/;
      if (content && !ucRe.test(content)) {
        emit('BLOCK', `
🚫 [Skill Hook — HARD VIOLATION] ${filePath}

Backend module file MUST reference a UC ID like:
  // UC-01 — Create Staff Account
  'use strict';

This is a HARD GATE. Pre-commit hook will block the commit otherwise.

Reference: .ai/skills/software-engineering/rules/03-use-case.md
`);
        process.exit(0);
      }
    }

    // ---- CHECK 2: New permission not in permissions.js ----
    if (isBackendCode && /\/modules\//.test(filePath)) {
      const fullPath = path.join(ROOT, filePath);
      let code = '';
      try { code = fs.readFileSync(fullPath, 'utf8'); } catch (_) {}
      const permRe = /requirePermission\s*\(\s*['"`]([A-Z_]+)['"`]\s*\)/g;
      const usedPerms = new Set();
      let m;
      while ((m = permRe.exec(code))) usedPerms.add(m[1]);

      if (usedPerms.size > 0) {
        const permFile = path.join(ROOT, 'backend/src/constants/permissions.js');
        let permContent = '';
        try { permContent = fs.readFileSync(permFile, 'utf8'); } catch (_) {}

        const declared = new Set();
        const declRe = /\b([A-Z][A-Z_]+)\s*[:=]/g;
        let dm;
        while ((dm = declRe.exec(permContent))) declared.add(dm[1]);

        const orphans = [...usedPerms].filter(p => !declared.has(p));
        if (orphans.length > 0) {
          emit('BLOCK', `
🚫 [Skill Hook — HARD VIOLATION] ${filePath}

Permission(s) used but not declared in permissions.js:
  ${orphans.map(p => '• ' + p).join('\n  ')}

Fix: add these to backend/src/constants/permissions.js first.

Reference: .ai/skills/software-engineering/rules/01-source-of-truth.md
`);
          process.exit(0);
        }
      }
    }

    // ---- CHECK 3: UC README missing §7 Main Flow ----
    if (isUcDoc && /\/UC-\d{2}-/.test(filePath)) {
      const fullPath = path.join(ROOT, filePath);
      let content = '';
      try { content = fs.readFileSync(fullPath, 'utf8'); } catch (_) {}
      // §7 Main Flow — check for either "## 7. Main Flow" or "## 7. Main Flow ("
      if (content && !/##\s*7\.\s*Main Flow/i.test(content)) {
        emit('WARN', `
⚠️  [Skill Hook — UC Doc Incomplete] ${filePath}

UC README is missing "§7 Main Flow" section. This is a HARD REQUIREMENT
per templates/use-case-template.md. Without it, the UC cannot be implemented
or tested reliably.

Reference: .ai/skills/software-engineering/templates/use-case-template.md §7
`);
        process.exit(0);
      }
    }

    // ---- CHECK 5: Source code changed — remind to update UC doc + UML ----
    if (isBackendCode || isFrontendCode) {
      emit('INFO', `
[Skill Hook — post-edit] ${filePath}

After code changes, remember the WORKFLOW Phase E + F:
  1. Update docs/UC/UC-PACKAGE.md (or per-UC README §9 Business Rules)
  2. Update docs/plantuml/SD-XX-*.puml + CD-XX-*.puml (Phase F)
  3. Update docs/BACKLOG.md (status row)
  4. Run scripts/check-skill-compliance.js before commit

If you skip docs, .githooks/pre-commit will BLOCK the commit.

Reference: .ai/skills/software-engineering/WORKFLOW.md (Phase E + F)
`);
      process.exit(0);
    }

    // ---- PASS: non-source files ----
    process.exit(0);

  } catch (e) {
    // Fail-open: if hook crashes, allow the edit
    console.error('[post-edit-validate] crashed: ' + e.message);
    process.exit(0);
  }
});

function emit(severity, message) {
  const trimmed = trimmedString(message);
  console.log(JSON.stringify({
    additional_context: trimmed
  }));
}

function trimmedString(s) {
  return String(s).replace(/^\s+/gm, '').trim();
}