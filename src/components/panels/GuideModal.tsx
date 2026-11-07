import Modal from '../ui/Modal'

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Start from an example',
    body: 'An empty canvas offers ready-made flows. Or open Add node and pick Input, Prompt, Agent, Merge or Output. A new node connects to the one you have selected.',
  },
  {
    title: 'Add your API key',
    body: 'Open Settings and paste a key from OpenRouter, OpenAI, Anthropic, Google, Groq or Mistral. PromptFlow detects the provider and lists the models your key can use. The key stays in this browser and goes only to that provider.',
  },
  {
    title: 'Configure nodes',
    body: 'Select a node to see all its settings. Use {{input}} in a Prompt to insert the text from the previous node, or {{name}} for a variable you fill in from the Variables button.',
  },
  {
    title: 'Branch and merge',
    body: 'One node can feed several others. A Merge node joins their text again, in canvas order, so you can compare answers or hand them to a judge.',
  },
  {
    title: 'Run the flow',
    body: 'Press Run on the Output node, or Ctrl/⌘+Enter. Each node shows its status; a failed node has a Retry button that reruns only from there.',
  },
  {
    title: 'Move faster',
    body: 'Ctrl/⌘+K searches every action and jumps to any node. Tidy arranges the flow, Ctrl/⌘+Z undoes, and F zooms to what you have selected.',
  },
  {
    title: 'Save and share',
    body: 'Name a flow in Saved flows and it autosaves in this browser. Export downloads a .json file (never your key). Report .md turns a run into one document. Press ? to reopen this guide.',
  },
]

export default function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="How PromptFlow works"
      subtitle="From a blank canvas to a running flow"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border border-violet-400/40 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/10"
        >
          Got it
        </button>
      }
    >
      <ol className="space-y-4 px-5 py-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-charcoal-600 text-[10px] font-semibold text-charcoal-300">
              {i + 1}
            </span>
            <div>
              <h3 className="text-xs font-semibold text-charcoal-100">
                {step.title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-charcoal-400">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  )
}
