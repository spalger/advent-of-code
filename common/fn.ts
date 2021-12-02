export function memoize<T, T2>(fn: (x: T) => T2): (x: T) => T2 {
  const cache = new Map<T, T2>()
  return (x: T) => {
    const cached = cache.get(x)
    if (cached !== undefined) {
      return cached
    }

    const result = fn(x)
    cache.set(x, result)
    return result
  }
}
