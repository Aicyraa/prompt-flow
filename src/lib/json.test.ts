import { describe, expect, it } from 'vitest'
import { BadOutputError } from './openrouter'
import { extractJson, looksLikeJson } from './json'

describe('extractJson', () => {
  it('pretty-prints plain JSON', () => {
    expect(extractJson('{"a":1,"b":[2]}')).toBe(
      '{\n  "a": 1,\n  "b": [\n    2\n  ]\n}',
    )
  })

  it('unwraps ```json fences', () => {
    expect(JSON.parse(extractJson('```json\n{"ok":true}\n```'))).toEqual({
      ok: true,
    })
    expect(JSON.parse(extractJson('```\n[1,2]\n```'))).toEqual([1, 2])
  })

  it('finds JSON surrounded by prose', () => {
    expect(
      JSON.parse(extractJson('Sure! Here you go: {"x": 1} Hope that helps.')),
    ).toEqual({ x: 1 })
  })

  it('throws a BadOutputError with a preview when nothing parses', () => {
    expect(() => extractJson('I cannot do that.')).toThrow(BadOutputError)
    expect(() => extractJson('I cannot do that.')).toThrow(/I cannot do that/)
    expect(() => extractJson('')).toThrow(BadOutputError)
  })
})

describe('looksLikeJson', () => {
  it('accepts valid objects and arrays only', () => {
    expect(looksLikeJson('{"a":1}')).toBe(true)
    expect(looksLikeJson('[1]')).toBe(true)
    expect(looksLikeJson('{oops')).toBe(false)
    expect(looksLikeJson('hello')).toBe(false)
  })
})
