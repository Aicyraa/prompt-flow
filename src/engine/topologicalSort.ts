interface TopoEdge {
  source: string
  target: string
}

export function topologicalSort(
  nodeIds: string[],
  edges: TopoEdge[],
): string[] {
  const known = new Set(nodeIds)
  const indegree = new Map(nodeIds.map((id) => [id, 0]))
  const adjacency = new Map<string, string[]>()

  for (const edge of edges) {
    if (!known.has(edge.source) || !known.has(edge.target)) continue
    const targets = adjacency.get(edge.source) ?? []
    targets.push(edge.target)
    adjacency.set(edge.source, targets)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }

  const queue = nodeIds.filter((id) => indegree.get(id) === 0)
  const order: string[] = []

  while (queue.length > 0) {
    const id = queue.shift()!
    order.push(id)
    for (const next of adjacency.get(id) ?? []) {
      const degree = (indegree.get(next) ?? 0) - 1
      indegree.set(next, degree)
      if (degree === 0) queue.push(next)
    }
  }

  const ordered = new Set(order)
  for (const id of nodeIds) {
    if (!ordered.has(id)) order.push(id)
  }

  return order
}

/** Ids of nodes that sit on, or downstream of, a cycle (empty when acyclic). */
export function findCycleNodeIds(
  nodeIds: string[],
  edges: TopoEdge[],
): string[] {
  const ordered = new Set<string>()
  const known = new Set(nodeIds)
  const indegree = new Map(nodeIds.map((id) => [id, 0]))
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    if (!known.has(edge.source) || !known.has(edge.target)) continue
    adjacency.set(edge.source, [
      ...(adjacency.get(edge.source) ?? []),
      edge.target,
    ])
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }
  const queue = nodeIds.filter((id) => indegree.get(id) === 0)
  while (queue.length > 0) {
    const id = queue.pop()!
    ordered.add(id)
    for (const next of adjacency.get(id) ?? []) {
      const degree = (indegree.get(next) ?? 0) - 1
      indegree.set(next, degree)
      if (degree === 0) queue.push(next)
    }
  }
  return nodeIds.filter((id) => !ordered.has(id))
}
