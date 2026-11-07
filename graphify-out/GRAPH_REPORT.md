# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 157 files · ~55,889 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 780 nodes · 2269 edges · 39 communities (29 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `655e9d58`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- graphStore.ts
- ModelPicker.tsx
- OpenRouter Client & Providers
- dependencies
- react
- executeFlow.ts
- runStore.ts
- NodeConfigPanel.tsx
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- report.ts
- Agent Workflow Rules
- NodeType
- ESLint Config
- commands.ts
- npm Scripts
- flow.ts
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
- variables.ts
- serialization.ts
- debouncedStorage.ts
- executeFlow.test.ts
- tailwindcss

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 57 edges
2. `vitest` - 54 edges
3. `useSettingsStore` - 50 edges
4. `useRunStore` - 46 edges
5. `react` - 34 edges
6. `FlowNode` - 29 edges
7. `@xyflow/react` - 27 edges
8. `useModelStore` - 25 edges
9. `NodeType` - 21 edges
10. `useRunAction()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `setup()` --calls--> `NodeConfigPanel()`  [EXTRACTED]
  src/components/panels/NodeConfigPanel.test.tsx → src/components/panels/NodeConfigPanel.tsx
- `useGraphStore` --indirect_call--> `withFixedWidth()`  [INFERRED]
  src/store/graphStore.ts → src/lib/nodes.ts
- `make()` --calls--> `createNode()`  [EXTRACTED]
  src/lib/report.test.ts → src/lib/nodes.ts
- `chain()` --calls--> `createNode()`  [EXTRACTED]
  src/lib/templates.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `stripTransientNode()`  [INFERRED]
  src/store/graphStore.ts → src/lib/serialization.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (39 total, 10 thin omitted)

### Community 0 - "graphStore.ts"
Cohesion: 0.06
Nodes (52): react-hot-toast, @xyflow/react, Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, MINIMAP_COLORS, nodeTypes (+44 more)

### Community 1 - "ModelPicker.tsx"
Cohesion: 0.08
Nodes (38): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+30 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.12
Nodes (30): zod, OPENROUTER_BASE_URL, KeyInfo, KeyRejectedError, keySchema, verifyKey(), Identified, identifyKey() (+22 more)

### Community 3 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5 (+5 more)

### Community 4 - "react"
Cohesion: 0.07
Nodes (47): react, HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), GuideModal(), STEPS (+39 more)

### Community 5 - "executeFlow.ts"
Cohesion: 0.05
Nodes (48): canFallBack(), fast, executeFlow(), runNode(), FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds(), LlmRunner (+40 more)

### Community 6 - "runStore.ts"
Cohesion: 0.07
Nodes (52): @testing-library/react, @testing-library/user-event, vitest, App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal (+44 more)

### Community 7 - "NodeConfigPanel.tsx"
Cohesion: 0.13
Nodes (31): ModelPicker(), supportsParam(), useModelInfo(), LLMNode(), FallbackModels(), LlmFields(), NodeConfigPanel(), ITEMS (+23 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.09
Nodes (30): devDependencies, autoprefixer@^10.4.20, eslint@^9.15.0, jsdom@^31.0.0, postcss@^8.4.49, prettier@^3.9.10, @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8 (+22 more)

### Community 10 - "TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+9 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.20
Nodes (12): buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE, perp(), Point (+4 more)

### Community 12 - "CI Workflow"
Cohesion: 0.13
Nodes (14): runs-on, steps, jobs, check, name, on, pull_request, push (+6 more)

### Community 13 - "report.ts"
Cohesion: 0.13
Nodes (24): useRunReport(), CostEstimate, estimateCost(), formatUsd(), tokens(), compact(), formatRunSummary(), formatUsage() (+16 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "NodeType"
Cohesion: 0.18
Nodes (12): NodeShellProps, canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES, wouldCreateCycle(), chain(), Step (+4 more)

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "commands.ts"
Cohesion: 0.24
Nodes (8): CommandPalette(), setup(), Command, CommandGroup, filterCommands(), GROUP_ORDER, score(), all

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "flow.ts"
Cohesion: 0.14
Nodes (18): ExecuteFlowParams, ParsedFlow, SerializedFlow, FlowTemplate, Clipboard, GraphStore, Snapshot, BaseData (+10 more)

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
Cohesion: 0.20
Nodes (11): catalog, chain(), [cheap, reasoner, free], catalog, llm(), createNode(), FIXED_NODE_WIDTH, LLM_NODE_WIDTH (+3 more)

### Community 34 - "variables.ts"
Cohesion: 0.25
Nodes (13): preflight(), PreflightInput, PreflightIssue, ErrorKind, findFlowVariables(), missingVariables(), nodeTexts(), RESERVED (+5 more)

### Community 35 - "serialization.ts"
Cohesion: 0.22
Nodes (12): CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS, nodeSchema, nodeTypeSchema, parseFlow() (+4 more)

### Community 36 - "debouncedStorage.ts"
Cohesion: 0.25
Nodes (8): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 238 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `runStore.ts` to `graphStore.ts`, `ModelPicker.tsx`, `nodes.ts`, `OpenRouter Client & Providers`, `react`, `executeFlow.ts`, `executeFlow.test.ts`, `debouncedStorage.ts`, `serialization.ts`, `devDependencies`, `variables.ts`, `Edge Geometry`, `report.ts`, `NodeType`, `commands.ts`, `flow.ts`, `@vitejs/plugin-react`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `graphStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06227106227106227 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `graphStore.ts`, `ModelPicker.tsx`, `dependencies`, `runStore.ts`, `NodeConfigPanel.tsx`, `devDependencies`, `report.ts`, `commands.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `ModelPicker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08350168350168351 - nodes in this community are weakly interconnected._
- **Why does `@xyflow/react` connect `graphStore.ts` to `nodes.ts`, `dependencies`, `runStore.ts`, `NodeConfigPanel.tsx`, `devDependencies`, `NodeType`, `flow.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._