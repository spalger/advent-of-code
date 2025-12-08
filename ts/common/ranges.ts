import { toInt } from './number.ts'

/**
 * Parse "int-int" as a pair of integer numbers representing a range.
 */
export function toIntRange(string: string): [number, number] {
  const [start, end] = string.split('-').map(toInt)
  return [start, end]
}

/**
 * Reduce a set of possibly overlapping inclusive integer ranges to a minimal
 * set of non-overlapping ranges. Ranges are sorted as part of the reduction
 * process and will be returned in ascending order by start value and size.
 *
 * @example
 * ```ts
 * deepEqual(
 *   reduceInclusiveIntRanges([
 *     [3, 5],
 *     [10, 14],
 *     [16, 20],
 *     [12, 18],
 *   ]),
 *   [
 *     [3, 5],
 *     [10, 20],
 *   ]
 * )
 */
export function reduceInclusiveIntRanges(ranges: readonly [number, number][]) {
  return ranges
    .toSorted((a, b) => a[0] - b[0])
    .reduce((acc, [start, end]): [number, number][] => {
      const prev = acc.at(-1)
      if (prev && start <= prev[1]) {
        prev[1] = Math.max(prev[1], end)
        return acc
      }

      return [...acc, [start, end]]
    }, [] as [number, number][])
}
