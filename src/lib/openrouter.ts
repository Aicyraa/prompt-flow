import OpenAI from 'openai'

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export const TEST_PROMPT = 'Say "Hello from PromptFlow" in exactly one sentence.'

export interface GenerateOptions {
  model: string
  temperature: number
  prompt: string
}

export function createOpenRouterClient(
  apiKey: string | undefined = import.meta.env.OPENROUTER_API_KEY,
): OpenAI | null {
  if (!apiKey) return null
  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    dangerouslyAllowBrowser: true,
  })
}

export async function generateText(
  client: OpenAI,
  { model, temperature, prompt }: GenerateOptions,
): Promise<string> {
  const completion = await client.chat.completions.create({
    model,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  })
  return completion.choices[0]?.message?.content ?? ''
}
