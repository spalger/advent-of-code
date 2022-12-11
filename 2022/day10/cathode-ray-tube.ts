import { deepEqual } from 'assert'
import { dedent, toLines } from '../../common/string'
import { toInt } from '../../common/number'

type Prog = Array<'noop' | number>

function parse(input: string): Prog {
  return toLines(input).map((l) => {
    if (l === 'noop') {
      return l
    }

    return toInt(l.slice(5))
  })
}

type SimpleProgState = [number, number]

const sumSignalStrengths = (prog: Prog) => {
  let state: SimpleProgState = [1, 1]
  let sum = 0
  let nextInterestingPoint = 20
  for (const step of prog) {
    const next: SimpleProgState =
      step === 'noop'
        ? [state[0] + 1, state[1]]
        : [state[0] + 2, state[1] + step]

    if (state[0] < nextInterestingPoint && next[0] >= nextInterestingPoint) {
      sum +=
        nextInterestingPoint *
        (next[0] === nextInterestingPoint ? next[1] : state[1])
      nextInterestingPoint += 40
    }

    state = next
  }

  return sum
}

export function test() {
  const prog = parse(dedent`
    addx 15
    addx -11
    addx 6
    addx -3
    addx 5
    addx -1
    addx -8
    addx 13
    addx 4
    noop
    addx -1
    addx 5
    addx -1
    addx 5
    addx -1
    addx 5
    addx -1
    addx 5
    addx -1
    addx -35
    addx 1
    addx 24
    addx -19
    addx 1
    addx 16
    addx -11
    noop
    noop
    addx 21
    addx -15
    noop
    noop
    addx -3
    addx 9
    addx 1
    addx -3
    addx 8
    addx 1
    addx 5
    noop
    noop
    noop
    noop
    noop
    addx -36
    noop
    addx 1
    addx 7
    noop
    noop
    noop
    addx 2
    addx 6
    noop
    noop
    noop
    noop
    noop
    addx 1
    noop
    noop
    addx 7
    addx 1
    noop
    addx -13
    addx 13
    addx 7
    noop
    addx 1
    addx -33
    noop
    noop
    noop
    addx 2
    noop
    noop
    noop
    addx 8
    noop
    addx -1
    addx 2
    addx 1
    noop
    addx 17
    addx -9
    addx 1
    addx 1
    addx -3
    addx 11
    noop
    noop
    addx 1
    noop
    addx 1
    noop
    noop
    addx -13
    addx -19
    addx 1
    addx 3
    addx 26
    addx -30
    addx 12
    addx -1
    addx 3
    addx 1
    noop
    noop
    noop
    addx -9
    addx 18
    addx 1
    addx 2
    noop
    noop
    addx 9
    noop
    noop
    noop
    addx -1
    addx 2
    addx -37
    addx 1
    addx 3
    noop
    addx 15
    addx -21
    addx 22
    addx -6
    addx 1
    noop
    addx 2
    addx 1
    noop
    addx -10
    noop
    noop
    addx 20
    addx 1
    addx 2
    addx 2
    addx -6
    addx -11
    noop
    noop
    noop
  `)

  deepEqual(sumSignalStrengths(prog), 13140)
}

export function part1(input: string) {
  console.log(
    'the sum of all interesting signal strengths is',
    sumSignalStrengths(parse(input)),
  )
}
