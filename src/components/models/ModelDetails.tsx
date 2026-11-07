import {
  formatContext,
  formatPrice,
  type ModelInfo,
} from '../../lib/openrouter'
import { useModelStore } from '../../store/modelStore'
import ModelBadges from './ModelBadge'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-charcoal-400">{label}</dt>
      <dd className="text-right text-charcoal-100">{value}</dd>
    </div>
  )
}

export default function ModelDetails({ model }: { model: ModelInfo }) {
  const provider = useModelStore((s) => s.provider)
  return (
    <div className="space-y-2 rounded-md border border-charcoal-700 bg-charcoal-800/40 p-2.5 text-[11px]">
      <ModelBadges model={model} />
      {model.description && (
        <p className="leading-relaxed text-charcoal-300">{model.description}</p>
      )}
      <dl className="space-y-1">
        {model.contextLength > 0 && (
          <Row
            label="Context"
            value={`${formatContext(model.contextLength)} tokens`}
          />
        )}
        {model.maxCompletionTokens && (
          <Row
            label="Max output"
            value={`${formatContext(model.maxCompletionTokens)} tokens`}
          />
        )}
        <Row
          label="Input price"
          value={`${formatPrice(model.promptPrice)} / 1M`}
        />
        <Row
          label="Output price"
          value={`${formatPrice(model.completionPrice)} / 1M`}
        />
        <Row label="Input" value={model.inputModalities.join(', ')} />
        {model.tokenizer && <Row label="Tokenizer" value={model.tokenizer} />}
        {model.knowledgeCutoff && (
          <Row label="Knowledge cutoff" value={model.knowledgeCutoff} />
        )}
        {model.expirationDate && (
          <Row label="Expires" value={model.expirationDate} />
        )}
      </dl>
      {model.supportedParameters.length > 0 && (
        <p className="text-charcoal-400">
          Parameters:{' '}
          <span className="text-charcoal-300">
            {model.supportedParameters.join(', ')}
          </span>
        </p>
      )}
      {provider === 'openrouter' && (
        <a
          href={`https://openrouter.ai/${model.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-violet-300 underline underline-offset-2 hover:text-violet-200"
        >
          View on OpenRouter
        </a>
      )}
    </div>
  )
}
