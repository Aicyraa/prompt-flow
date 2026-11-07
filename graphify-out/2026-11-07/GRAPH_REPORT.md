# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 146 files · ~50,418 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 738 nodes · 2056 edges · 37 communities (26 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c17cef0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NodeConfigPanel.tsx
- ModelPicker.tsx
- OpenRouter Client & Providers
- dependencies
- History & Run Tests
- executeFlow.ts
- useSettingsStore
- Markdown Output Rendering
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- package.json
- Agent Workflow Rules
- EmptyState.tsx
- ESLint Config
- Debounced Storage
- npm Scripts
- graphStore.ts
- opencode Config
- HTML Shell
- Prettier Config
- Brand Assets
- README & Setup
- @vitejs/plugin-react
- Vite Env Types
- tsconfig Root
- Verification Commands
- Misc 30
- @types/react@^18.3.12
- @types/react-dom@^18.3.1
- typescript@^5.6.3
- runStore.ts

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 49 edges
2. `vitest` - 48 edges
3. `useSettingsStore` - 45 edges
4. `useRunStore` - 39 edges
5. `react` - 32 edges
6. `@xyflow/react` - 27 edges
7. `useModelStore` - 25 edges
8. `FlowNode` - 24 edges
9. `NodeType` - 21 edges
10. `Icon()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `setup()` --calls--> `OutputNode()`  [EXTRACTED]
  src/components/nodes/OutputNode.test.tsx → src/components/nodes/OutputNode.tsx
- `setup()` --calls--> `NodeConfigPanel()`  [EXTRACTED]
  src/components/panels/NodeConfigPanel.test.tsx → src/components/panels/NodeConfigPanel.tsx
- `setup()` --calls--> `NodeShell()`  [EXTRACTED]
  src/components/ui/NodeShell.test.tsx → src/components/ui/NodeShell.tsx
- `llm()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/preflight.test.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `stripTransientNode()`  [INFERRED]
  src/store/graphStore.ts → src/lib/serialization.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (37 total, 11 thin omitted)

### Community 0 - "NodeConfigPanel.tsx"
Cohesion: 0.06
Nodes (59): Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, MINIMAP_COLORS, nodeTypes, ModelPicker(), supportsParam() (+51 more)

### Community 1 - "ModelPicker.tsx"
Cohesion: 0.07
Nodes (44): @testing-library/react, @testing-library/user-event, vitest, ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels() (+36 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.07
Nodes (52): zod, ApiError, createOpenRouterClient(), GenerateContext, GenerateOptions, GenerateResult, generateText(), OPENROUTER_BASE_URL (+44 more)

### Community 3 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5, zod@^3.23.8 (+3 more)

### Community 4 - "History & Run Tests"
Cohesion: 0.11
Nodes (24): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), RunSummaryLine(), formatUsd(), DiffLine (+16 more)

### Community 5 - "executeFlow.ts"
Cohesion: 0.07
Nodes (29): applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds() (+21 more)

### Community 6 - "useSettingsStore"
Cohesion: 0.05
Nodes (60): react-hot-toast@^2.4.1, react, react-hot-toast, App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal (+52 more)

### Community 7 - "Markdown Output Rendering"
Cohesion: 0.17
Nodes (22): OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components, MarkdownViewProps, textOf() (+14 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.13
Nodes (14): devDependencies, eslint@^9.15.0, jsdom@^31.0.0, tailwindcss@^3.4.15, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @typescript-eslint/eslint-plugin@^8.15.0, vite@^6.0.1 (+6 more)

### Community 10 - "TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+9 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.19
Nodes (14): CurvedEdge(), bendForOffset(), buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE (+6 more)

### Community 12 - "CI Workflow"
Cohesion: 0.13
Nodes (14): runs-on, steps, jobs, check, name, on, pull_request, push (+6 more)

### Community 13 - "package.json"
Cohesion: 0.15
Nodes (12): autoprefixer@^10.4.20, postcss@^8.4.49, prettier@^3.9.10, @typescript-eslint/parser@^8.15.0, name, private, type, version (+4 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "EmptyState.tsx"
Cohesion: 0.31
Nodes (6): EmptyState(), setup(), Logo(), KeySettings, maskKey(), resolveApiKey()

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "Debounced Storage"
Cohesion: 0.25
Nodes (8): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "graphStore.ts"
Cohesion: 0.06
Nodes (56): nanoid, @xyflow/react, NodeShellProps, FOCUS_RINGS, estimateCost(), catalog, chain(), [cheap, reasoner, free] (+48 more)

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

### Community 41 - "runStore.ts"
Cohesion: 0.18
Nodes (15): CostEstimate, NodeStatusUpdate, preflight(), PreflightInput, PreflightIssue, catalog, llm(), ErrorKind (+7 more)

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 228 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `ModelPicker.tsx` to `NodeConfigPanel.tsx`, `OpenRouter Client & Providers`, `History & Run Tests`, `executeFlow.ts`, `useSettingsStore`, `Markdown Output Rendering`, `devDependencies`, `runStore.ts`, `Edge Geometry`, `package.json`, `EmptyState.tsx`, `Debounced Storage`, `graphStore.ts`, `@vitejs/plugin-react`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NodeConfigPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06419753086419754 - nodes in this community are weakly interconnected._
- **Why does `react` connect `useSettingsStore` to `NodeConfigPanel.tsx`, `ModelPicker.tsx`, `dependencies`, `History & Run Tests`, `Markdown Output Rendering`, `Edge Geometry`, `package.json`, `graphStore.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `ModelPicker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06935908691834942 - nodes in this community are weakly interconnected._
- **Why does `@xyflow/react` connect `graphStore.ts` to `NodeConfigPanel.tsx`, `ModelPicker.tsx`, `dependencies`, `useSettingsStore`, `Edge Geometry`, `package.json`, `EmptyState.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._