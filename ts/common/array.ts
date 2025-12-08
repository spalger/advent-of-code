import { intersection } from './set.ts'

export function repeat<T>(n: number, map: (i: number) => T) {
  const result = []
  for (let i = 0; i < n; i++) {
    result.push(map(i))
  }
  return result
}

export function intersect<T>(...arrays: Array<T[]>): T[] {
  return Array.from(intersection(...arrays.map((a) => new Set(a))))
}

export function shift<T>(arr: T[]): T {
  if (!arr.length) {
    throw new RangeError('unable to shift from empty array')
  }

  return arr.shift() as T
}

export function pop<T>(arr: T[]): T {
  if (!arr.length) {
    throw new RangeError('unable to shift from empty array')
  }

  return arr.pop() as T
}

export function last<T>(arr: T[]): T {
  if (!arr.length) {
    throw new RangeError('unable to get last item from array')
  }

  return arr[arr.length - 1]
}
