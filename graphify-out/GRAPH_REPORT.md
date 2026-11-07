# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 184 files · ~68,111 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 903 nodes · 2655 edges · 67 communities (56 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e31c2389`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- report.ts
- react
- providers/models.ts
- dependencies
- HistoryModal.tsx
- Canvas.tsx
- settingsStore.ts
- runStore.ts
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- support.ts
- Agent Workflow Rules
- HistoryModal.tsx
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
- openrouter/models.ts
- EmptyState.tsx
- retry.ts
- tailwindcss
- package.json
- flowLibraryStore.ts
- connection.ts
- Modal
- flow.ts
- variables.ts
- connections.ts
- NodeConfigPanel.tsx
- estimate.test.ts
- commands.ts
- executeFlow.ts
- openrouter/client.ts
- layout.ts
- serialization.ts
- @testing-library/react
- viewport.ts
- markdown.ts
- openrouter/index.ts
- modelStore.ts
- useGraphStore
- executeFlow.engine.test.ts
- client.test.ts
- FlowNode
- useViewActions.ts
- errors.ts
- resolveApiKey
- autoprefixer@^10.4.20
- jsdom@^31.0.0

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 64 edges
2. `vitest` - 63 edges
3. `useSettingsStore` - 54 edges
4. `useRunStore` - 49 edges
5. `react` - 39 edges
6. `@xyflow/react` - 31 edges
7. `FlowNode` - 30 edges
8. `useModelStore` - 25 edges
9. `NodeShell()` - 24 edges
10. `@testing-library/react` - 24 edges

## Surprising Connections (you probably didn't know these)
- `CacheEntry` --references--> `ModelInfo`  [EXTRACTED]
  src/store/modelStore.ts → src/lib/openrouter/models.ts
- `NodeRef` --references--> `NodeType`  [EXTRACTED]
  src/lib/connections.ts → src/types/flow.ts
- `make()` --calls--> `createNode()`  [EXTRACTED]
  src/lib/report.test.ts → src/lib/nodes.ts
- `setup()` --calls--> `TopBar()`  [EXTRACTED]
  src/components/topbar/TopBar.test.tsx → src/components/topbar/TopBar.tsx
- `chain()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/estimate.test.ts → src/lib/nodes.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (67 total, 11 thin omitted)

### Community 0 - "report.ts"
Cohesion: 0.15
Nodes (18): useRunReport(), CostEstimate, buildRunReport(), hasReport(), label(), OUTCOME, ReportDocument, reportFilename() (+10 more)

### Community 1 - "react"
Cohesion: 0.17
Nodes (18): react, ITEMS, NodePalette(), IconButton(), TopBar(), isTyping(), Shortcuts, useShortcuts() (+10 more)

### Community 2 - "providers/models.ts"
Cohesion: 0.20
Nodes (16): zod@^3.23.8, zod, keySchema, verifyKey(), base(), getJson(), ListModelsError, listProviderModels() (+8 more)

### Community 3 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, react@^18.3.1, react-dom@^18.3.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5, zustand@^5.0.2, react-dom (+3 more)

### Community 4 - "HistoryModal.tsx"
Cohesion: 0.18
Nodes (10): vitest, HISTORY_STORAGE_KEY, HistoryEntry, HistoryNode, HistoryStore, MAX_HISTORY_ENTRIES, MAX_OUTPUT_CHARS, safeStorage (+2 more)

### Community 5 - "Canvas.tsx"
Cohesion: 0.16
Nodes (15): Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, FlowsModal, MINIMAP_COLORS, nodeTypes, CurvedEdge() (+7 more)

### Community 6 - "settingsStore.ts"
Cohesion: 0.07
Nodes (38): App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, VariablesModal, KeyStatus(), SettingsDialog() (+30 more)

### Community 7 - "runStore.ts"
Cohesion: 0.22
Nodes (17): OutputNode(), props, run, setup(), duration(), KEY_ERRORS, RunLog(), RunSummaryLine() (+9 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, eslint@^9.15.0, @playwright/test@^1.65.0, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @types/node@^22.20.5, typescript@^5.6.3, @typescript-eslint/eslint-plugin@^8.15.0 (+9 more)

### Community 10 - "TS Node Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.20
Nodes (12): buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE, perp(), Point (+4 more)

### Community 12 - "CI Workflow"
Cohesion: 0.10
Nodes (21): runs-on, steps, runs-on, steps, jobs, check, e2e, name (+13 more)

### Community 13 - "support.ts"
Cohesion: 0.16
Nodes (18): Pt, top(), captionsAreOneLine(), dragCorner(), size(), TYPES, MockOptions, node() (+10 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "HistoryModal.tsx"
Cohesion: 0.27
Nodes (10): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), DiffLine, diffLines(), hasChanges() (+2 more)

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "graphStore.ts"
Cohesion: 0.21
Nodes (13): @xyflow/react, InputNode(), MergeNode(), setup(), PromptNode(), NodeShell(), bodyFontSize(), setup() (+5 more)

### Community 18 - "npm Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, test, test:e2e (+1 more)

### Community 19 - "OutputPreview.tsx"
Cohesion: 0.22
Nodes (14): OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components, MarkdownViewProps, textOf() (+6 more)

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
Nodes (15): nanoid@^5.0.9, nanoid, catalog, llm(), createNode(), FIXED_NODE_WIDTH, LLM_NODE_WIDTH, NODE_LABELS (+7 more)

### Community 34 - "format.ts"
Cohesion: 0.44
Nodes (7): formatUsd(), compact(), formatAgo(), formatRunSummary(), formatUsage(), RunTotals, renderReport()

### Community 35 - "openrouter/models.ts"
Cohesion: 0.20
Nodes (15): ModelBadges(), ModelDetails(), Row(), fetchModels(), formatContext(), formatPrice(), isExpiringSoon(), isFree() (+7 more)

### Community 36 - "EmptyState.tsx"
Cohesion: 0.52
Nodes (4): EmptyState(), Step(), setup(), Logo()

### Community 37 - "retry.ts"
Cohesion: 0.26
Nodes (6): withTimeout(), isRetryable(), retryAfterMs(), opts, withRetry(), TimeoutError

### Community 39 - "package.json"
Cohesion: 0.15
Nodes (12): postcss@^8.4.49, prettier@^3.9.10, @types/react@^18.3.12, @types/react-dom@^18.3.1, name, private, type, version (+4 more)

### Community 40 - "flowLibraryStore.ts"
Cohesion: 0.15
Nodes (13): createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S, cleanName(), FLOW_LIBRARY_STORAGE_KEY (+5 more)

### Community 41 - "connection.ts"
Cohesion: 0.14
Nodes (17): KeyInfo, KeyRejectedError, createProviderClient(), Identified, identifyKey(), ListedModels, detectByPrefix(), PREFIX_ORDER (+9 more)

### Community 42 - "Modal"
Cohesion: 0.23
Nodes (9): GuideModal(), STEPS, CostConfirmModal(), run, Modal(), ModalProps, EXIT_MS, prefersReducedMotion() (+1 more)

### Community 43 - "flow.ts"
Cohesion: 0.16
Nodes (13): MergePart, SEPARATORS, GraphStore, BaseData, EdgeData, FlowEdgeType, FlowState, InputData (+5 more)

### Community 44 - "variables.ts"
Cohesion: 0.21
Nodes (14): VariablesDialog(), VariablesModal(), preflight(), findCycleNodeIds(), TopoEdge, TEMPLATES, findFlowVariables(), missingVariables() (+6 more)

### Community 45 - "connections.ts"
Cohesion: 0.36
Nodes (5): canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES, wouldCreateCycle()

### Community 46 - "NodeConfigPanel.tsx"
Cohesion: 0.19
Nodes (18): supportsParam(), useModelInfo(), LLMNode(), FallbackModels(), LlmFields(), NodeConfigPanel(), Field(), FieldProps (+10 more)

### Community 47 - "estimate.test.ts"
Cohesion: 0.32
Nodes (5): estimateCost(), catalog, chain(), [cheap, reasoner, free], tokens()

### Community 48 - "commands.ts"
Cohesion: 0.31
Nodes (6): Command, CommandGroup, filterCommands(), GROUP_ORDER, score(), all

### Community 49 - "executeFlow.ts"
Cohesion: 0.16
Nodes (15): applyTemplate(), executeFlow(), runNode(), ExecuteFlowParams, FlowExecutionResult, getUpstreamNodeIds(), resolveNodeInput(), RunnerContext (+7 more)

### Community 50 - "openrouter/client.ts"
Cohesion: 0.27
Nodes (16): GenerateContext, GenerateOptions, GenerateResult, generateText(), OpenRouterClient, ProviderClient, readSse(), StreamChunk (+8 more)

### Community 51 - "layout.ts"
Cohesion: 0.33
Nodes (4): LayoutEdge, LayoutNode, Options, Position

### Community 52 - "serialization.ts"
Cohesion: 0.17
Nodes (18): cleanVariables(), CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS, nodeSchema, nodeTypeSchema (+10 more)

### Community 53 - "@testing-library/react"
Cohesion: 0.18
Nodes (7): @testing-library/react, @testing-library/user-event, CommandPalette(), setup(), run, setup(), run

### Community 54 - "viewport.ts"
Cohesion: 0.33
Nodes (4): Box, container, desktopPanel, Viewport

### Community 55 - "markdown.ts"
Cohesion: 0.29
Nodes (12): extractJson(), looksLikeJson(), demoteHeadings(), firstHeading(), normalizeMarkdown(), OutputFile, outputFile(), segments() (+4 more)

### Community 56 - "openrouter/index.ts"
Cohesion: 0.19
Nodes (13): DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey, models, ModelPicker(), ModelPickerProps (+5 more)

### Community 57 - "modelStore.ts"
Cohesion: 0.16
Nodes (14): models, setup(), setupMerge(), applyModels(), CacheEntry, cacheKey(), CatalogStatus, FALLBACK_MODELS (+6 more)

### Community 58 - "useGraphStore"
Cohesion: 0.26
Nodes (10): react-hot-toast@^2.4.1, react-hot-toast, FlowsModal(), setup(), NODE_KEYWORDS, NODE_TYPES, useCommands(), useFlowFile() (+2 more)

### Community 59 - "executeFlow.engine.test.ts"
Cohesion: 0.14
Nodes (8): fast, getDownstreamIds(), LlmRunner, NodeStatusUpdate, PreflightIssue, ErrorKind, RunSummary, NodeStatus

### Community 60 - "client.test.ts"
Cohesion: 0.18
Nodes (6): ApiError, createOpenRouterClient(), OPENROUTER_BASE_URL, client, data(), delta()

### Community 61 - "FlowNode"
Cohesion: 0.25
Nodes (4): FlowTemplate, Clipboard, Snapshot, FlowNode

### Community 62 - "useViewActions.ts"
Cohesion: 0.48
Nodes (5): FALLBACK_SIZE, useViewActions(), isTyping(), useViewShortcuts(), tidyPositions()

### Community 63 - "errors.ts"
Cohesion: 0.43
Nodes (4): canFallBack(), ClassifiedError, classifyError(), redactSecrets()

### Community 64 - "resolveApiKey"
Cohesion: 0.60
Nodes (3): KeySettings, maskKey(), resolveApiKey()

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 269 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `HistoryModal.tsx` to `report.ts`, `react`, `providers/models.ts`, `Canvas.tsx`, `settingsStore.ts`, `runStore.ts`, `devDependencies`, `Edge Geometry`, `HistoryModal.tsx`, `graphStore.ts`, `OutputPreview.tsx`, `@vitejs/plugin-react`, `nodes.ts`, `format.ts`, `openrouter/models.ts`, `EmptyState.tsx`, `retry.ts`, `package.json`, `flowLibraryStore.ts`, `connection.ts`, `Modal`, `variables.ts`, `connections.ts`, `estimate.test.ts`, `commands.ts`, `executeFlow.ts`, `layout.ts`, `serialization.ts`, `@testing-library/react`, `viewport.ts`, `markdown.ts`, `openrouter/index.ts`, `modelStore.ts`, `useGraphStore`, `executeFlow.engine.test.ts`, `client.test.ts`, `FlowNode`, `errors.ts`, `resolveApiKey`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `settingsStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07039187227866474 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `support.ts` to `devDependencies`, `package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `TS App Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `report.ts`, `dependencies`, `EmptyState.tsx`, `Canvas.tsx`, `settingsStore.ts`, `package.json`, `runStore.ts`, `Modal`, `variables.ts`, `NodeConfigPanel.tsx`, `HistoryModal.tsx`, `graphStore.ts`, `OutputPreview.tsx`, `@testing-library/react`, `openrouter/index.ts`, `useGraphStore`, `useViewActions.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._