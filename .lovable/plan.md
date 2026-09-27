## Preview Diagnostics Panel

A small dev-only floating panel (bottom-right) that shows which routes and assets have been updated and when, so you can confirm changes are live without guessing about cache.

### What it shows
- **Build version**: short hash + timestamp of the current bundle
- **Routes list**: all routes (`/`, `/pricing`, `/download`, `/payment`, `/admin`, `/auth`, `/app`, `/setup-guide`) with the last-modified timestamp baked in at build time
- **Key assets**: logo, hero image, Windows installer — with their CDN URLs and updated time
- **Current route indicator**: highlights the route you're viewing
- **Copy-to-clipboard** button for build info (helps when reporting issues)

### UI behavior
- Small floating chip in bottom-right: `Build: abc123 · 12:45`
- Click to expand into a panel listing routes + assets + timestamps
- Only visible in dev/preview (hidden on published production site via `import.meta.env.DEV` check)
- Closeable; remembers state in `localStorage`

### Technical bits (for reference)
- New component: `src/components/PreviewDiagnostics.tsx`
- New file: `src/lib/build-info.ts` — generated at build via `vite.config.ts` `define` injecting `__BUILD_TIME__` and `__BUILD_HASH__`
- Routes/assets metadata: a static manifest in `src/lib/preview-manifest.ts` listing route paths + asset import refs with their `.asset.json` timestamps
- Mounted once in `src/routes/__root.tsx` next to `<AnimatedRays />`
- Zero impact on production (tree-shaken when `DEV` is false)

### Out of scope
- Not a server-side change log; this reflects bundle build time, not git history
- Does not fetch anything at runtime — purely build-time injected info

Confirm and I'll build it.
