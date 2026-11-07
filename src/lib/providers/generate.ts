import {
  generateText,
  type GenerateContext,
  type GenerateOptions,
  type GenerateResult,
  type ProviderClient,
} from '../openrouter'
import { generateAnthropic } from './anthropic'
import { generateGoogle } from './google'

/** Streams a completion from whichever provider the client belongs to. */
export function generate(
  client: ProviderClient,
  options: GenerateOptions,
  ctx?: GenerateContext,
): Promise<GenerateResult> {
  switch (client.provider) {
    case 'anthropic':
      return generateAnthropic(client, options, ctx)
    case 'google':
      return generateGoogle(client, options, ctx)
    default:
      return generateText(client, options, ctx)
  }
}
