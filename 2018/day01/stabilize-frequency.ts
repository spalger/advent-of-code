import { dedent, toLines } from '../../common/string'

function parseDeltas(str: string) {
  if (str.startsWith('+')) {
    return parseInt(str.slice(1), 10)
  }
  if (str.startsWith('-')) {
    return parseInt(str.slice(1)) * -1
  }
  throw new Error(`str [${str}] does not start with a +/-`)
}

const sum = (num: number[]) => num.reduce((acc, n) => acc + n, 0)

function findDuplicate(
  nums: number[],
  freq = 0,
  seen = new Set([freq]),
): number {
  for (const num of nums) {
    freq = freq + num
    if (seen.has(freq)) {
      return freq
    } else {
      seen.add(freq)
    }
  }

  return findDuplicate(nums, freq, seen)
}

export function test() {
  const deltas = toLines(dedent`
    +1
    -2
    +3
    +1
  `).map(parseDeltas)

  console.log('freq', sum(deltas))
}

export function part1(input: string) {
  console.log('freq', sum(toLines(input).map(parseDeltas)))
}

export function part2(input: string) {
  console.log(
    'first duplicate freq:',
    findDuplicate(toLines(input).map(parseDeltas)),
  )
}
