# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 165 files · ~61,314 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 822 nodes · 2450 edges · 45 communities (35 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a676c66e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useViewActions.ts
- ModelPicker.tsx
- OpenRouter Client & Providers
- dependencies
- runStore.ts
- openrouter/client.ts
- runStore.ts
- useGraphStore
- TS App Config
- devDependencies
- TS Node Config
- Edge Geometry
- CI Workflow
- OutputPreview.tsx
- Agent Workflow Rules
- templates.test.ts
- ESLint Config
- executeFlow
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
- flowLibraryStore.ts
- executeFlow.ts
- tailwindcss
- package.json
- retry.ts
- @testing-library/react
- errors.ts
- client.test.ts
- json.ts

## God Nodes (most connected - your core abstractions)
1. `useGraphStore` - 64 edges
2. `vitest` - 58 edges
3. `useSettingsStore` - 53 edges
4. `useRunStore` - 49 edges
5. `react` - 37 edges
6. `@xyflow/react` - 31 edges
7. `FlowNode` - 30 edges
8. `useModelStore` - 25 edges
9. `NodeType` - 23 edges
10. `@testing-library/react` - 21 edges

## Surprising Connections (you probably didn't know these)
- `setup()` --calls--> `NodeConfigPanel()`  [EXTRACTED]
  src/components/panels/NodeConfigPanel.test.tsx → src/components/panels/NodeConfigPanel.tsx
- `setupMerge()` --calls--> `NodeConfigPanel()`  [EXTRACTED]
  src/components/panels/NodeConfigPanel.test.tsx → src/components/panels/NodeConfigPanel.tsx
- `useGraphStore` --indirect_call--> `withFixedWidth()`  [INFERRED]
  src/store/graphStore.ts → src/lib/nodes.ts
- `useGraphStore` --indirect_call--> `stripTransientNode()`  [INFERRED]
  src/store/graphStore.ts → src/lib/serialization.ts
- `Tech stack (React, Vite, xyflow, Zustand, Tailwind, OpenRouter)` --semantically_similar_to--> `Approved tech stack`  [INFERRED] [semantically similar]
  README.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Plan-first, phase-gated workflow** — agents_planning_mode, agents_plan_md, agents_change_edit_mode [INFERRED 0.75]

## Communities (45 total, 10 thin omitted)

### Community 0 - "useViewActions.ts"
Cohesion: 0.22
Nodes (9): FALLBACK_SIZE, useViewActions(), isTyping(), useViewShortcuts(), LayoutEdge, LayoutNode, Options, Position (+1 more)

### Community 1 - "ModelPicker.tsx"
Cohesion: 0.08
Nodes (42): vitest, ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey() (+34 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.11
Nodes (31): zod, OPENROUTER_BASE_URL, KeyInfo, KeyRejectedError, keySchema, verifyKey(), createProviderClient(), Identified (+23 more)

### Community 3 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-hot-toast@^2.4.1, react-markdown@^10.1.0, @xyflow/react@^12.3.5, zod@^3.23.8 (+2 more)

### Community 4 - "runStore.ts"
Cohesion: 0.06
Nodes (61): react-hot-toast, HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), NODE_KEYWORDS, NODE_TYPES (+53 more)

### Community 5 - "openrouter/client.ts"
Cohesion: 0.20
Nodes (19): ApiError, GenerateContext, GenerateOptions, GenerateResult, generateText(), OpenRouterClient, ProviderClient, readSse() (+11 more)

### Community 6 - "runStore.ts"
Cohesion: 0.06
Nodes (49): react, App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, VariablesModal, FlowsModal() (+41 more)

### Community 7 - "useGraphStore"
Cohesion: 0.06
Nodes (77): @xyflow/react, Canvas(), CommandPalette, defaultEdgeOptions, edgeTypes, FlowsModal, MINIMAP_COLORS, nodeTypes (+69 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint@^9.15.0, prettier@^3.9.10, @types/react@^18.3.12, @types/react-dom@^18.3.1, typescript@^5.6.3, @typescript-eslint/parser@^8.15.0, vite@^6.0.1 (+8 more)

### Community 10 - "TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module, moduleDetection, moduleResolution (+9 more)

### Community 11 - "Edge Geometry"
Cohesion: 0.19
Nodes (14): CurvedEdge(), bendForOffset(), buildCurvedPath(), cubicMidpoint(), CurvedEdgeGeometry, EDGE_BULGE_BASE, EDGE_BULGE_RANGE, EDGE_CONTROL_DISTANCE (+6 more)

### Community 12 - "CI Workflow"
Cohesion: 0.13
Nodes (14): runs-on, steps, jobs, check, name, on, pull_request, push (+6 more)

### Community 13 - "OutputPreview.tsx"
Cohesion: 0.14
Nodes (23): remark-gfm@^4.0.1, remark-gfm, OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components (+15 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "templates.test.ts"
Cohesion: 0.38
Nodes (3): findCycleNodeIds(), TopoEdge, topologicalSort()

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "executeFlow"
Cohesion: 0.24
Nodes (12): executeFlow(), runNode(), byCanvasPosition(), MergePart, mergeTexts(), SEPARATORS, separatorText(), parts (+4 more)

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "flow.ts"
Cohesion: 0.14
Nodes (20): ParsedFlow, SerializedFlow, FlowTemplate, Clipboard, GraphStore, HISTORY_LIMIT, isCoalesced(), PersistedGraph (+12 more)

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
Cohesion: 0.14
Nodes (18): nanoid, catalog, chain(), [cheap, reasoner, free], catalog, llm(), createNode(), FIXED_NODE_WIDTH (+10 more)

### Community 34 - "variables.ts"
Cohesion: 0.42
Nodes (8): preflight(), findFlowVariables(), missingVariables(), nodeTexts(), RESERVED, at, variableNames(), variableUsers()

### Community 35 - "serialization.ts"
Cohesion: 0.20
Nodes (13): cleanVariables(), CURVED_ONLY, edgeSchema, FLOW_VERSION, flowSchema, LEGACY_RUN_KEYS, nodeSchema, nodeTypeSchema (+5 more)

### Community 36 - "flowLibraryStore.ts"
Cohesion: 0.11
Nodes (19): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S (+11 more)

### Community 37 - "executeFlow.ts"
Cohesion: 0.13
Nodes (10): applyTemplate(), fast, ExecuteFlowParams, FlowExecutionResult, getDownstreamIds(), getUpstreamNodeIds(), LlmRunner, resolveNodeInput() (+2 more)

### Community 39 - "package.json"
Cohesion: 0.15
Nodes (12): autoprefixer@^10.4.20, jsdom@^31.0.0, postcss@^8.4.49, @typescript-eslint/eslint-plugin@^8.15.0, name, private, type, version (+4 more)

### Community 40 - "retry.ts"
Cohesion: 0.26
Nodes (6): withTimeout(), isRetryable(), retryAfterMs(), opts, withRetry(), TimeoutError

### Community 41 - "@testing-library/react"
Cohesion: 0.27
Nodes (7): @testing-library/react@^16.3.3, @testing-library/user-event@^14.6.8, @testing-library/react, @testing-library/user-event, isTyping(), Host(), useEditShortcuts()

### Community 42 - "errors.ts"
Cohesion: 0.31
Nodes (5): canFallBack(), ClassifiedError, classifyError(), NoKeyError, redactSecrets()

### Community 43 - "client.test.ts"
Cohesion: 0.25
Nodes (4): createOpenRouterClient(), client, data(), delta()

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 248 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `ModelPicker.tsx` to `useViewActions.ts`, `OpenRouter Client & Providers`, `runStore.ts`, `runStore.ts`, `useGraphStore`, `devDependencies`, `Edge Geometry`, `OutputPreview.tsx`, `templates.test.ts`, `executeFlow`, `flow.ts`, `@vitejs/plugin-react`, `nodes.ts`, `variables.ts`, `serialization.ts`, `flowLibraryStore.ts`, `executeFlow.ts`, `package.json`, `retry.ts`, `@testing-library/react`, `errors.ts`, `client.test.ts`, `json.ts`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ModelPicker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07773664727657324 - nodes in this community are weakly interconnected._
- **Why does `react` connect `runStore.ts` to `useViewActions.ts`, `ModelPicker.tsx`, `dependencies`, `runStore.ts`, `useGraphStore`, `package.json`, `@testing-library/react`, `Edge Geometry`, `OutputPreview.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `OpenRouter Client & Providers` be split into smaller, more focused modules?**
  _Cohesion score 0.11341463414634147 - nodes in this community are weakly interconnected._
- **Why does `useGraphStore` connect `useGraphStore` to `useViewActions.ts`, `ModelPicker.tsx`, `nodes.ts`, `serialization.ts`, `runStore.ts`, `flowLibraryStore.ts`, `runStore.ts`, `@testing-library/react`, `Edge Geometry`, `flow.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._