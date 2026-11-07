# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 184 files · ~69,081 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 956 nodes · 2620 edges · 72 communities (47 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e7d5d38`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- report.ts
- openrouter/client.ts
- runStore.ts
- executeFlow.ts
- serialization.ts
- Canvas.tsx
- FlowNode
- modelStore.ts
- useGraphStore
- devDependencies
- providers/models.ts
- graphStore.ts
- settingsStore.ts
- support.ts
- vitest
- HistoryModal.tsx
- ESLint Config
- openrouter/index.ts
- merge.ts
- OutputPreview.tsx
- opencode Config
- types.ts
- useCommands.ts
- openrouter/models.ts
- Modal
- NodeConfigPanel.tsx
- package.json
- ModelInfo
- flowLibraryStore.ts
- Verification Commands
- Misc 30
- Misc 31
- Misc 32
- postcss@^8.4.49
- openrouter/models.ts
- retry.ts
- package.json
- react
- flow.ts
- useRevealSelected.ts
- connections.ts
- NodeConfigPanel.tsx
- estimate.test.ts
- executeFlow.ts
- openrouter/client.ts
- @vitejs/plugin-react
- @testing-library/react
- viewport.ts
- markdown.ts
- openrouter/index.ts
- modelStore.ts
- useGraphStore
- executeFlow.engine.test.ts
- client.test.ts
- FlowNode
- errors.ts
- resolveApiKey
- jsdom@^31.0.0
- Concise response style
- Accessibility
- Undo, redo and Tidy layout
- Live results and retry
- src directory layout
- Six providers
- Quick start
- Markdown reports
- Saved flows
- Variables
- Selling points

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 64 edges
2. `vitest` - 63 edges
3. `useSettingsStore` - 53 edges
4. `useRunStore` - 46 edges
5. `react` - 39 edges
6. `@xyflow/react` - 31 edges
7. `FlowNode` - 30 edges
8. `NodeShell()` - 25 edges
9. `@testing-library/react` - 24 edges
10. `NodeType` - 23 edges

## Surprising Connections (you probably didn't know these)
- `NodeRef` --references--> `NodeType`  [EXTRACTED]
  src/lib/connections.ts → src/types/flow.ts
- `PreflightInput` --references--> `FlowNode`  [EXTRACTED]
  src/engine/preflight.ts → src/types/flow.ts
- `chain()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/estimate.test.ts → src/lib/nodes.ts
- `make()` --calls--> `createNode()`  [EXTRACTED]
  src/lib/report.test.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `withFixedWidth()`  [INFERRED]
  src/store/graphStore.ts → src/lib/nodes.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent working rules** — agents_planning_mode, agents_change_edit_mode, agents_response_style [INFERRED 0.75]
- **Flow building blocks** — readme_node_types, readme_branch_merge, readme_variables, readme_live_results [INFERRED 0.75]

## Communities (72 total, 25 thin omitted)

### Community 0 - "report.ts"
Cohesion: 0.05
Nodes (64): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), OutputModal(), OutputModalProps, useRunReport() (+56 more)

### Community 1 - "openrouter/client.ts"
Cohesion: 0.08
Nodes (32): isRetryable(), retryAfterMs(), RetryOptions, opts, withRetry(), ApiError, createOpenRouterClient(), GenerateContext (+24 more)

### Community 2 - "runStore.ts"
Cohesion: 0.16
Nodes (18): CostConfirmModal(), run, duration(), KEY_ERRORS, RunLog(), RunSummaryLine(), run, useRunAction() (+10 more)

### Community 3 - "executeFlow.ts"
Cohesion: 0.09
Nodes (15): applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds() (+7 more)

### Community 4 - "serialization.ts"
Cohesion: 0.20
Nodes (13): cleanVariables(), CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS, nodeSchema, nodeTypeSchema (+5 more)

### Community 5 - "Canvas.tsx"
Cohesion: 0.16
Nodes (19): Pt, top(), captionsAreOneLine(), dragCorner(), size(), TYPES, MockOptions, node() (+11 more)

### Community 6 - "FlowNode"
Cohesion: 0.19
Nodes (12): ExecuteFlowParams, ParsedFlow, SerializedFlow, FlowTemplate, Clipboard, GraphStore, Snapshot, EdgeData (+4 more)

### Community 7 - "modelStore.ts"
Cohesion: 0.14
Nodes (18): models, KeyStatus(), SettingsDialog(), SettingsModal(), connectKey(), pickDefault(), remapUnavailableModels(), syncModels() (+10 more)

### Community 8 - "useGraphStore"
Cohesion: 0.22
Nodes (19): @xyflow/react, Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, FlowsModal, MINIMAP_COLORS, nodeTypes (+11 more)

### Community 9 - "devDependencies"
Cohesion: 0.10
Nodes (21): runs-on, steps, runs-on, steps, jobs, check, e2e, name (+13 more)

### Community 10 - "providers/models.ts"
Cohesion: 0.19
Nodes (17): zod, OPENROUTER_BASE_URL, KeyRejectedError, keySchema, verifyKey(), base(), getJson(), ListModelsError (+9 more)

### Community 11 - "graphStore.ts"
Cohesion: 0.16
Nodes (13): @testing-library/react, @testing-library/user-event, props, run, setup(), bodyFontSize(), setup(), isTyping() (+5 more)

### Community 12 - "settingsStore.ts"
Cohesion: 0.16
Nodes (10): EmptyState(), Step(), setup(), DEFAULT_COST_THRESHOLD_USD, initialKey, KeyPersistence, KeyStatus, readStoredKey() (+2 more)

### Community 13 - "support.ts"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 14 - "vitest"
Cohesion: 0.07
Nodes (23): vitest, Command, CommandGroup, filterCommands(), GROUP_ORDER, score(), all, findCycleNodeIds() (+15 more)

### Community 15 - "HistoryModal.tsx"
Cohesion: 0.15
Nodes (18): NodeShellProps, catalog, llm(), createNode(), FIXED_NODE_WIDTH, LLM_NODE_WIDTH, NODE_LABELS, OUTPUT_NODE_SIZE (+10 more)

### Community 16 - "ESLint Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 17 - "openrouter/index.ts"
Cohesion: 0.23
Nodes (11): DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey, models, ModelPicker(), ModelPickerProps (+3 more)

### Community 18 - "merge.ts"
Cohesion: 0.15
Nodes (14): MERGE_SEPARATORS, MergePart, mergeTexts(), SEPARATORS, separatorText(), parts, BaseData, FlowEdgeType (+6 more)

### Community 19 - "OutputPreview.tsx"
Cohesion: 0.12
Nodes (17): devDependencies, jsdom@^31.0.0, @playwright/test@^1.65.0, prettier@^3.9.10, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @types/node@^22.20.5, @types/react@^18.3.12 (+9 more)

### Community 20 - "opencode Config"
Cohesion: 0.19
Nodes (13): bendForOffset(), buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE, perp() (+5 more)

### Community 21 - "types.ts"
Cohesion: 0.20
Nodes (13): KeyInfo, createProviderClient(), Identified, identifyKey(), ListedModels, detectByPrefix(), PREFIX_ORDER, PROBE_ORDER (+5 more)

### Community 22 - "useCommands.ts"
Cohesion: 0.26
Nodes (8): react-hot-toast, FlowsModal(), setup(), NODE_KEYWORDS, NODE_TYPES, useCommands(), useFlowFile(), showUndoToast()

### Community 23 - "openrouter/models.ts"
Cohesion: 0.26
Nodes (8): fetchModels(), isUsableModel(), parseModels(), price(), rawModelSchema, buildRequestParams(), RequestParams, model()

### Community 24 - "Modal"
Cohesion: 0.23
Nodes (8): CommandPalette(), setup(), CloseIcon(), Modal(), ModalProps, EXIT_MS, prefersReducedMotion(), useExitAnimation()

### Community 25 - "NodeConfigPanel.tsx"
Cohesion: 0.08
Nodes (32): supportsParam(), useModelInfo(), FallbackModels(), LlmFields(), NodeConfigPanel(), models, setup(), setupMerge() (+24 more)

### Community 26 - "package.json"
Cohesion: 0.14
Nodes (13): autoprefixer@^10.4.20, typescript@^5.6.3, @typescript-eslint/eslint-plugin@^8.15.0, @typescript-eslint/parser@^8.15.0, license, name, private, type (+5 more)

### Community 27 - "ModelInfo"
Cohesion: 0.44
Nodes (8): ModelBadges(), ModelDetails(), Row(), formatContext(), formatPrice(), isExpiringSoon(), ModelInfo, CacheEntry

### Community 28 - "flowLibraryStore.ts"
Cohesion: 0.07
Nodes (31): zustand@^5.0.2, zustand, App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, VariablesModal (+23 more)

### Community 29 - "Verification Commands"
Cohesion: 0.24
Nodes (11): preflight(), PreflightInput, PreflightIssue, findFlowVariables(), missingVariables(), nodeTexts(), RESERVED, substituteVariables() (+3 more)

### Community 30 - "Misc 30"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 31 - "Misc 31"
Cohesion: 0.22
Nodes (11): PromptFlow Dark Preview, Input, Judge Agent, Merge, Optimist Agent, Output, Prompt (Argue AGAINST), Prompt (Argue FOR) (+3 more)

### Community 32 - "Misc 32"
Cohesion: 0.15
Nodes (13): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5 (+5 more)

### Community 35 - "openrouter/models.ts"
Cohesion: 0.27
Nodes (7): CostEstimate, estimateCost(), formatUsd(), catalog, chain(), [cheap, reasoner, free], tokens()

### Community 37 - "retry.ts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, test, test:e2e (+1 more)

### Community 39 - "package.json"
Cohesion: 0.25
Nodes (8): HTML app shell, Favicon and theme-color meta, promptflow:settings read at boot, Pre-paint theme bootstrap, Dev-only .env.local fallback key, Resizable nodes and themes, No backend, Privacy

### Community 41 - "react"
Cohesion: 0.13
Nodes (21): react, GuideModal(), STEPS, ITEMS, NodePalette(), IconButton(), run, setup() (+13 more)

### Community 43 - "flow.ts"
Cohesion: 0.29
Nodes (6): mcp, playwright, command, enabled, type, $schema

### Community 44 - "useRevealSelected.ts"
Cohesion: 0.17
Nodes (10): PANEL_WIDTH_PX, isTyping(), Shortcuts, useShortcuts(), useRevealSelected(), Box, revealViewport(), container (+2 more)

### Community 45 - "connections.ts"
Cohesion: 0.47
Nodes (5): Light twin of dark preview, Optimist vs Sceptic debate flow, Run log bar, Light theme, Top toolbar

### Community 46 - "NodeConfigPanel.tsx"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 47 - "estimate.test.ts"
Cohesion: 0.70
Nodes (3): PromptFlow Brand Mark (two nodes joined by a flowing edge), Brand Palette (dark ink, violet accent, warm cream), PromptFlow Wordmark

### Community 49 - "executeFlow.ts"
Cohesion: 0.50
Nodes (4): Phase-by-phase change mode, PLAN.md spec, Planning mode rules, PromptFlow project context

### Community 50 - "openrouter/client.ts"
Cohesion: 0.50
Nodes (4): Graphify codebase navigation, Graph refresh after changes, graphify-out directory, Project notes on graphify

### Community 53 - "@testing-library/react"
Cohesion: 0.67
Nodes (3): Code conventions, Functional components and hooks only, One component per file

### Community 54 - "viewport.ts"
Cohesion: 0.67
Nodes (3): Dev commands, End-to-end tests, npm scripts table

### Community 56 - "openrouter/index.ts"
Cohesion: 0.67
Nodes (3): Branch and merge, How a flow works, Five node types

## Knowledge Gaps
- **37 isolated node(s):** `PromptFlow Dark Preview`, `Dev-only .env.local fallback key`, `Resizable nodes and themes`, `No backend`, `Favicon and theme-color meta` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 310 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `report.ts`, `openrouter/client.ts`, `runStore.ts`, `executeFlow.ts`, `serialization.ts`, `FlowNode`, `modelStore.ts`, `useGraphStore`, `providers/models.ts`, `graphStore.ts`, `settingsStore.ts`, `HistoryModal.tsx`, `openrouter/index.ts`, `merge.ts`, `OutputPreview.tsx`, `opencode Config`, `useCommands.ts`, `openrouter/models.ts`, `Modal`, `NodeConfigPanel.tsx`, `package.json`, `flowLibraryStore.ts`, `Verification Commands`, `openrouter/models.ts`, `react`, `useRevealSelected.ts`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PromptFlow Dark Preview`, `Dev-only .env.local fallback key`, `Resizable nodes and themes` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `report.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05292702485966319 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Canvas.tsx` to `package.json`, `OutputPreview.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `openrouter/client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07767722473604827 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Misc 32`, `report.ts`, `runStore.ts`, `modelStore.ts`, `useGraphStore`, `graphStore.ts`, `settingsStore.ts`, `useRevealSelected.ts`, `openrouter/index.ts`, `useCommands.ts`, `Modal`, `NodeConfigPanel.tsx`, `package.json`, `flowLibraryStore.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._