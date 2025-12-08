import { deepStrictEqual, strictEqual } from 'assert'
import { toInt } from '../../common/number.ts'
import { reduceInclusiveIntRanges, toIntRange } from '../../common/ranges.ts'
import { dedent, toLines } from '../../common/string.ts'

type Inventory = {
  ranges: Array<readonly [number, number]>
  items: number[]
}

function parse(input: string): Inventory {
  const [rangesChunk, itemsChunk] = input.split('\n\n')

  return {
    ranges: reduceInclusiveIntRanges(toLines(rangesChunk).map(toIntRange)),
    items: toLines(itemsChunk).map(toInt),
  }
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

  deepStrictEqual(inventory.ranges, [
    [3, 5],
    [10, 20],
  ])

  strictEqual(countFreshItems(inventory), 3)
  strictEqual(countPossibleFreshItemsById(inventory), 14)
}

export function part1(input: string) {
  console.log('there are', countFreshItems(parse(input)), 'fresh items')
}

export function part2(input: string) {
  console.log(
    'there are',
    countPossibleFreshItemsById(parse(input)),
    'possible fresh items by id',
  )
}
