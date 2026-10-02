# Cursor Rules — `.cursor/rules/`

Persistent context rules for AI agents. Cursor tự động inject vào context khi AI chạm glob tương ứng — không cần AI opt-in.

## Files

| File | `alwaysApply` | `globs` | Trigger |
| ---- | ------------- | ------- | ------- |
| `00-skill-mandatory.mdc` | ✅ true | (any) | Mọi session |
| `10-uc-doc-required.mdc` | ❌ false | `.ai/skills/software-engineering/examples/UC-*/**` | Sửa UC docs |
| `20-architecture-backend.mdc` | ❌ false | `backend/src/**/*.js` | Sửa backend code |
| `20-architecture-frontend.mdc` | ❌ false | `frontend/src/**/*.jsx` | Sửa frontend code |
| `30-no-invent.mdc` | ❌ false | `backend/src/**/*`, `frontend/src/**/*` | Tạo cái mới |

## How to add a new rule

1. Tạo file `.cursor/rules/<name>.mdc`
2. Frontmatter:

```yaml
---
description: One-line mô tả (Cursor picker hiển thị)
alwaysApply: false           # true nếu muốn áp dụng mọi lúc
globs: backend/src/**/*.js   # file pattern nếu không alwaysApply
---
```

3. Body rule — **dưới 50 dòng**, một concern, có concrete example

## Why use `.cursor/rules/` instead of skill only?

| | Skill (`.ai/skills/`) | Rules (`.cursor/rules/`) |
| - | -------------------- | ----------------------- |
| Auto-loaded? | ❌ AI phải tự mở | ✅ Cursor inject tự động |
| Skip được? | ✅ AI có thể skip | ❌ Không thể skip |
| Conflict resolution? | ❌ Không có | ✅ Last-rule-wins |

**Rule ở `.cursor/rules/` có compliance cao hơn** vì AI không thể "quên" load. Đây là Layer 2 trong hệ thống phòng thủ.

## Owner

**Huỳnh Gia Phúc** — Last updated: 2026-10-02