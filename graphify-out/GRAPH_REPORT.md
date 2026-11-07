# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 179 files · ~66,022 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 881 nodes · 2600 edges · 58 communities (44 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `01e79f31`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- report.ts
- useSettingsStore
- providers/models.ts
- dependencies
- HistoryModal.tsx
- Canvas.tsx
- App.tsx
- runStore.ts
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- support.ts
- Agent Workflow Rules
- vitest
- ESLint Config
- graphStore.ts
- npm Scripts
- OutputPreview.tsx
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
- nodes.ts
- format.ts
- modelStore.ts
- settingsStore.ts
- executeFlow.ts
- tailwindcss
- package.json
- flowLibraryStore.ts
- markdown.ts
- Modal
- serialization.ts
- variables.ts
- connections.ts
- flow.ts
- estimate.test.ts
- commands.ts
- executeFlow.engine.test.ts
- useViewActions.ts
- layout.ts
- @types/node@^22.20.5
- useEditShortcuts.test.tsx
- TopBar
- eslint@^9.15.0
- jsdom@^31.0.0

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 64 edges
2. `vitest` - 61 edges
3. `useSettingsStore` - 54 edges
4. `useRunStore` - 49 edges
5. `react` - 39 edges
6. `@xyflow/react` - 31 edges
7. `FlowNode` - 30 edges
8. `useModelStore` - 25 edges
9. `NodeType` - 23 edges
10. `Icon()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `NodeRef` --references--> `NodeType`  [EXTRACTED]
  src/lib/connections.ts → src/types/flow.ts
- `LoadOptions` --references--> `ProviderId`  [EXTRACTED]
  src/store/modelStore.ts → src/lib/providers/types.ts
- `setup()` --calls--> `NodeConfigPanel()`  [EXTRACTED]
  src/components/panels/NodeConfigPanel.test.tsx → src/components/panels/NodeConfigPanel.tsx
- `setupMerge()` --calls--> `NodeConfigPanel()`  [EXTRACTED]
  src/components/panels/NodeConfigPanel.test.tsx → src/components/panels/NodeConfigPanel.tsx
- `chain()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/estimate.test.ts → src/lib/nodes.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (58 total, 14 thin omitted)

### Community 0 - "report.ts"
Cohesion: 0.18
Nodes (16): useRunReport(), buildRunReport(), hasReport(), label(), OUTCOME, ReportDocument, reportFilename(), ReportInput (+8 more)

### Community 1 - "useSettingsStore"
Cohesion: 0.17
Nodes (14): react-hot-toast, @testing-library/react, @testing-library/user-event, @xyflow/react, FlowsModal(), setup(), CommandPalette(), setup() (+6 more)

### Community 2 - "providers/models.ts"
Cohesion: 0.07
Nodes (51): zod, ApiError, createOpenRouterClient(), GenerateContext, GenerateOptions, GenerateResult, generateText(), OPENROUTER_BASE_URL (+43 more)

### Community 3 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, @xyflow/react@^12.3.5, zod@^3.23.8, react-dom (+1 more)

### Community 4 - "HistoryModal.tsx"
Cohesion: 0.21
Nodes (15): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), buildHistoryReport(), entryResult(), HISTORY_STORAGE_KEY (+7 more)

### Community 5 - "Canvas.tsx"
Cohesion: 0.16
Nodes (15): Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, FlowsModal, MINIMAP_COLORS, nodeTypes, PANEL_WIDTH_PX (+7 more)

### Community 6 - "App.tsx"
Cohesion: 0.18
Nodes (13): App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, VariablesModal, applyTheme(), resolveTheme() (+5 more)

### Community 7 - "runStore.ts"
Cohesion: 0.07
Nodes (66): react, ModelPicker(), supportsParam(), useModelInfo(), LLMNode(), MergeNode(), setup(), OutputNode() (+58 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @playwright/test@^1.65.0, prettier@^3.9.10, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @types/react@^18.3.12, @types/react-dom@^18.3.1, @typescript-eslint/eslint-plugin@^8.15.0 (+7 more)

### Community 10 - "TS Node Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.19
Nodes (14): CurvedEdge(), bendForOffset(), buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE (+6 more)

### Community 12 - "CI Workflow"
Cohesion: 0.10
Nodes (21): runs-on, steps, runs-on, steps, jobs, check, e2e, name (+13 more)

### Community 13 - "support.ts"
Cohesion: 0.19
Nodes (14): Pt, top(), MockOptions, node(), nodeCount(), open(), prepare(), promptsSent() (+6 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "vitest"
Cohesion: 0.28
Nodes (4): vitest, DiffLine, diffLines(), hasChanges()

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "graphStore.ts"
Cohesion: 0.22
Nodes (12): InputNode(), PromptNode(), EmptyState(), Step(), setup(), Logo(), cleanVariables(), normalizeEdges() (+4 more)

### Community 18 - "npm Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, test, test:e2e (+1 more)

### Community 19 - "OutputPreview.tsx"
Cohesion: 0.20
Nodes (16): remark-gfm@^4.0.1, remark-gfm, OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components (+8 more)

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

### Community 33 - "nodes.ts"
Cohesion: 0.22
Nodes (13): nanoid@^5.0.9, nanoid, llm(), createNode(), FIXED_NODE_WIDTH, LLM_NODE_WIDTH, OUTPUT_NODE_SIZE, withFixedWidth() (+5 more)

### Community 34 - "format.ts"
Cohesion: 0.33
Nodes (9): RunSummaryLine(), formatUsd(), compact(), formatAgo(), formatRunSummary(), formatUsage(), RunTotals, renderReport() (+1 more)

### Community 35 - "modelStore.ts"
Cohesion: 0.06
Nodes (53): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+45 more)

### Community 36 - "settingsStore.ts"
Cohesion: 0.17
Nodes (11): run, FLOW_STORAGE_KEY, API_KEY_STORAGE_KEY, DEFAULT_COST_THRESHOLD_USD, initialKey, KeyPersistence, KeyStatus, readStoredKey() (+3 more)

### Community 37 - "executeFlow.ts"
Cohesion: 0.08
Nodes (29): applyTemplate(), canFallBack(), executeFlow(), runNode(), FlowExecutionResult, getUpstreamNodeIds(), resolveNodeInput(), RunnerContext (+21 more)

### Community 39 - "package.json"
Cohesion: 0.15
Nodes (12): autoprefixer@^10.4.20, postcss@^8.4.49, typescript@^5.6.3, @typescript-eslint/parser@^8.15.0, name, private, type, version (+4 more)

### Community 40 - "flowLibraryStore.ts"
Cohesion: 0.13
Nodes (18): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S (+10 more)

### Community 41 - "markdown.ts"
Cohesion: 0.39
Nodes (10): looksLikeJson(), demoteHeadings(), firstHeading(), normalizeMarkdown(), OutputFile, outputFile(), segments(), slugify() (+2 more)

### Community 42 - "Modal"
Cohesion: 0.31
Nodes (5): GuideModal(), STEPS, Modal(), ModalProps, EXIT_MS

### Community 43 - "serialization.ts"
Cohesion: 0.16
Nodes (19): ExecuteFlowParams, CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS, nodeSchema, nodeTypeSchema (+11 more)

### Community 44 - "variables.ts"
Cohesion: 0.20
Nodes (14): preflight(), PreflightIssue, catalog, findCycleNodeIds(), ErrorKind, TEMPLATES, findFlowVariables(), missingVariables() (+6 more)

### Community 45 - "connections.ts"
Cohesion: 0.36
Nodes (5): canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES, wouldCreateCycle()

### Community 46 - "flow.ts"
Cohesion: 0.16
Nodes (12): MergePart, SEPARATORS, BaseData, EdgeData, FlowEdgeType, FlowState, InputData, MergeData (+4 more)

### Community 47 - "estimate.test.ts"
Cohesion: 0.32
Nodes (5): estimateCost(), catalog, chain(), [cheap, reasoner, free], tokens()

### Community 48 - "commands.ts"
Cohesion: 0.31
Nodes (6): Command, CommandGroup, filterCommands(), GROUP_ORDER, score(), all

### Community 50 - "useViewActions.ts"
Cohesion: 0.48
Nodes (5): FALLBACK_SIZE, useViewActions(), isTyping(), useViewShortcuts(), tidyPositions()

### Community 51 - "layout.ts"
Cohesion: 0.33
Nodes (4): LayoutEdge, LayoutNode, Options, Position

### Community 53 - "useEditShortcuts.test.tsx"
Cohesion: 0.53
Nodes (3): isTyping(), Host(), useEditShortcuts()

### Community 54 - "TopBar"
Cohesion: 0.67
Nodes (3): run, setup(), TopBar()

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 264 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `report.ts`, `useSettingsStore`, `providers/models.ts`, `HistoryModal.tsx`, `Canvas.tsx`, `App.tsx`, `runStore.ts`, `devDependencies`, `Edge Geometry`, `graphStore.ts`, `@vitejs/plugin-react`, `nodes.ts`, `format.ts`, `modelStore.ts`, `settingsStore.ts`, `executeFlow.ts`, `package.json`, `flowLibraryStore.ts`, `markdown.ts`, `Modal`, `serialization.ts`, `variables.ts`, `connections.ts`, `estimate.test.ts`, `commands.ts`, `executeFlow.engine.test.ts`, `layout.ts`, `useEditShortcuts.test.tsx`, `TopBar`, `graphStore.test.ts`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `providers/models.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06881287726358148 - nodes in this community are weakly interconnected._
- **Why does `react` connect `runStore.ts` to `report.ts`, `useSettingsStore`, `format.ts`, `dependencies`, `HistoryModal.tsx`, `Canvas.tsx`, `App.tsx`, `package.json`, `modelStore.ts`, `Modal`, `Edge Geometry`, `graphStore.ts`, `useViewActions.ts`, `OutputPreview.tsx`, `useEditShortcuts.test.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `runStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0654562828475872 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `support.ts` to `devDependencies`, `package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._