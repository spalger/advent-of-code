import { strictEqual } from 'assert'
import { toInt } from '../../common/number'
import { reduceInclusiveIntRanges } from '../../common/ranges'
import { dedent, toLines } from '../../common/string'

type Inventory = {
  ranges: Array<readonly [number, number]>
  items: number[]
}

function parse(input: string): Inventory {
  const [rangesChunk, itemsChunk] = input.split('\n\n')
  const ranges = reduceInclusiveIntRanges(
    toLines(rangesChunk).map((l) => {
      const [start, end] = l.split('-').map(toInt)
      return [start, end] as const
    }),
  )

  const items = toLines(itemsChunk).map(toInt)

  return { ranges, items }
}

function countFreshItems({ ranges, items }: Inventory) {
  return items.reduce((count, item) => {
    const isFresh = ranges.some(([start, end]) => item >= start && item <= end)
    return count + (isFresh ? 1 : 0)
  }, 0)
}

function countPossibleFreshItemsById({ ranges }: Inventory) {
  return ranges.reduce((sum, [start, end]) => sum + (end - start + 1), 0)
}

export function test() {
  const inventory = parse(dedent`
    3-5
    10-14
    16-20
    12-18

    1
    5
    8
    11
    17
    32
  `)

  strictEqual(countFreshItems(inventory), 3)
  strictEqual(countPossibleFreshItemsById(inventory), 14)
}

export function part1(input: string) {
  console.log(parse(input))
  console.log('there are', countFreshItems(parse(input)), 'fresh items')
}

export function part2(input: string) {
  console.log(
    'there are',
    countPossibleFreshItemsById(parse(input)),
    'possible fresh items by id',
  )
}
