# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- Corpus is ~42,498 words - fits in a single context window. You may not need a graph.

## Summary
- 680 nodes · 1854 edges · 33 communities (25 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Canvas & React Flow
- Model Picker UI
- OpenRouter Client & Providers
- Templates, Estimates & File IO
- History & Run Tests
- Flow Execution Engine
- App Shell & Dialogs
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
- Connection Rules
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

## God Nodes (most connected - your core abstractions)
1. `vitest` - 43 edges
2. `useSettingsStore` - 39 edges
3. `useGraphStore` - 35 edges
4. `useRunStore` - 34 edges
5. `react` - 25 edges
6. `useModelStore` - 25 edges
7. `@xyflow/react` - 23 edges
8. `FlowNode` - 22 edges
9. `NodeType` - 19 edges
10. `compilerOptions` - 19 edges

## Surprising Connections (you probably didn't know these)
- `NodeShellProps` --references--> `NodeType`  [EXTRACTED]
  src/components/ui/NodeShell.tsx → src/types/flow.ts
- `llm()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/preflight.test.ts → src/lib/nodes.ts
- `NodeRef` --references--> `NodeType`  [EXTRACTED]
  src/lib/connections.ts → src/types/flow.ts
- `useGraphStore` --indirect_call--> `withFixedWidth()`  [INFERRED]
  src/store/graphStore.ts → src/lib/nodes.ts
- `LoadOptions` --references--> `ProviderId`  [EXTRACTED]
  src/store/modelStore.ts → src/lib/providers/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (33 total, 8 thin omitted)

### Community 0 - "Canvas & React Flow"
Cohesion: 0.07
Nodes (56): react, @testing-library/react, @testing-library/user-event, @xyflow/react, Canvas(), defaultEdgeOptions, edgeTypes, nodeTypes (+48 more)

### Community 1 - "Model Picker UI"
Cohesion: 0.07
Nodes (55): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+47 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.07
Nodes (51): zod, ApiError, createOpenRouterClient(), GenerateContext, GenerateOptions, GenerateResult, generateText(), OPENROUTER_BASE_URL (+43 more)

### Community 3 - "Templates, Estimates & File IO"
Cohesion: 0.08
Nodes (46): nanoid, useFlowFile(), estimateCost(), catalog, chain(), [cheap, reasoner, free], tokens(), ExecuteFlowParams (+38 more)

### Community 4 - "History & Run Tests"
Cohesion: 0.08
Nodes (37): vitest, HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), CostEstimate, formatUsd() (+29 more)

### Community 5 - "Flow Execution Engine"
Cohesion: 0.07
Nodes (29): applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds() (+21 more)

### Community 6 - "App Shell & Dialogs"
Cohesion: 0.09
Nodes (31): react-hot-toast@^2.4.1, react-hot-toast, App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, KeyStatus() (+23 more)

### Community 7 - "Markdown Output Rendering"
Cohesion: 0.17
Nodes (22): OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components, MarkdownViewProps, textOf() (+14 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, jsdom@^31.0.0, tailwindcss@^3.4.15, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @types/react@^18.3.12, @types/react-dom@^18.3.1, @typescript-eslint/eslint-plugin@^8.15.0 (+10 more)

### Community 10 - "TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+9 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.20
Nodes (12): buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE, perp(), Point (+4 more)

### Community 12 - "CI Workflow"
Cohesion: 0.13
Nodes (14): runs-on, steps, jobs, check, name, on, pull_request, push (+6 more)

### Community 13 - "package.json"
Cohesion: 0.13
Nodes (14): autoprefixer@^10.4.20, eslint@^9.15.0, postcss@^8.4.49, prettier@^3.9.10, typescript@^5.6.3, name, private, type (+6 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "Runtime Dependencies"
Cohesion: 0.15
Nodes (13): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5, zod@^3.23.8 (+5 more)

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "Debounced Storage"
Cohesion: 0.33
Nodes (6): createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "Connection Rules"
Cohesion: 0.36
Nodes (5): canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES, wouldCreateCycle()

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
- **12 isolated node(s):** `PromptFlow project context`, `Verification commands`, `Response style rules`, `Model tiers`, `ui-interactivity-tester agent` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 207 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `History & Run Tests` to `Canvas & React Flow`, `Model Picker UI`, `OpenRouter Client & Providers`, `Templates, Estimates & File IO`, `Flow Execution Engine`, `App Shell & Dialogs`, `Markdown Output Rendering`, `Dev Dependencies`, `Edge Geometry`, `package.json`, `Debounced Storage`, `Connection Rules`, `Vite Build Config`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PromptFlow project context`, `Verification commands`, `Response style rules` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Canvas & React Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.07006172839506172 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Canvas & React Flow` to `Model Picker UI`, `Templates, Estimates & File IO`, `History & Run Tests`, `App Shell & Dialogs`, `Markdown Output Rendering`, `package.json`, `Runtime Dependencies`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Model Picker UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06766917293233082 - nodes in this community are weakly interconnected._
- **Why does `@xyflow/react` connect `Canvas & React Flow` to `Model Picker UI`, `Templates, Estimates & File IO`, `App Shell & Dialogs`, `package.json`, `Runtime Dependencies`, `Connection Rules`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._