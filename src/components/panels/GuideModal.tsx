import Modal from '../ui/Modal'

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Start from an example',
    body: 'An empty canvas offers three ready-made flows. Or add nodes from the top bar: Input, Prompt, Agent, Output. A new node connects to the one you have selected.',
  },
  {
    title: 'Add your API key',
    body: 'Open Settings, turn on “Use my own API key” and paste a key from OpenRouter, OpenAI, Anthropic, Google, Groq or Mistral. PromptFlow detects the provider and lists the models your key can use. The key stays in this browser and goes only to that provider.',
  },
  {
    title: 'Configure nodes',
    body: 'Select a node to see all its settings. Pick any model your key can use, and use {{input}} in a Prompt template to insert upstream text.',
  },
  {
    title: 'Tune a connection',
    body: 'Click a line, then drag its midpoint to bend it, or press Delete to remove it.',
  },
  {
    title: 'Run the flow',
    body: 'Press Run or Ctrl/⌘+Enter. Each node shows its status; failures appear on the node and in the Run log, with what to do next.',
  },
  {
    title: 'Save and share',
    body: 'Flows save to your browser automatically. Export downloads a .json file (never your key); Import loads one. Press ? to reopen this guide.',
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
