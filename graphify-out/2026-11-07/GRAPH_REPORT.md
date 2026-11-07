# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 132 files · ~44,669 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 688 nodes · 1890 edges · 43 communities (30 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `73410115`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NodeConfigPanel.tsx
- ModelPicker.tsx
- OpenRouter Client & Providers
- serialization.ts
- History & Run Tests
- Flow Execution Engine
- EmptyState.tsx
- Markdown Output Rendering
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- package.json
- Agent Workflow Rules
- openrouter/client.ts
- ESLint Config
- Debounced Storage
- npm Scripts
- nodes.ts
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
- FlowNode
- graphStore.ts
- NodeType
- flow.ts
- useEditShortcuts.test.tsx
- autoprefixer@^10.4.20
- jsdom@^31.0.0
- @typescript-eslint/eslint-plugin@^8.15.0
- vite@^6.0.1

## God Nodes (most connected - your core abstractions)
1. `vitest` - 44 edges
2. `useGraphStore` - 40 edges
3. `useSettingsStore` - 37 edges
4. `useRunStore` - 34 edges
5. `react` - 26 edges
6. `useModelStore` - 25 edges
7. `FlowNode` - 24 edges
8. `@xyflow/react` - 23 edges
9. `NodeType` - 19 edges
10. `FlowEdge` - 19 edges

## Surprising Connections (you probably didn't know these)
- `chain()` --calls--> `createNode()`  [EXTRACTED]
  src/engine/estimate.test.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `withFixedWidth()`  [INFERRED]
  src/store/graphStore.ts → src/lib/nodes.ts
- `CacheEntry` --references--> `ModelInfo`  [EXTRACTED]
  src/store/modelStore.ts → src/lib/openrouter/models.ts
- `useGraphStore` --indirect_call--> `stripTransientNode()`  [INFERRED]
  src/store/graphStore.ts → src/lib/serialization.ts
- `Tech stack (React, Vite, xyflow, Zustand, Tailwind, OpenRouter)` --semantically_similar_to--> `Approved tech stack`  [INFERRED] [semantically similar]
  README.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (43 total, 13 thin omitted)

### Community 0 - "NodeConfigPanel.tsx"
Cohesion: 0.06
Nodes (78): @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @testing-library/react, @testing-library/user-event, @xyflow/react, App(), CostConfirmModal, Dialogs() (+70 more)

### Community 1 - "ModelPicker.tsx"
Cohesion: 0.08
Nodes (34): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+26 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.08
Nodes (42): zod@^3.23.8, zod, OPENROUTER_BASE_URL, KeyInfo, KeyRejectedError, keySchema, verifyKey(), createProviderClient() (+34 more)

### Community 3 - "serialization.ts"
Cohesion: 0.21
Nodes (13): CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS, nodeSchema, nodeTypeSchema, normalizeEdges() (+5 more)

### Community 4 - "History & Run Tests"
Cohesion: 0.09
Nodes (32): vitest, HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), CostEstimate, formatUsd() (+24 more)

### Community 5 - "Flow Execution Engine"
Cohesion: 0.07
Nodes (29): applyTemplate(), canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds() (+21 more)

### Community 6 - "EmptyState.tsx"
Cohesion: 0.31
Nodes (6): EmptyState(), setup(), Logo(), KeySettings, maskKey(), resolveApiKey()

### Community 7 - "Markdown Output Rendering"
Cohesion: 0.10
Nodes (35): dependencies, react@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5, react, react-hot-toast (+27 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, postcss@^8.4.49, @types/react@^18.3.12, @types/react-dom@^18.3.1, typescript@^5.6.3, @typescript-eslint/parser@^8.15.0, vitest@^3.0.0, postcss (+4 more)

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
Cohesion: 0.18
Nodes (10): react-dom@^18.3.1, eslint@^9.15.0, prettier@^3.9.10, name, private, type, version, eslint (+2 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "openrouter/client.ts"
Cohesion: 0.15
Nodes (21): ApiError, createOpenRouterClient(), GenerateContext, GenerateOptions, GenerateResult, generateText(), OpenRouterClient, ProviderClient (+13 more)

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "Debounced Storage"
Cohesion: 0.18
Nodes (11): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S (+3 more)

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "nodes.ts"
Cohesion: 0.18
Nodes (15): nanoid@^5.0.9, nanoid, preflight(), catalog, llm(), createNode(), FIXED_NODE_WIDTH, LLM_NODE_WIDTH (+7 more)

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

### Community 34 - "FlowNode"
Cohesion: 0.24
Nodes (9): estimateCost(), catalog, chain(), [cheap, reasoner, free], tokens(), ExecuteFlowParams, PreflightInput, ModelInfo (+1 more)

### Community 35 - "graphStore.ts"
Cohesion: 0.26
Nodes (12): ParsedFlow, SerializedFlow, Clipboard, GraphStore, HISTORY_LIMIT, isCoalesced(), PersistedGraph, Snapshot (+4 more)

### Community 36 - "NodeType"
Cohesion: 0.25
Nodes (8): NodeShellProps, canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES, wouldCreateCycle(), HistoryNode, NodeType

### Community 37 - "flow.ts"
Cohesion: 0.18
Nodes (6): BaseData, FlowEdgeType, InputData, OutputData, OutputMode, PromptData

### Community 38 - "useEditShortcuts.test.tsx"
Cohesion: 0.53
Nodes (3): isTyping(), Host(), useEditShortcuts()

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 209 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `History & Run Tests` to `NodeConfigPanel.tsx`, `ModelPicker.tsx`, `FlowNode`, `OpenRouter Client & Providers`, `NodeType`, `Flow Execution Engine`, `EmptyState.tsx`, `useEditShortcuts.test.tsx`, `Markdown Output Rendering`, `devDependencies`, `serialization.ts`, `Edge Geometry`, `flow.ts`, `package.json`, `openrouter/client.ts`, `Debounced Storage`, `nodes.ts`, `Vite Build Config`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NodeConfigPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060216847372810675 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Markdown Output Rendering` to `NodeConfigPanel.tsx`, `ModelPicker.tsx`, `History & Run Tests`, `useEditShortcuts.test.tsx`, `Edge Geometry`, `package.json`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `ModelPicker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08408163265306122 - nodes in this community are weakly interconnected._
- **Why does `@xyflow/react` connect `NodeConfigPanel.tsx` to `graphStore.ts`, `NodeType`, `flow.ts`, `EmptyState.tsx`, `Markdown Output Rendering`, `Edge Geometry`, `package.json`, `nodes.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._