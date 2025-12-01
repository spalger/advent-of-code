import { strictEqual } from 'assert'

import { dedent, toLines } from '../../common/string'
import { toInt } from '../../common/number'

function parse(input: string): number[] {
  return toLines(input).map((l) => {
    const val = toInt(l.slice(1))
    return l.startsWith('L') ? -1 * val : val
  })
}

function countStops(moves: number[]) {
  let pos = 50
  let stops = 0

  for (const move of moves) {
    pos = (pos + move) % 100
    if (pos === 0) {
      stops++
    }
  }

  return stops
}

function countPasses(moves: number[]) {
  let pos = 50
  let passes = 0

  for (const move of moves) {
    const minToPass = move > 0 || pos === 0 ? 100 - pos : pos
    const stepsAfterPass = Math.abs(move) - minToPass

    pos = (pos + move) % 100
    if (pos < 0) {
      pos += 100
    }
    if (stepsAfterPass >= 0) {
      passes += Math.floor(stepsAfterPass / 100) + 1
    }
  }

  return passes
}

export function test() {
  const moves = parse(dedent`
    L68
    L30
    R48
    L5
    R60
    L55
    L1
    L99
    R14
    L82
  `)

  strictEqual(countStops(moves), 3)
  strictEqual(countPasses(moves), 6)
  strictEqual(countPasses([1000]), 10)
}

export function part1(input: string) {
  console.log(
    'number of times the lock stops at zero is',
    countStops(parse(input)),
  )
}

export function part2(input: string) {
  console.log(
    'number of times the dial passed zero is',
    countPasses(parse(input)),
  )
}
