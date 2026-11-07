export type CommandGroup = 'Add' | 'Flow' | 'View' | 'Go to' | 'App'

export interface Command {
  id: string
  title: string
  group: CommandGroup
  /** Extra words that should find this command. */
  keywords?: string
  /** Shown on the right, e.g. "Ctrl+Z". */
  shortcut?: string
  /** Disabled commands are hidden, so every listed row does something. */
  enabled?: boolean
  run: () => void
}

const GROUP_ORDER: CommandGroup[] = ['Add', 'Flow', 'View', 'Go to', 'App']

/** Higher is better; 0 means no match. Every query word must match. */
function score(command: Command, words: string[]): number {
  const title = command.title.toLowerCase()
  const haystack = `${title} ${command.keywords?.toLowerCase() ?? ''}`
  let total = 0
  for (const word of words) {
    if (title.startsWith(word)) total += 4
    else if (title.split(/[\s:]+/).some((w) => w.startsWith(word))) total += 3
    else if (title.includes(word)) total += 2
    else if (haystack.includes(word)) total += 1
    else return 0
  }
  return total
}

/**
 * The commands to list for a query. With no query: everything, grouped in a
 * fixed order. With one: best matches first, whatever their group.
 */
export function filterCommands(commands: Command[], query: string): Command[] {
  const visible = commands.filter((c) => c.enabled !== false)
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return [...visible].sort(
      (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
    )
  }
  return visible
    .map((c) => ({ c, s: score(c, words) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c)
}
