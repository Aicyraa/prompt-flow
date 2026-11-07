<div align="center">

<img src="public/logo.svg" alt="PromptFlow" height="56" />

### Chain LLM prompts on a canvas. Run them. See every step.

A visual, node-based playground for building multi-step prompt flows. Wire up inputs,
prompts and models, branch and merge, then watch the results stream in, with the cost
of every run in plain sight.

<picture>
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/preview-light.png" />
  <img src=".github/assets/preview-dark.png" alt="PromptFlow canvas: a flow where two agents argue opposite sides, a Merge node joins them and a judge writes the verdict" width="100%" />
</picture>

<sub>The built-in <b>Compare two takes</b> example, after a run.</sub>

</div>

---

## Why you might like it

- **See the whole chain.** Every step is a node you can read, edit and rerun. No hidden prompts.
- **Bring any key.** Paste a key and PromptFlow works out the provider and lists the models _that key_ can use.
- **No backend.** Requests go straight from your browser to the provider. Your key never touches a server of ours, because there isn't one.
- **Know what it cost.** Tokens, cost and time for every run and every step, before and after.
- **Built to be driven fast.** Command palette, undo/redo, auto-layout, and a keyboard shortcut for nearly everything.

## Features

|                       |                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Five node types**   | **Input** → **Prompt** (templates with `{{input}}`) → **Agent** (any model) → **Merge** (join branches) → **Output** (rendered Markdown).                                |
| **Six providers**     | OpenRouter, OpenAI, Anthropic, Google Gemini, Groq and Mistral. One key at a time; the provider is detected from the key.                                                 |
| **Branch and merge**  | One node can feed many. A Merge node joins them back in canvas order, optionally with each branch's name above its text.                                                 |
| **Variables**         | Write `{{topic}}` anywhere and fill it in from the Variables dialog. Reuse one flow for different content.                                                               |
| **Live results**      | Text streams into the Output node as it is generated. Failed steps show why and have a **Retry** that reruns only from there.                                            |
| **Reports**           | Download a run (or any run from history) as one clean Markdown report: result first, then every step with its model, tokens and cost.                                   |
| **Saved flows**       | Name a flow and it autosaves in your browser. Switch between flows, duplicate, rename, export and import as JSON (your key is never exported).                           |
| **Make it yours**     | Every node resizes. Text size is adjustable globally and per node. Light and dark themes, or follow your system.                                                         |
| **Edit with confidence** | Undo/redo, copy/paste/duplicate, Tidy auto-layout, minimap, and an Undo toast whenever something replaces your canvas.                                                |
| **Accessible**        | Keyboard-operable dialogs and menus, status that never relies on colour alone, reduced-motion support, and axe-clean in both themes.                                     |

## Quick start

```bash
npm install
npm run dev
```

Open the app, then:

1. **Add your API key** in Settings (OpenRouter, OpenAI, Anthropic, Google, Groq or Mistral).
2. **Pick an example** on the empty canvas, or build your own from **Add node**.
3. **Press Run** on the Output node (or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>).

> Node 22 is what CI uses.

### Keyboard shortcuts

| Shortcut                                        | Does                                     |
| ----------------------------------------------- | ---------------------------------------- |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd>     | Command palette: any action, or jump to a node by name |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> | Run the flow                             |
| <kbd>Esc</kbd>                                  | Stop a running flow                      |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Z</kbd> / <kbd>Shift</kbd> + <kbd>Z</kbd> | Undo / redo     |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>C</kbd> / <kbd>V</kbd> / <kbd>D</kbd> | Copy / paste / duplicate selected nodes |
| <kbd>F</kbd> / <kbd>Shift</kbd> + <kbd>F</kbd>  | Zoom to selection / fit everything       |
| <kbd>?</kbd>                                    | How PromptFlow works                     |

## How a flow works

```
 Input ──► Prompt ──► Agent ─┐
                             ├──► Merge ──► Prompt ──► Agent ──► Output
 Input ──► Prompt ──► Agent ─┘
```

- A **Prompt** inserts the text arriving from the previous node with `{{input}}`, and a
  variable with `{{name}}`.
- An **Agent** sends the prompt to the model you chose, with an optional system prompt,
  temperature, token limit, JSON output and fallback models.
- Independent branches run side by side, then wait for each other at a **Merge**.
- Selecting a node opens its settings; dragging a corner resizes it.

## Privacy

- Flows, settings and run history live in your browser's `localStorage`. Nothing is uploaded.
- Your API key is stored separately (this tab only by default) and sent only to its own provider.
- A dev-only fallback key can go in `.env.local` (see `.env.example`). It is ignored in
  production builds, because Vite inlines `VITE_*` values into the bundle.

## Tech

TypeScript (strict) · React 18 · Vite · [`@xyflow/react`](https://reactflow.dev) · Zustand · Tailwind CSS ·
Zod · Vitest · Playwright

```
src/
├─ components/   canvas, nodes, panels, dialogs, palette, toolbar
├─ engine/       flow execution, scheduling, retries, cost estimates
├─ lib/          providers, serialization, layout, reports, variables
├─ store/        graph, run, settings, model catalog, history, saved flows
└─ types/        shared types
e2e/             Playwright end-to-end tests
```

## Scripts

| Command                | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                         |
| `npm run build`        | Typecheck and build                               |
| `npm run typecheck`    | `tsc -b --noEmit`                                 |
| `npm run lint`         | ESLint                                            |
| `npm run test`         | Unit and component tests (Vitest)                 |
| `npm run test:e2e`     | End-to-end tests in a real browser (Playwright)   |
| `npm run format`       | Prettier (write)                                  |

The end-to-end tests use a fake model API, so they need no key and cost nothing. They use
an installed Chromium when there is one (or `E2E_CHROMIUM=/path/to/chrome`); otherwise run
`npx playwright install chromium` once.

## Project notes

- `graphify-out/` holds a knowledge graph of the codebase for quick navigation. See
  `AGENTS.md` for how it is used and refreshed.

## License

[MIT](LICENSE) © 2026 Jee
