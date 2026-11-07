# PromptFlow

A node-based visual canvas for chaining LLM prompts. Built with React, Vite,
`@xyflow/react`, Zustand, Tailwind, and OpenRouter.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional, dev-only API key fallback
npm run dev
```

## Scripts

| Command             | What it does                  |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the Vite dev server     |
| `npm run build`     | Typecheck and build           |
| `npm run typecheck` | `tsc -b --noEmit`             |
| `npm run lint`      | ESLint                        |
| `npm run test`      | Vitest                        |
| `npm run format`    | Prettier (write)              |

## Notes

- Flows are saved to `localStorage` and can be exported/imported as JSON.
- Prompts go straight from your browser to OpenRouter; there is no server.
- Refactor roadmap: `docs/REFACTOR.md` (local, untracked).
