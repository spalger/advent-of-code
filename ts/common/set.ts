/**
 * Returns a set of the items which are found in both set a and b
 */
export function intersection<T>(...sets: Set<T>[]): Set<T> {
  const [shortest, ...others] = sets.sort((a, b) => a.size - b.size)

  const inter = new Set<T>()
  itemLoop: for (const item of shortest) {
    for (const other of others) {
      if (!other.has(item)) {
        continue itemLoop
      }
    }

    inter.add(item)
  }

  return inter
}
