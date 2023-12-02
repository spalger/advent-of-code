import { strictEqual } from 'assert'

import { dedent } from '../../common/string'
import { maybeToInt, getMax, getSum } from '../../common/number'

function getCalorieSums(list: Array<undefined | number>) {
  return list.reduce(
    (sums: number[], cal) =>
      cal === undefined
        ? [...sums, 0]
        : [...sums.slice(0, -1), (sums.at(-1) ?? 0) + cal],
    [],
  )
}

const parse = (list: string) => list.split('\n').map(maybeToInt)
const top3 = (list: number[]) =>
  list
    .slice(0)
    .sort((a, b) => b - a)
    .slice(0, 3)

export function test() {
  const list = parse(dedent`
    1000
    2000
    3000
    
    4000
    
    5000
    6000
    
    7000
    8000
    9000
    
    10000
  `)

  const sums = getCalorieSums(list)
  strictEqual(getMax(sums), 24000)
  strictEqual(getSum(top3(sums)), 45000)
}

export function part1(input: string) {
  console.log('max calories of elves is', getMax(getCalorieSums(parse(input))))
}

export function part2(input: string) {
  console.log(
    'calories of top three elves',
    getSum(top3(getCalorieSums(parse(input)))),
  )
}
