# CLAUDE.md — ai-hedge-fund-x

## What this is
Fork of [virattt/ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) (multi-agent LLM
trading simulator: FastAPI backend + React/TS frontend, ~17 investor persona agents).
Pushed to github.com/grep24/ai-hedge-fund-x. **Dormant since 2025-06-11.**

Daniel's changes on top of upstream (June 2025) were almost entirely Railway
deployment plumbing and small frontend fixes — no changes to agent/trading logic.

## Current deploy state (what actually shipped)
- Railway, **pure-Python Nixpacks auto-detect** — NOT Docker. The Dockerfile,
  railway.toml, and nixpacks.toml were all removed/renamed to `.backup` after
  repeated build failures (see commits 0dd0b53, c62ec44, f2957af).
- Entry: `Procfile` → `python3 start_server.py` → uvicorn `app.backend.main:app`
  on `$PORT` (default 8080).
- Frontend is **prebuilt locally** (`./build-frontend-local.sh`) and the static
  bundle is committed/served by FastAPI, to avoid Railway memory limits during
  `npm build`. Root path serves the frontend; static mount order matters (c02b2b8).
- Frontend must call the **POST streaming API**, not EventSource/GET (ed4a73a).
- Dependency pins that bit before: pydantic >= 2.7.4; do NOT re-pin langchain-core
  (conflicts with langchain-anthropic) — commits 307a991, 267e5b0.

## Docs status
- `DEPLOYMENT.md` (root and docs/) still describes the abandoned Dockerfile
  approach — treat as historical. See "Current deploy state" above.
- Upstream README/docs describe the original project; still accurate for the
  agent architecture and local run instructions (poetry / `src/main.py`).

## Don'ts
- Don't reintroduce Dockerfile/nixpacks.toml/railway.toml without re-testing on
  Railway; each was removed because it broke builds or hit memory limits.
- Don't rebuild the frontend on Railway; build locally and commit the output.
