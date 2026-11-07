# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 149 files · ~51,533 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 743 nodes · 2089 edges · 35 communities (27 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c78586f4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- graphStore.ts
- ModelPicker.tsx
- OpenRouter Client & Providers
- dependencies
- History & Run Tests
- executeFlow.ts
- runStore.ts
- Markdown Output Rendering
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- package.json
- Agent Workflow Rules
- App.tsx
- ESLint Config
- commands.ts
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
- layout.ts
- viewport.ts

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 51 edges
2. `vitest` - 50 edges
3. `useSettingsStore` - 46 edges
4. `useRunStore` - 40 edges
5. `react` - 32 edges
6. `@xyflow/react` - 27 edges
7. `useModelStore` - 25 edges
8. `FlowNode` - 24 edges
9. `NodeType` - 21 edges
10. `Icon()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `setup()` --calls--> `OutputNode()`  [EXTRACTED]
  src/components/nodes/OutputNode.test.tsx → src/components/nodes/OutputNode.tsx
- `setup()` --calls--> `CommandPalette()`  [EXTRACTED]
  src/components/palette/CommandPalette.test.tsx → src/components/palette/CommandPalette.tsx
- `setup()` --calls--> `TopBar()`  [EXTRACTED]
  src/components/topbar/TopBar.test.tsx → src/components/topbar/TopBar.tsx
- `setup()` --calls--> `NodeShell()`  [EXTRACTED]
  src/components/ui/NodeShell.test.tsx → src/components/ui/NodeShell.tsx
- `llm()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/preflight.test.ts → src/lib/nodes.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (35 total, 8 thin omitted)

### Community 0 - "graphStore.ts"
Cohesion: 0.06
Nodes (77): react, react-hot-toast, @xyflow/react, Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, MINIMAP_COLORS (+69 more)

### Community 1 - "ModelPicker.tsx"
Cohesion: 0.06
Nodes (62): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+54 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.11
Nodes (33): zod@^3.23.8, zod, OPENROUTER_BASE_URL, KeyInfo, KeyRejectedError, keySchema, verifyKey(), fetchModels() (+25 more)

### Community 3 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5 (+4 more)

### Community 4 - "History & Run Tests"
Cohesion: 0.08
Nodes (30): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), GuideModal(), STEPS, RunSummaryLine() (+22 more)

### Community 5 - "executeFlow.ts"
Cohesion: 0.05
Nodes (49): applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds() (+41 more)

### Community 6 - "runStore.ts"
Cohesion: 0.05
Nodes (50): zustand@^5.0.2, @testing-library/react, @testing-library/user-event, vitest, zustand, props, run, setup() (+42 more)

### Community 7 - "Markdown Output Rendering"
Cohesion: 0.17
Nodes (22): OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components, MarkdownViewProps, textOf() (+14 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer@^10.4.20, eslint@^9.15.0, jsdom@^31.0.0, tailwindcss@^3.4.15, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, typescript@^5.6.3 (+10 more)

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
Nodes (14): postcss@^8.4.49, prettier@^3.9.10, @types/react@^18.3.12, @types/react-dom@^18.3.1, @typescript-eslint/parser@^8.15.0, name, private, type (+6 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "App.tsx"
Cohesion: 0.39
Nodes (6): App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, syncModels()

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "commands.ts"
Cohesion: 0.31
Nodes (6): Command, CommandGroup, filterCommands(), GROUP_ORDER, score(), all

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "graphStore.ts"
Cohesion: 0.08
Nodes (34): estimateCost(), catalog, chain(), [cheap, reasoner, free], tokens(), ExecuteFlowParams, createNode(), OUTPUT_NODE_SIZE (+26 more)

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

### Community 33 - "layout.ts"
Cohesion: 0.32
Nodes (5): LayoutEdge, LayoutNode, Options, Position, tidyPositions()

### Community 34 - "viewport.ts"
Cohesion: 0.33
Nodes (4): Box, container, desktopPanel, Viewport

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 229 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `runStore.ts` to `graphStore.ts`, `ModelPicker.tsx`, `layout.ts`, `OpenRouter Client & Providers`, `History & Run Tests`, `executeFlow.ts`, `viewport.ts`, `Markdown Output Rendering`, `devDependencies`, `Edge Geometry`, `package.json`, `commands.ts`, `graphStore.ts`, `@vitejs/plugin-react`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `graphStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05945945945945946 - nodes in this community are weakly interconnected._
- **Why does `react` connect `graphStore.ts` to `ModelPicker.tsx`, `dependencies`, `History & Run Tests`, `runStore.ts`, `Markdown Output Rendering`, `package.json`, `App.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `ModelPicker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05917602996254682 - nodes in this community are weakly interconnected._
- **Why does `@xyflow/react` connect `graphStore.ts` to `ModelPicker.tsx`, `dependencies`, `runStore.ts`, `package.json`, `App.tsx`, `graphStore.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._