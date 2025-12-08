import { deepEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'
import { repeat } from '../../common/array.ts'

type Prog = Array<'noop' | number>

function parse(input: string): Prog {
  return toLines(input).map((l) => {
    if (l === 'noop') {
      return l
    }

    return toInt(l.slice(5))
  })
}

class State {
  // start a phase 1 with x of 1
  private readonly x = new Map<number, number>([[1, 1]])

  constructor(prog: Prog) {
    for (const step of prog) {
      const current = this.get(this.x.size)
      if (step === 'noop') {
        this.x.set(this.x.size + 1, current)
      } else {
        this.x.set(this.x.size + 1, current)
        this.x.set(this.x.size + 1, current + step)
      }
    }
  }

  get(phase: number) {
    const x = this.x.get(phase)
    if (x === undefined) {
      throw new Error(`unable to get the value of x for future phase ${phase}`)
    }
    return x
  }

  has(phase: number) {
    return this.x.has(phase)
  }
}

const sumSignalStrengths = (prog: Prog) => {
  const state = new State(prog)

  let sum = 0
  for (let interesting = 20; state.has(interesting); interesting += 40) {
    sum += interesting * state.get(interesting)
  }

  return sum
}

const crt = (prog: Prog) => {
  const state = new State(prog)
  return repeat(6, (r) =>
    repeat(40, (c) => {
      const phase = 1 + (r * 40 + c)
      const sprite = state.get(phase)
      return c >= sprite - 1 && c <= sprite + 1 ? '#' : ' '
    }).join(''),
  ).join('\n')
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
  console.log(crt(prog))
}

export function part1(input: string) {
  console.log(
    'the sum of all interesting signal strengths is',
    sumSignalStrengths(parse(input)),
  )
}

export function part2(input: string) {
  console.log(crt(parse(input)))
}
