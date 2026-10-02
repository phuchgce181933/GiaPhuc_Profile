# Cursor Hooks — `.cursor/hooks/`

Phần mềm (không phải AI) chặn sai. Đây là Layer 3 trong hệ thống phòng thủ — compliance ~90% (vs ~50% nếu chỉ có skill).

## Current hooks

| Event | Hook | Match | Action |
| ----- | ---- | ----- | ------ |
| `beforeSubmitPrompt` | (prompt) | always | Inject skill reminder vào context |
| `afterFileEdit`     | `post-edit-validate.js` | always | Sau khi edit file backend/frontend → nhắc update UC docs + SD/CD |

## Files

```
.cursor/
  hooks.json                      # main config
  hooks/
    post-edit-validate.js         # afterFileEdit hook
```

## How `post-edit-validate.js` works

1. Sau khi AI dùng tool `Write` / `Edit` để sửa file
2. Hook đọc `filePath` từ stdin JSON
3. Nếu file thuộc:
   - `backend/src/modules/`
   - `backend/src/models/`
   - `backend/src/middlewares/`
   - `frontend/src/pages/`, `components/`, `api/`, `hooks/`
4. → Inject reminder: "Phase E + F + G — update UC docs + UML + validate"

## Fail behavior

- `failClosed: false` → nếu hook crash, edit vẫn pass (fail-open)
- Không chặn edit, chỉ nhắc

## Cài thêm hook

Xem `.cursor/skills-cursor/create-hook/SKILL.md` để biết event list và syntax.

## Owner

**Huỳnh Gia Phúc** — Last updated: 2026-10-02