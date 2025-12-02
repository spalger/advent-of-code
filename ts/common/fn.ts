export function memoize<T, T2>(fn: (x: T) => T2): (x: T) => T2 {
  const cache = new Map<T, T2>()
  return (x: T) => {
    if (cache.has(x)) {
      return cache.get(x)!
    }

    const result = fn(x)
    cache.set(x, result)
    return result
  }
}
