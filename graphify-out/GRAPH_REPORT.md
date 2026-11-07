# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 176 files · ~65,329 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 873 nodes · 2582 edges · 52 communities (43 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8417818a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TopBar.tsx
- NodeConfigPanel.tsx
- providers/models.ts
- dependencies
- runStore.ts
- vitest
- App.tsx
- runStore.ts
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- support.ts
- Agent Workflow Rules
- openrouter/models.ts
- ESLint Config
- graphStore.ts
- npm Scripts
- modelStore.ts
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
- useSettingsStore
- ModelPicker.tsx
- flowLibraryStore.ts
- executeFlow.ts
- tailwindcss
- package.json
- @xyflow/react
- useGraphStore
- SettingsModal.tsx
- serialization.ts
- VariablesModal.tsx
- NodeType
- flow.ts
- react
- commands.ts
- EmptyState.tsx
- layout.ts
- connection.ts

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 64 edges
2. `vitest` - 60 edges
3. `useSettingsStore` - 54 edges
4. `useRunStore` - 49 edges
5. `react` - 39 edges
6. `@xyflow/react` - 31 edges
7. `FlowNode` - 30 edges
8. `useModelStore` - 25 edges
9. `NodeType` - 23 edges
10. `@testing-library/react` - 22 edges

## Surprising Connections (you probably didn't know these)
- `applyModels()` --indirect_call--> `isUsableModel()`  [INFERRED]
  src/store/modelStore.ts → src/lib/openrouter/models.ts
- `make()` --calls--> `createNode()`  [EXTRACTED]
  src/lib/report.test.ts → src/lib/nodes.ts
- `chain()` --calls--> `createNode()`  [EXTRACTED]
  src/lib/templates.ts → src/lib/nodes.ts
- `graph()` --calls--> `createNode()`  [EXTRACTED]
  src/lib/templates.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `withFixedWidth()`  [INFERRED]
  src/store/graphStore.ts → src/lib/nodes.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (52 total, 9 thin omitted)

### Community 0 - "TopBar.tsx"
Cohesion: 0.23
Nodes (12): ITEMS, NodePalette(), IconButton(), run, setup(), TopBar(), isTyping(), Shortcuts (+4 more)

### Community 1 - "NodeConfigPanel.tsx"
Cohesion: 0.14
Nodes (20): supportsParam(), useModelInfo(), LLMNode(), FallbackModels(), LlmFields(), NodeConfigPanel(), models, setup() (+12 more)

### Community 2 - "providers/models.ts"
Cohesion: 0.07
Nodes (51): zod@^3.23.8, zod, ApiError, createOpenRouterClient(), GenerateContext, GenerateOptions, GenerateResult, generateText() (+43 more)

### Community 3 - "dependencies"
Cohesion: 0.14
Nodes (15): dependencies, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5, react-dom (+7 more)

### Community 4 - "runStore.ts"
Cohesion: 0.05
Nodes (68): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), GuideModal(), STEPS, OutputModal() (+60 more)

### Community 5 - "vitest"
Cohesion: 0.14
Nodes (12): @testing-library/react, @testing-library/user-event, vitest, props, run, setup(), isTyping(), Host() (+4 more)

### Community 6 - "App.tsx"
Cohesion: 0.19
Nodes (12): App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, VariablesModal, applyTheme(), systemTheme() (+4 more)

### Community 7 - "runStore.ts"
Cohesion: 0.20
Nodes (17): OutputNode(), CostConfirmModal(), run, duration(), KEY_ERRORS, RunLog(), RunSummaryLine(), run (+9 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, jsdom@^31.0.0, @playwright/test@^1.65.0, prettier@^3.9.10, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @types/react-dom@^18.3.1, typescript@^5.6.3 (+11 more)

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
Cohesion: 0.24
Nodes (13): top(), MockOptions, node(), nodeCount(), open(), prepare(), promptsSent(), runButton() (+5 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "openrouter/models.ts"
Cohesion: 0.33
Nodes (6): fetchModels(), isUsableModel(), parseModels(), price(), rawModelSchema, model()

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "graphStore.ts"
Cohesion: 0.18
Nodes (15): ExecuteFlowParams, ParsedFlow, SerializedFlow, FlowTemplate, Clipboard, GraphStore, HISTORY_LIMIT, isCoalesced() (+7 more)

### Community 18 - "npm Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, test, test:e2e (+1 more)

### Community 19 - "modelStore.ts"
Cohesion: 0.20
Nodes (14): PreflightInput, ModelInfo, applyModels(), CacheEntry, cacheKey(), CatalogStatus, FALLBACK_MODELS, MODEL_CACHE_KEY (+6 more)

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
Cohesion: 0.18
Nodes (13): estimateCost(), catalog, chain(), [cheap, reasoner, free], tokens(), catalog, llm(), createNode() (+5 more)

### Community 34 - "useSettingsStore"
Cohesion: 0.17
Nodes (13): CommandPalette(), setup(), useCommands(), detectByPrefix(), resolveTheme(), DEFAULT_COST_THRESHOLD_USD, initialKey, KeyPersistence (+5 more)

### Community 35 - "ModelPicker.tsx"
Cohesion: 0.17
Nodes (18): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+10 more)

### Community 36 - "flowLibraryStore.ts"
Cohesion: 0.11
Nodes (19): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S (+11 more)

### Community 37 - "executeFlow.ts"
Cohesion: 0.06
Nodes (38): CostEstimate, applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getUpstreamNodeIds() (+30 more)

### Community 39 - "package.json"
Cohesion: 0.13
Nodes (14): autoprefixer@^10.4.20, eslint@^9.15.0, postcss@^8.4.49, @types/node@^22.20.5, @types/react@^18.3.12, name, private, type (+6 more)

### Community 40 - "@xyflow/react"
Cohesion: 0.27
Nodes (8): react-hot-toast, @xyflow/react, FlowsModal(), setup(), NODE_KEYWORDS, NODE_TYPES, useFlowFile(), showUndoToast()

### Community 41 - "useGraphStore"
Cohesion: 0.16
Nodes (18): Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, FlowsModal, MINIMAP_COLORS, nodeTypes, InputNode() (+10 more)

### Community 42 - "SettingsModal.tsx"
Cohesion: 0.22
Nodes (10): KeyStatus(), SettingsDialog(), SettingsModal(), Field(), FieldProps, inputClass, labelClass, KeySettings (+2 more)

### Community 43 - "serialization.ts"
Cohesion: 0.20
Nodes (13): cleanVariables(), CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS, nodeSchema, nodeTypeSchema (+5 more)

### Community 44 - "VariablesModal.tsx"
Cohesion: 0.34
Nodes (10): VariablesDialog(), VariablesModal(), preflight(), findFlowVariables(), missingVariables(), nodeTexts(), RESERVED, at (+2 more)

### Community 45 - "NodeType"
Cohesion: 0.13
Nodes (17): nanoid@^5.0.9, nanoid, NodeShellProps, findCycleNodeIds(), canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES (+9 more)

### Community 46 - "flow.ts"
Cohesion: 0.18
Nodes (11): MERGE_SEPARATORS, MergePart, SEPARATORS, BaseData, FlowEdgeType, InputData, MergeData, MergeSeparator (+3 more)

### Community 47 - "react"
Cohesion: 0.29
Nodes (8): react, MergeNode(), setup(), FALLBACK_SIZE, useViewActions(), isTyping(), useViewShortcuts(), tidyPositions()

### Community 48 - "commands.ts"
Cohesion: 0.31
Nodes (6): Command, CommandGroup, filterCommands(), GROUP_ORDER, score(), all

### Community 49 - "EmptyState.tsx"
Cohesion: 0.52
Nodes (4): EmptyState(), Step(), setup(), Logo()

### Community 50 - "layout.ts"
Cohesion: 0.33
Nodes (4): LayoutEdge, LayoutNode, Options, Position

### Community 51 - "connection.ts"
Cohesion: 0.48
Nodes (4): identifyKey(), connectKey(), pickDefault(), remapUnavailableModels()

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 260 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `TopBar.tsx`, `NodeConfigPanel.tsx`, `providers/models.ts`, `runStore.ts`, `App.tsx`, `runStore.ts`, `devDependencies`, `Edge Geometry`, `openrouter/models.ts`, `graphStore.ts`, `modelStore.ts`, `@vitejs/plugin-react`, `nodes.ts`, `useSettingsStore`, `ModelPicker.tsx`, `flowLibraryStore.ts`, `executeFlow.ts`, `package.json`, `@xyflow/react`, `useGraphStore`, `SettingsModal.tsx`, `serialization.ts`, `VariablesModal.tsx`, `NodeType`, `react`, `commands.ts`, `EmptyState.tsx`, `layout.ts`, `connection.ts`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NodeConfigPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13756613756613756 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `TopBar.tsx`, `NodeConfigPanel.tsx`, `useSettingsStore`, `dependencies`, `runStore.ts`, `ModelPicker.tsx`, `App.tsx`, `package.json`, `@xyflow/react`, `useGraphStore`, `vitest`, `Edge Geometry`, `runStore.ts`, `SettingsModal.tsx`, `VariablesModal.tsx`, `EmptyState.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `providers/models.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06680080482897384 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `support.ts` to `devDependencies`, `package.json`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._