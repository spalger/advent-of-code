/**
 * Reduce a set of possibly overlapping inclusive integer ranges to a minimal
 * set of non-overlapping ranges. Ranges are sorted as part of the reduction
 * process and will be returned in ascending order by start value.
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
      const overlap = acc.findIndex(([a, b]) => !(end < a || start > b))
      if (overlap === -1) {
        return [...acc, [start, end]]
      }

      const [a, b] = acc[overlap]
      return [
        ...acc.slice(0, overlap),
        [Math.min(start, a), Math.max(end, b)],
        ...acc.slice(overlap + 1),
      ]
    }, [] as [number, number][])
}
