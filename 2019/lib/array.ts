export function repeat<T>(n: number, map: (i: number) => T) {
  const result = []
  for (let i = 0; i < n; i++) {
    result.push(map(i))
  }
  return result
}

export function intersect<T>(...arrays: Array<T[]>): T[] {
  const counts = new Map<T, number>()
  const result: T[] = []

  for (const arr of arrays) {
    for (const item of new Set(arr)) {
      const count = (counts.get(item) ?? 0) + 1
      if (count === arrays.length) {
        result.push(item)
      } else {
        counts.set(item, count)
      }
    }
  }

  return result
}
