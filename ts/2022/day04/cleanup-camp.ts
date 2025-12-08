import { deepStrictEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'

type Assignment = [number, number]
type Pair = [Assignment, Assignment]

const tuple = <T>(list: T[]): [T, T] => {
  if (list.length === 2) {
    return [list[0], list[1]]
  }
  throw new Error('expected array to have exactly two items')
}

const size = (ass: Assignment) => ass[1] - ass[0]

const parseAssignment = (range: string): Assignment =>
  tuple(
    range
      .split('-')
      .map(toInt)
      .sort((a, b) => a - b),
  )
const parsePair = (line: string): Pair =>
  tuple(
    line
      .split(',')
      .map(parseAssignment)
      .sort((a, b) => size(a) - size(b)),
  )
const parse = (input: string) => toLines(input).map(parsePair)

const completeOverlap = ([a, b]: Pair) => a[0] >= b[0] && a[1] <= b[1]
const partialOverlap = ([a, b]: Pair) =>
  (a[0] >= b[0] && a[0] <= b[1]) || (a[1] >= b[0] && a[1] <= b[1])

export function test() {
  const pairs = parse(dedent`
    2-4,6-8
    2-3,4-5
    5-7,7-9
    2-8,3-7
    6-6,4-6
    2-6,4-8
  `)

  deepStrictEqual(pairs.filter(completeOverlap).length, 2)
  deepStrictEqual(pairs.filter(partialOverlap).length, 4)
}

export function part1(input: string) {
  console.log(
    'there are',
    parse(input).filter(completeOverlap).length,
    'pairs which completely overlap',
  )
}

export function part2(input: string) {
  console.log(
    'there are',
    parse(input).filter(partialOverlap).length,
    'pairs which partially overlap',
  )
}
