<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## E2E before shipping to dev

If you changed page structure (links, buttons, titles, routes, headers) or the app bridge (`src/shared/lib/nativeBridge.ts`, `src/shared/lib/nativeStack.ts`, `src/widgets/bottom-nav`), run E2E against your local server before merging into `dev`:

```
pnpm dev                                         # another terminal
E2E_BASE_URL=http://localhost:3000 pnpm test:e2e # 1–2 min
```

- The same E2E runs after every dev/main deploy (`.github/workflows/e2e.yml`), and `main` only reaches pawpong.kr if it passes (Vercel Deployment Checks), so a failure here blocks production.
- If you intentionally removed something a test relies on and the feature still works, fix the test in the same commit. When moving the change from `dev` to `main`, move that test fix too.
- A dev server left running for hours can serve stale server HTML (hydration mismatch on unchanged code). Restart it before trusting a failure.
