# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 955 nodes · 2616 edges · 81 communities (55 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ae93a6f3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- report.ts
- react
- providers/models.ts
- dependencies
- vitest
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
- Test Setup
- Verification Commands
- Misc 30
- Misc 31
- Misc 32
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
- VariablesModal.tsx
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
- `applyModels()` --indirect_call--> `isUsableModel()`  [INFERRED]
  src/store/modelStore.ts → src/lib/openrouter/models.ts
- `chain()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/estimate.test.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `withFixedWidth()`  [INFERRED]
  src/store/graphStore.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `stripTransientNode()`  [INFERRED]
  src/store/graphStore.ts → src/lib/serialization.ts
- `Approved tech stack` --semantically_similar_to--> `Tech stack`  [INFERRED] [semantically similar]
  AGENTS.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent working rules** — agents_planning_mode, agents_change_edit_mode, agents_response_style [INFERRED 0.75]
- **Flow building blocks** — readme_node_types, readme_branch_merge, readme_variables, readme_live_results [INFERRED 0.75]

## Communities (81 total, 26 thin omitted)

### Community 0 - "report.ts"
Cohesion: 0.05
Nodes (63): vitest, HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), OutputModal(), OutputModalProps (+55 more)

### Community 1 - "react"
Cohesion: 0.08
Nodes (32): isRetryable(), retryAfterMs(), RetryOptions, opts, withRetry(), ApiError, createOpenRouterClient(), GenerateContext (+24 more)

### Community 2 - "providers/models.ts"
Cohesion: 0.12
Nodes (24): @xyflow/react, Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, FlowsModal, MINIMAP_COLORS, nodeTypes (+16 more)

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (17): applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds() (+9 more)

### Community 4 - "vitest"
Cohesion: 0.15
Nodes (23): @testing-library/react, @testing-library/user-event, OutputNode(), props, run, setup(), run, duration() (+15 more)

### Community 5 - "Canvas.tsx"
Cohesion: 0.17
Nodes (18): Pt, top(), captionsAreOneLine(), dragCorner(), size(), TYPES, MockOptions, node() (+10 more)

### Community 6 - "settingsStore.ts"
Cohesion: 0.11
Nodes (24): ExecuteFlowParams, PreflightInput, cleanVariables(), CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS (+16 more)

### Community 7 - "runStore.ts"
Cohesion: 0.17
Nodes (22): zod, OPENROUTER_BASE_URL, KeyInfo, KeyRejectedError, keySchema, verifyKey(), Identified, identifyKey() (+14 more)

### Community 8 - "TS App Config"
Cohesion: 0.15
Nodes (14): react, CommandPalette(), setup(), CostConfirmModal(), ITEMS, NodePalette(), Modal(), ModalProps (+6 more)

### Community 9 - "devDependencies"
Cohesion: 0.10
Nodes (21): runs-on, steps, runs-on, steps, jobs, check, e2e, name (+13 more)

### Community 10 - "TS Node Config"
Cohesion: 0.20
Nodes (14): supportsParam(), LLMNode(), MergeNode(), setup(), Icon(), STROKE, KEY_ERRORS, NodeShell() (+6 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.16
Nodes (16): FallbackModels(), LlmFields(), NodeConfigPanel(), models, setup(), setupMerge(), Field(), FieldProps (+8 more)

### Community 12 - "CI Workflow"
Cohesion: 0.18
Nodes (17): useModelInfo(), DEFAULT_MODEL, ModelInfo, ProviderId, applyModels(), CacheEntry, cacheKey(), CatalogStatus (+9 more)

### Community 13 - "support.ts"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.14
Nodes (13): NodeShellProps, findCycleNodeIds(), TopoEdge, topologicalSort(), canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES (+5 more)

### Community 15 - "HistoryModal.tsx"
Cohesion: 0.18
Nodes (15): nanoid@^5.0.9, nanoid, catalog, llm(), createNode(), FIXED_NODE_WIDTH, LLM_NODE_WIDTH, OUTPUT_NODE_SIZE (+7 more)

### Community 16 - "ESLint Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 17 - "graphStore.ts"
Cohesion: 0.20
Nodes (12): DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey, models, ModelPicker(), ModelPickerProps (+4 more)

### Community 18 - "npm Scripts"
Cohesion: 0.14
Nodes (15): MergePart, mergeTexts(), SEPARATORS, separatorText(), parts, BaseData, EdgeData, FlowEdgeType (+7 more)

### Community 19 - "OutputPreview.tsx"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer@^10.4.20, @playwright/test@^1.65.0, prettier@^3.9.10, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @types/node@^22.20.5, @types/react@^18.3.12 (+9 more)

### Community 20 - "opencode Config"
Cohesion: 0.19
Nodes (13): bendForOffset(), buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE, perp() (+5 more)

### Community 21 - "HTML Shell"
Cohesion: 0.21
Nodes (11): GuideModal(), STEPS, IconButton(), run, setup(), TopBar(), IconName, FALLBACK_SIZE (+3 more)

### Community 22 - "Prettier Config"
Cohesion: 0.26
Nodes (8): react-hot-toast, FlowsModal(), setup(), NODE_KEYWORDS, NODE_TYPES, useCommands(), useFlowFile(), showUndoToast()

### Community 23 - "Brand Assets"
Cohesion: 0.21
Nodes (10): DEFAULT_TEMPERATURE, fetchModels(), isUsableModel(), parseModels(), price(), rawModelSchema, buildRequestParams(), RequestParams (+2 more)

### Community 24 - "README & Setup"
Cohesion: 0.18
Nodes (12): ThemePref, FLOW_STORAGE_KEY, API_KEY_STORAGE_KEY, DEFAULT_COST_THRESHOLD_USD, initialKey, KeyPersistence, KeyStatus, readStoredKey() (+4 more)

### Community 25 - "@vitejs/plugin-react"
Cohesion: 0.24
Nodes (10): SHORT, TextSizeControl(), TextSizeControlProps, DEFAULT_TEXT_SIZE, effectiveTextSize(), isTextSize(), SIZE_PX, TEXT_SIZES (+2 more)

### Community 26 - "Vite Env Types"
Cohesion: 0.15
Nodes (12): jsdom@^31.0.0, postcss@^8.4.49, @types/react-dom@^18.3.1, @typescript-eslint/eslint-plugin@^8.15.0, name, private, type, version (+4 more)

### Community 27 - "tsconfig Root"
Cohesion: 0.26
Nodes (7): KeyStatus(), SettingsDialog(), SettingsModal(), connectKey(), pickDefault(), remapUnavailableModels(), syncModels()

### Community 28 - "Test Setup"
Cohesion: 0.23
Nodes (8): serializeFlow(), cleanName(), FLOW_LIBRARY_STORAGE_KEY, FlowLibrary, nextUntitled(), SavedFlow, snapshot(), useFlowLibrary

### Community 29 - "Verification Commands"
Cohesion: 0.36
Nodes (9): preflight(), PreflightIssue, findFlowVariables(), missingVariables(), nodeTexts(), RESERVED, at, variableNames() (+1 more)

### Community 30 - "Misc 30"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 31 - "Misc 31"
Cohesion: 0.22
Nodes (11): PromptFlow Dark Preview, Input, Judge Agent, Merge, Optimist Agent, Output, Prompt (Argue AGAINST), Prompt (Argue FOR) (+3 more)

### Community 32 - "Misc 32"
Cohesion: 0.18
Nodes (11): dependencies, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5, zod@^3.23.8 (+3 more)

### Community 33 - "nodes.ts"
Cohesion: 0.25
Nodes (8): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S

### Community 34 - "format.ts"
Cohesion: 0.36
Nodes (7): App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, VariablesModal, startFlowAutosave()

### Community 35 - "openrouter/models.ts"
Cohesion: 0.27
Nodes (7): CostEstimate, estimateCost(), formatUsd(), catalog, chain(), [cheap, reasoner, free], tokens()

### Community 36 - "EmptyState.tsx"
Cohesion: 0.29
Nodes (5): createProviderClient(), PREFIX_ORDER, PROBE_ORDER, ProviderMeta, PROVIDERS

### Community 37 - "retry.ts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, test, test:e2e (+1 more)

### Community 38 - "tailwindcss"
Cohesion: 0.31
Nodes (6): Command, CommandGroup, filterCommands(), GROUP_ORDER, score(), all

### Community 39 - "package.json"
Cohesion: 0.25
Nodes (8): HTML app shell, Favicon and theme-color meta, promptflow:settings read at boot, Pre-paint theme bootstrap, Dev-only .env.local fallback key, Resizable nodes and themes, No backend, Privacy

### Community 40 - "flowLibraryStore.ts"
Cohesion: 0.61
Nodes (6): ModelBadges(), ModelDetails(), Row(), formatContext(), formatPrice(), isExpiringSoon()

### Community 41 - "connection.ts"
Cohesion: 0.32
Nodes (5): LayoutEdge, LayoutNode, Options, Position, tidyPositions()

### Community 42 - "Modal"
Cohesion: 0.39
Nodes (5): applyTheme(), resolveTheme(), systemTheme(), Theme, THEME_PREFS

### Community 43 - "flow.ts"
Cohesion: 0.29
Nodes (6): mcp, playwright, command, enabled, type, $schema

### Community 44 - "VariablesModal.tsx"
Cohesion: 0.33
Nodes (5): Box, revealViewport(), container, desktopPanel, Viewport

### Community 45 - "connections.ts"
Cohesion: 0.47
Nodes (5): Light twin of dark preview, Optimist vs Sceptic debate flow, Run log bar, Light theme, Top toolbar

### Community 46 - "NodeConfigPanel.tsx"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 47 - "estimate.test.ts"
Cohesion: 0.70
Nodes (3): PromptFlow Brand Mark (two nodes joined by a flowing edge), Brand Palette (dark ink, violet accent, warm cream), PromptFlow Wordmark

### Community 48 - "commands.ts"
Cohesion: 0.60
Nodes (3): KeySettings, maskKey(), resolveApiKey()

### Community 49 - "executeFlow.ts"
Cohesion: 0.50
Nodes (4): Phase-by-phase change mode, PLAN.md spec, Planning mode rules, PromptFlow project context

### Community 50 - "openrouter/client.ts"
Cohesion: 0.50
Nodes (4): Graphify codebase navigation, Graph refresh after changes, graphify-out directory, Project notes on graphify

### Community 52 - "serialization.ts"
Cohesion: 0.67
Nodes (3): isTyping(), Shortcuts, useShortcuts()

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
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `report.ts` to `react`, `providers/models.ts`, `dependencies`, `vitest`, `settingsStore.ts`, `TS App Config`, `TS Node Config`, `Edge Geometry`, `CI Workflow`, `Agent Workflow Rules`, `HistoryModal.tsx`, `graphStore.ts`, `npm Scripts`, `OutputPreview.tsx`, `opencode Config`, `HTML Shell`, `Prettier Config`, `Brand Assets`, `README & Setup`, `@vitejs/plugin-react`, `Vite Env Types`, `tsconfig Root`, `Test Setup`, `Verification Commands`, `nodes.ts`, `openrouter/models.ts`, `EmptyState.tsx`, `tailwindcss`, `connection.ts`, `Modal`, `VariablesModal.tsx`, `commands.ts`, `layout.ts`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PromptFlow Dark Preview`, `Dev-only .env.local fallback key`, `Resizable nodes and themes` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `report.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05337078651685393 - nodes in this community are weakly interconnected._
- **Why does `react` connect `TS App Config` to `Misc 32`, `report.ts`, `providers/models.ts`, `format.ts`, `vitest`, `TS Node Config`, `Edge Geometry`, `graphStore.ts`, `serialization.ts`, `HTML Shell`, `Prettier Config`, `Vite Env Types`, `tsconfig Root`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07767722473604827 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Canvas.tsx` to `Vite Env Types`, `OutputPreview.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._