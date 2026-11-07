# AGENTS.md

## Project Context

PromptFlow — a node-based visual canvas for chaining LLM prompts (React Flow + OpenRouter). Full spec, tech stack, and phase breakdown live in `@.agents/plan/PLAN.md` — read it before starting any task, not just when confused.

**Stack:** TypeScript (strict), React + Vite, `@xyflow/react`, Zustand, Tailwind, OpenRouter via OpenAI-compatible SDK. Don't introduce a different framework, state library, or styling approach without asking first.

## Commands

<!-- Fill these in once the project is scaffolded — agents rely on this to verify their own work -->
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test`
- Typecheck: `npm run typecheck`

## Response Style

- Keep responses concise by default. Only go long if I explicitly ask for detail or a walkthrough.
- No filler summaries of what you're about to do — just do it, then report what changed.

## Planning Mode

- Never assume design, tech stack, or feature scope — ask before proceeding.
- Ask clarifying questions **up front, batched together**, not one at a time mid-task.
- Check `@.agents/plan/PLAN.md` first for anything already decided — don't re-ask questions it already answers.
- If a request conflicts with something in `PLAN.md`, flag the conflict explicitly instead of silently picking one.

## Change / Edit Mode

- Work phase by phase, exactly as broken down in `PLAN.md`. Stop after each phase and wait for my feedback before starting the next — don't chain phases together automatically.
- Prefer delegating implementation work to subagents over doing it yourself directly, when a subagent setup exists for the task type.
- Show a short summary of what changed after each phase (files touched, key decisions made) — not the full diff unless asked.

## Model Tiers

- **Planning, review, and multi-step implementation:** use the strongest available free-tier model.
- **Routine/system tasks** (installs, boilerplate scaffolding, running commands, formatting): use the lightest/cheapest available model — no need to burn a strong model on mechanical work.
- If unsure which tier a task falls into, default to the stronger model rather than risk broken code from a weaker one.

## Subagents

- use the global agent ui-interactivity-tester when checking the UI
- Define subagents under `.opencode/agent/` (project-level) with `mode: subagent` and an explicit `model:` field per the tier rules above.
- Use them for scoped, well-defined tasks (e.g. a review-only agent, a test-writing agent) rather than open-ended "build the feature" delegation — keep me in the loop on anything architectural.

## Codebase Navigation (graphify)

A knowledge graph of this repo lives in `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`). Use it before raw text search.

- **Query first.** For any question about structure, relationships or "where/what calls/what depends on" — run `graphify query "<question>"` (or `graphify path "A" "B"` / `graphify explain "<symbol>"`) **before** using `grep`, `find` or reading files to explore. Skim `graphify-out/GRAPH_REPORT.md` for the god nodes and community map when starting on an unfamiliar area.
- **Then verify in source.** Treat graph answers as a map: read the cited `source_file`/`source_location` before editing, and trust the code over the graph if they disagree. `INFERRED`/`AMBIGUOUS` edges are hints, not facts.
- **Fall back to grep/Read** only for exact-string lookups (a literal, a CSS class, a log message), for files the graph doesn't cover, or when the graph is missing or visibly stale.
- **Update after changes.** After code edits (and before committing), refresh the graph with `graphify update .` (AST only, no LLM, no API key). After changing docs (`AGENTS.md`, `README.md`) or images, run `/graphify . --update` instead so semantic nodes are re-extracted. Commit the refreshed `graphify-out/graph.json`, `GRAPH_REPORT.md` and `manifest.json` with the change, as their own `chore(graph)` commit.
- Never hand-edit files in `graphify-out/`; rebuild them.

## Code Conventions

<!-- Fill in as they stabilize -->
- TypeScript strict mode, no `any` without a comment explaining why.
- Functional components + hooks only, no class components.
- One component per file, colocate related types in the same file unless shared across modules (then → `src/types/`).