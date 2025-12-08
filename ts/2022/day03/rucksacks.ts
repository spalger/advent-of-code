import { deepStrictEqual } from 'assert'
import { intersect } from '../../common/array.ts'
import { toLines, dedent } from '../../common/string.ts'
import { getSum } from '../../common/number.ts'

const priority = (char: string) => {
  const code = char.charCodeAt(0)
  // uppper case letters start at 64 and go up 90, lower case letters go from 97 to 122
  return code - (code > 96 ? 96 : 38)
}

const getCommon = (...groups: string[][]) => {
  const common = intersect(...groups)
  if (common.length !== 1) {
    throw new Error(
      `expected all groups to have a single item in common, [intersection=${common}]`,
    )
  }
  return common[0]
}

class Rucksack {
  constructor(public readonly items: string[]) {}

  getCommonPriorityOfSides() {
    return priority(
      getCommon(
        this.items.slice(0, this.items.length / 2),
        this.items.slice(this.items.length / 2),
      ),
    )
  }
}

const getCommonPriority = (sacks: Rucksack[]) =>
  priority(getCommon(...sacks.map((s) => s.items)))

const toGroups = (sacks: Rucksack[]) => {
  const groupSize = 3
  if (sacks.length % groupSize !== 0) {
    throw new Error(
      `unable to place ${sacks.length} sacks into groups of ${groupSize}, does not divide evenly`,
    )
  }

  const groups: Rucksack[][] = []
  for (let i = 0; i < sacks.length; i++) {
    const gI = i % groupSize
    if (gI === 0) {
      groups.push([sacks[i]])
    } else {
      groups.at(-1)?.push(sacks[i])
    }
  }

  return groups
}

const parse = (manifest: string) =>
  toLines(manifest).map((line) => new Rucksack(line.split('')))

export function test() {
  deepStrictEqual(priority('a'), 1)
  deepStrictEqual(priority('z'), 26)
  deepStrictEqual(priority('A'), 27)
  deepStrictEqual(priority('Z'), 52)

  const sacks = parse(dedent`
    vJrwpWtwJgWrhcsFMMfFFhFp
    jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
    PmmdzqPrVvPwwTWBwg
    wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
    ttgJtRGJQctTZtZT
    CrZsJsPPZsGzwwsLwLmpwMDw
  `)

  deepStrictEqual(getSum(sacks.map((s) => s.getCommonPriorityOfSides())), 157)
  deepStrictEqual(getSum(toGroups(sacks).map((g) => getCommonPriority(g))), 70)
}

export function part1(input: string) {
  console.log(
    'the sum of all rucksack priorities is',
    getSum(parse(input).map((s) => s.getCommonPriorityOfSides())),
  )
}

export function part2(input: string) {
  console.log(
    'the sum of priorities of all group labels is',
    getSum(toGroups(parse(input)).map((g) => getCommonPriority(g))),
  )
}
