import {
  formatContext,
  formatPrice,
  isExpiringSoon,
  isFree,
  type ModelInfo,
} from '../../lib/openrouter'

const chip =
  'rounded border px-1 py-px text-[10px] font-medium leading-4 whitespace-nowrap'

export default function ModelBadges({ model }: { model: ModelInfo }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      {model.contextLength > 0 && (
        <span className={`${chip} border-charcoal-600 text-charcoal-300`}>
          {formatContext(model.contextLength)} ctx
        </span>
      )}
      {isFree(model) ? (
        <span className={`${chip} border-emerald-500/40 text-emerald-300`}>
          free
        </span>
      ) : (
        model.promptPrice !== null && (
          <span className={`${chip} border-charcoal-600 text-charcoal-300`}>
            {formatPrice(model.promptPrice)} /{' '}
            {formatPrice(model.completionPrice)}
          </span>
        )
      )}
      {model.reasoning && (
        <span className={`${chip} border-violet-400/40 text-violet-300`}>
          reasoning
        </span>
      )}
      {model.inputModalities.includes('image') && (
        <span className={`${chip} border-sky-400/40 text-sky-300`}>vision</span>
      )}
      {isExpiringSoon(model) && (
        <span className={`${chip} border-amber-400/50 text-amber-300`}>
          expiring
        </span>
      )}
    </span>
  )
}
