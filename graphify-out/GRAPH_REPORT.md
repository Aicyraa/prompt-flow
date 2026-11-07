# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 130 files · ~42,838 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 677 nodes · 1857 edges · 35 communities (25 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f00be2a2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NodeConfigPanel.tsx
- ModelPicker.tsx
- OpenRouter Client & Providers
- Templates, Estimates & File IO
- History & Run Tests
- Flow Execution Engine
- runStore.ts
- Markdown Output Rendering
- TS App Config
- Dev Dependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- package.json
- Agent Workflow Rules
- Runtime Dependencies
- ESLint Config
- Debounced Storage
- npm Scripts
- preflight.ts
- opencode Config
- HTML Shell
- Prettier Config
- Brand Assets
- README & Setup
- Vite Build Config
- Vite Env Types
- tsconfig Root
- Verification Commands
- Misc 30
- tailwindcss
- typescript@^5.6.3

## God Nodes (most connected - your core abstractions)
1. `vitest` - 43 edges
2. `useSettingsStore` - 37 edges
3. `useGraphStore` - 35 edges
4. `useRunStore` - 34 edges
5. `react` - 25 edges
6. `useModelStore` - 25 edges
7. `@xyflow/react` - 23 edges
8. `FlowNode` - 22 edges
9. `NodeType` - 19 edges
10. `compilerOptions` - 19 edges

## Surprising Connections (you probably didn't know these)
- `llm()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/preflight.test.ts → src/lib/nodes.ts
- `applyModels()` --indirect_call--> `isUsableModel()`  [INFERRED]
  src/store/modelStore.ts → src/lib/openrouter/models.ts
- `Tech stack (React, Vite, xyflow, Zustand, Tailwind, OpenRouter)` --semantically_similar_to--> `Approved tech stack`  [INFERRED] [semantically similar]
  README.md → AGENTS.md
- `Dialogs()` --calls--> `useSettingsStore`  [EXTRACTED]
  src/App.tsx → src/store/settingsStore.ts
- `App()` --calls--> `Canvas()`  [EXTRACTED]
  src/App.tsx → src/components/Canvas.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (35 total, 10 thin omitted)

### Community 0 - "NodeConfigPanel.tsx"
Cohesion: 0.07
Nodes (52): react, App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, supportsParam(), useModelInfo() (+44 more)

### Community 1 - "ModelPicker.tsx"
Cohesion: 0.13
Nodes (24): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+16 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.07
Nodes (52): ApiError, createOpenRouterClient(), GenerateContext, GenerateResult, generateText(), OPENROUTER_BASE_URL, OpenRouterClient, ProviderClient (+44 more)

### Community 3 - "Templates, Estimates & File IO"
Cohesion: 0.05
Nodes (74): nanoid, @xyflow/react, Canvas(), defaultEdgeOptions, edgeTypes, nodeTypes, CurvedEdge(), InputNode() (+66 more)

### Community 4 - "History & Run Tests"
Cohesion: 0.13
Nodes (20): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), formatUsd(), DiffLine, diffLines() (+12 more)

### Community 5 - "Flow Execution Engine"
Cohesion: 0.07
Nodes (32): applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds() (+24 more)

### Community 6 - "runStore.ts"
Cohesion: 0.07
Nodes (44): @testing-library/react, @testing-library/user-event, vitest, zustand, models, models, run, KeyStatus() (+36 more)

### Community 7 - "Markdown Output Rendering"
Cohesion: 0.17
Nodes (22): OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components, MarkdownViewProps, textOf() (+14 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint@^9.15.0, prettier@^3.9.10, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @types/react@^18.3.12, @typescript-eslint/eslint-plugin@^8.15.0, @typescript-eslint/parser@^8.15.0 (+8 more)

### Community 10 - "TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+9 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.19
Nodes (13): bendForOffset(), buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE, perp() (+5 more)

### Community 12 - "CI Workflow"
Cohesion: 0.13
Nodes (14): runs-on, steps, jobs, check, name, on, pull_request, push (+6 more)

### Community 13 - "package.json"
Cohesion: 0.15
Nodes (12): autoprefixer@^10.4.20, jsdom@^31.0.0, postcss@^8.4.49, @types/react-dom@^18.3.1, name, private, type, version (+4 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5 (+7 more)

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "Debounced Storage"
Cohesion: 0.33
Nodes (6): createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "preflight.ts"
Cohesion: 0.28
Nodes (7): preflight(), PreflightInput, PreflightIssue, catalog, llm(), ErrorKind, RunSummary

### Community 20 - "opencode Config"
Cohesion: 0.29
Nodes (6): mcp, playwright, command, enabled, type, $schema

### Community 21 - "HTML Shell"
Cohesion: 0.50
Nodes (5): index.html app shell, favicon.svg, src/main.tsx module entry script, #root mount div, theme-color #161310

### Community 22 - "Prettier Config"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 23 - "Brand Assets"
Cohesion: 0.70
Nodes (3): PromptFlow Brand Mark (two nodes joined by a flowing edge), Brand Palette (dark ink, violet accent, warm cream), PromptFlow Wordmark

### Community 24 - "README & Setup"
Cohesion: 0.40
Nodes (4): .env.example dev API key fallback, Flow persistence in localStorage, Getting started, npm scripts table

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 206 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `runStore.ts` to `NodeConfigPanel.tsx`, `ModelPicker.tsx`, `OpenRouter Client & Providers`, `Templates, Estimates & File IO`, `History & Run Tests`, `Flow Execution Engine`, `Markdown Output Rendering`, `Dev Dependencies`, `Edge Geometry`, `package.json`, `Debounced Storage`, `preflight.ts`, `Vite Build Config`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NodeConfigPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07163561076604555 - nodes in this community are weakly interconnected._
- **Why does `react` connect `NodeConfigPanel.tsx` to `ModelPicker.tsx`, `Templates, Estimates & File IO`, `History & Run Tests`, `runStore.ts`, `Markdown Output Rendering`, `package.json`, `Runtime Dependencies`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `ModelPicker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13012477718360071 - nodes in this community are weakly interconnected._
- **Why does `@xyflow/react` connect `Templates, Estimates & File IO` to `NodeConfigPanel.tsx`, `package.json`, `runStore.ts`, `Runtime Dependencies`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._