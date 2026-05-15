---
name: setup-docs
description: >
  Run the docs site, blog, or Storybook locally. Use when contributing to
  documentation, previewing blog posts, or developing UI components in
  isolation. Not needed for regular frontend development.
allowed-tools: Bash
---

# Local Docs, Blog & Storybook Setup

These are all independent of the main dev server — you don't need the database or Auth0 configured to run any of them. Just make sure dependencies are installed first (`pnpm install --filter lfx-insights` from the repo root).

All commands run from the `frontend/` directory.

---

## Docs site

VitePress docs served at `http://localhost:5173`:

```bash
cd frontend && pnpm docs:dev
```

Build and preview the production output:
```bash
cd frontend && pnpm docs:build && pnpm docs:preview
```

---

## Blog

VitePress blog served at `http://localhost:5174`:

```bash
cd frontend && pnpm blog:dev
```

Build and preview:
```bash
cd frontend && pnpm blog:build && pnpm blog:preview --port 5174
```

---

## Storybook

Component development and documentation, served at `http://localhost:6006`:

```bash
cd frontend && pnpm storybook
```

Build static Storybook:
```bash
cd frontend && pnpm storybook:build
```

---

## Troubleshooting

- **Port already in use** — kill the process using the port or change it with `--port <N>`
- **Missing dependencies** — run `pnpm install --filter lfx-insights` from the repo root first
- **Storybook build errors** — usually a component import issue; check the console output for the failing story
