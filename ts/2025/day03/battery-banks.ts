import { strictEqual } from 'assert'
import { getMax, toInt } from '../../common/number.ts'
import { dedent, toLines } from '../../common/string.ts'

function parse(input: string) {
  return toLines(input).map((line) => line.split('').map(toInt))
}

function findLargestPossibleJoltage(size: number, banks: number[][]): number {
  let largest = 0
  for (const row of banks) {
    let candidates = [...row]
    const digits: number[] = []
    while (digits.length < size) {
      const max = getMax(
        candidates.slice(0, candidates.length - (size - 1 - digits.length)),
      )
      const i = candidates.indexOf(max)
      digits.push(max)
      candidates = candidates.slice(i + 1)
    }
    largest += toInt(digits.join(''))
  }

  return largest
}

export function test() {
  const banks = parse(dedent`
    987654321111111
    811111111111119
    234234234234278
    818181911112111
  `)

  strictEqual(findLargestPossibleJoltage(2, banks), 357)
  strictEqual(findLargestPossibleJoltage(12, banks), 3121910778619)
}

export function part1(input: string) {
  const banks = parse(input)
  console.log(
    'the largest possible joltage is',
    findLargestPossibleJoltage(2, banks),
  )
}

export function part2(input: string) {
  const banks = parse(input)
  console.log(
    'the largest possible joltage is',
    findLargestPossibleJoltage(12, banks),
  )
}
