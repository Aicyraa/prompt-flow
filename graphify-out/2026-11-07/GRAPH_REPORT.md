# Graph Report - prompt-flow  (2026-11-07)

## Corpus Check
- 137 files · ~46,224 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 703 nodes · 1936 edges · 43 communities (34 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `581f0d02`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NodeConfigPanel.tsx
- ModelPicker.tsx
- OpenRouter Client & Providers
- dependencies
- History & Run Tests
- executeFlow.ts
- settingsStore.ts
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
- graphStore.ts
- opencode Config
- HTML Shell
- Prettier Config
- Brand Assets
- README & Setup
- vitest
- Vite Env Types
- tsconfig Root
- Verification Commands
- Misc 30
- tailwindcss
- client.test.ts
- executeFlow.engine.test.ts
- NodeType
- retry.ts
- useEditShortcuts.test.tsx
- errors.ts
- viewport.ts
- NodeStatusUpdate
- json.ts

## God Nodes (most connected - your core abstractions)
1. `vitest` - 45 edges
2. `useGraphStore` - 44 edges
3. `useSettingsStore` - 37 edges
4. `useRunStore` - 36 edges
5. `react` - 28 edges
6. `useModelStore` - 25 edges
7. `@xyflow/react` - 24 edges
8. `FlowNode` - 24 edges
9. `NodeType` - 19 edges
10. `FlowEdge` - 19 edges

## Surprising Connections (you probably didn't know these)
- `setup()` --calls--> `NodeConfigPanel()`  [EXTRACTED]
  src/components/panels/NodeConfigPanel.test.tsx → src/components/panels/NodeConfigPanel.tsx
- `NodeRef` --references--> `NodeType`  [EXTRACTED]
  src/lib/connections.ts → src/types/flow.ts
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

## Communities (43 total, 9 thin omitted)

### Community 0 - "NodeConfigPanel.tsx"
Cohesion: 0.07
Nodes (68): react, @testing-library/user-event, @xyflow/react, Canvas(), defaultEdgeOptions, edgeTypes, nodeTypes, CurvedEdge() (+60 more)

### Community 1 - "ModelPicker.tsx"
Cohesion: 0.08
Nodes (39): ModelBadges(), ModelDetails(), Row(), DEFAULT_FILTERS, filterModels(), ModelFilters, priceKey(), SortKey (+31 more)

### Community 2 - "OpenRouter Client & Providers"
Cohesion: 0.11
Nodes (31): zod, OPENROUTER_BASE_URL, KeyInfo, KeyRejectedError, keySchema, verifyKey(), createProviderClient(), Identified (+23 more)

### Community 3 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, nanoid@^5.0.9, react@^18.3.1, react-dom@^18.3.1, react-markdown@^10.1.0, remark-gfm@^4.0.1, @xyflow/react@^12.3.5, zod@^3.23.8 (+3 more)

### Community 4 - "History & Run Tests"
Cohesion: 0.09
Nodes (28): HistoryDialog(), HistoryModal(), OUTCOME, totals(), when(), GuideModal(), STEPS, CostConfirmModal() (+20 more)

### Community 5 - "executeFlow.ts"
Cohesion: 0.20
Nodes (13): applyTemplate(), canFallBack(), runNode(), ExecuteFlowParams, FlowExecutionResult, getUpstreamNodeIds(), resolveNodeInput(), RunnerContext (+5 more)

### Community 6 - "settingsStore.ts"
Cohesion: 0.10
Nodes (30): App(), CostConfirmModal, Dialogs(), HistoryModal, SettingsModal, EmptyState(), setup(), KeyStatus() (+22 more)

### Community 7 - "Markdown Output Rendering"
Cohesion: 0.17
Nodes (22): OutputModal(), OutputModalProps, LazyMarkdown(), MarkdownView, CodeBlock(), components, MarkdownViewProps, textOf() (+14 more)

### Community 8 - "TS App Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, composite, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, jsdom@^31.0.0, postcss@^8.4.49, @testing-library/user-event@^14.6.8, @types/react@^18.3.12, @types/react-dom@^18.3.1, typescript@^5.6.3, @typescript-eslint/parser@^8.15.0 (+9 more)

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
Nodes (14): autoprefixer@^10.4.20, eslint@^9.15.0, prettier@^3.9.10, @typescript-eslint/eslint-plugin@^8.15.0, vite@^6.0.1, name, private, type (+6 more)

### Community 14 - "Agent Workflow Rules"
Cohesion: 0.15
Nodes (13): Phase-by-phase change mode, Code conventions, Model tiers, .opencode/agent/ subagent definitions, @.agents/plan/PLAN.md spec, Planning mode rules, PromptFlow project context, Subagent conventions (+5 more)

### Community 15 - "openrouter/client.ts"
Cohesion: 0.25
Nodes (16): GenerateContext, GenerateOptions, GenerateResult, generateText(), OpenRouterClient, readSse(), StreamChunk, TEST_PROMPT (+8 more)

### Community 16 - "ESLint Config"
Cohesion: 0.18
Nodes (10): @eslint/js@^9.15.0, eslint-plugin-react-hooks@^5.0.0, eslint-plugin-react-refresh@^0.4.16, globals@^15.12.0, typescript-eslint@^8.15.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 17 - "Debounced Storage"
Cohesion: 0.25
Nodes (8): zustand@^5.0.2, zustand, createDebouncedStorage(), DebouncedStorage, flushPendingWrites(), listenOnce(), registry, S

### Community 18 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, format:check, lint, test, typecheck

### Community 19 - "graphStore.ts"
Cohesion: 0.06
Nodes (57): nanoid, useFlowFile(), NodeShellProps, estimateCost(), catalog, chain(), [cheap, reasoner, free], tokens() (+49 more)

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

### Community 25 - "vitest"
Cohesion: 0.24
Nodes (5): vitest, findCycleNodeIds(), TopoEdge, topologicalSort(), TEMPLATES

### Community 34 - "client.test.ts"
Cohesion: 0.20
Nodes (5): ApiError, createOpenRouterClient(), client, data(), delta()

### Community 35 - "executeFlow.engine.test.ts"
Cohesion: 0.22
Nodes (4): fast, executeFlow(), getDownstreamIds(), LlmRunner

### Community 36 - "NodeType"
Cohesion: 0.36
Nodes (5): canConnect(), NodeRef, SOURCE_NODE_TYPES, TARGET_NODE_TYPES, wouldCreateCycle()

### Community 37 - "retry.ts"
Cohesion: 0.36
Nodes (4): isRetryable(), retryAfterMs(), opts, withRetry()

### Community 38 - "useEditShortcuts.test.tsx"
Cohesion: 0.27
Nodes (7): react-hot-toast@^2.4.1, @testing-library/react@^16.3.3, react-hot-toast, @testing-library/react, isTyping(), Host(), useEditShortcuts()

### Community 39 - "errors.ts"
Cohesion: 0.53
Nodes (3): ClassifiedError, classifyError(), redactSecrets()

### Community 40 - "viewport.ts"
Cohesion: 0.33
Nodes (4): Box, container, desktopPanel, Viewport

### Community 41 - "NodeStatusUpdate"
Cohesion: 0.40
Nodes (5): CostEstimate, NodeStatusUpdate, RunStore, NodeRun, NodeStatus

## Knowledge Gaps
- **12 isolated node(s):** `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions`, `ui-interactivity-tester agent`, `PromptFlow project context` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 214 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `NodeConfigPanel.tsx`, `ModelPicker.tsx`, `OpenRouter Client & Providers`, `History & Run Tests`, `settingsStore.ts`, `Markdown Output Rendering`, `devDependencies`, `Edge Geometry`, `package.json`, `Debounced Storage`, `graphStore.ts`, `client.test.ts`, `executeFlow.engine.test.ts`, `NodeType`, `retry.ts`, `useEditShortcuts.test.tsx`, `errors.ts`, `viewport.ts`, `json.ts`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGraphStore` (e.g. with `withFixedWidth()` and `stripTransientNode()`) actually correct?**
  _`useGraphStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Code conventions`, `Model tiers`, `.opencode/agent/ subagent definitions` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NodeConfigPanel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07160832761381834 - nodes in this community are weakly interconnected._
- **Why does `react` connect `NodeConfigPanel.tsx` to `ModelPicker.tsx`, `dependencies`, `History & Run Tests`, `settingsStore.ts`, `Markdown Output Rendering`, `useEditShortcuts.test.tsx`, `package.json`, `graphStore.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `ModelPicker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07769423558897243 - nodes in this community are weakly interconnected._
- **Why does `@xyflow/react` connect `NodeConfigPanel.tsx` to `dependencies`, `NodeType`, `settingsStore.ts`, `package.json`, `graphStore.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._