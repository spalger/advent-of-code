import { deepStrictEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'

const pref = (prefix: string, str: string) => {
  const index = str.indexOf(prefix)
  if (index === -1) {
    throw new Error(`expected string to include prefix "${prefix}" in "${str}"`)
  }
  return str.slice(index + prefix.length).trim()
}

const OP_RE = /^(old|new|\d+) (\+|\*) (old|new|\d+)$/
const OLD = Symbol('ref to old value')

class Operation {
  static fromString(expression: string) {
    const match = pref('Operation: new = ', expression).match(OP_RE)
    if (!match) {
      throw new Error(`expected operation to match ${OP_RE.source}`)
    }

    return new Operation(
      match[1] === 'old' ? OLD : toInt(match[1]),
      match[2] as '+' | '*',
      match[3] === 'old' ? OLD : toInt(match[3]),
    )
  }

  readonly x: number | typeof OLD
  readonly op: '+' | '*'
  readonly y: number | typeof OLD
  constructor(x: number | typeof OLD, op: '+' | '*', y: number | typeof OLD) {
    this.x = x
    this.op = op
    this.y = y
  }

  eval(old: number) {
    const x = this.x === OLD ? old : this.x
    const y = this.y === OLD ? old : this.y

    if (this.op === '+') {
      return x + y
    }

    if (this.op === '*') {
      return x * y
    }

    throw new Error(`unexpected op ${this.op}`)
  }
}

class Monkey {
  static fromLines(lines: string[]) {
    const [name, items, oper, test, ifTrue, ifFalse] = lines
    return new Monkey(
      toInt(pref('Monkey ', name)),
      pref('Starting items: ', items).split(',').map(toInt),
      Operation.fromString(oper),
      toInt(pref('Test: divisible by ', test)),
      toInt(pref('If true: throw to monkey ', ifTrue)),
      toInt(pref('If false: throw to monkey ', ifFalse)),
    )
  }

  readonly id: number
  readonly items: number[]
  readonly op: Operation
  readonly divisibleBy: number
  readonly targetIfTrue: number
  readonly targetIfFalse: number
  constructor(
    id: number,
    items: number[],
    op: Operation,
    divisibleBy: number,
    targetIfTrue: number,
    targetIfFalse: number,
  ) {
    this.id = id
    this.items = items
    this.op = op
    this.divisibleBy = divisibleBy
    this.targetIfTrue = targetIfTrue
    this.targetIfFalse = targetIfFalse
  }
}

function parse(input: string) {
  const lines = toLines(input)
  const monkeys: Monkey[] = []
  while (lines.length) {
    const monkey = Monkey.fromLines(lines.splice(0, 6))
    if (monkey.id !== monkeys.length) {
      throw new Error('expected monkey.id to be the same as monkey length')
    }
    monkeys.push(monkey)
  }
  return monkeys
}

function play(monkeys: Monkey[], config = { rounds: 20, extraWorried: false }) {
  const counts = monkeys.map(() => 0)
  for (let round = 1; round <= config.rounds; round++) {
    for (const monkey of monkeys) {
      const inspected = monkey.items.map((w) =>
        config.extraWorried
          ? monkey.op.eval(w)
          : Math.floor(monkey.op.eval(w) / 3),
      )
      counts[monkey.id] += inspected.length
      monkey.items.length = 0
      for (const item of inspected) {
        monkeys[
          item % monkey.divisibleBy === 0
            ? monkey.targetIfTrue
            : monkey.targetIfFalse
        ].items.push(item)
      }
    }
    counts
  }

  return counts
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((a, b) => a * b)
}

export function test() {
  const spec = dedent`
    Monkey 0:
      Starting items: 79, 98
      Operation: new = old * 19
      Test: divisible by 23
        If true: throw to monkey 2
        If false: throw to monkey 3

    Monkey 1:
      Starting items: 54, 65, 75, 74
      Operation: new = old + 6
      Test: divisible by 19
        If true: throw to monkey 2
        If false: throw to monkey 0

    Monkey 2:
      Starting items: 79, 60, 97
      Operation: new = old * old
      Test: divisible by 13
        If true: throw to monkey 1
        If false: throw to monkey 3

    Monkey 3:
      Starting items: 74
      Operation: new = old + 3
      Test: divisible by 17
        If true: throw to monkey 0
        If false: throw to monkey 1
  `

  // deepStrictEqual(play(monkeys), 10605)
  deepStrictEqual(
    play(parse(spec), { extraWorried: true, rounds: 10_000 }),
    2_713_310_158,
  )
}

export function part1(input: string) {
  const monkeys = parse(input)
  console.log('monkey business is at level', play(monkeys))
}
