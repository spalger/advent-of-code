import { deepStrictEqual } from 'assert'
import { dedent, toLines } from '../../common/string'

type Parsed = ReturnType<typeof parse>

function parse(input: string) {
  const [polymer, ...pairInsertionRules] = toLines(input)
  const rules = new Map(
    pairInsertionRules.map((rule) => {
      const [pair, insertion] = rule.split(' -> ')
      return [pair, insertion]
    }),
  )

  return {
    polymer,
    rules,
  }
}

function getPairs(polymer: string) {
  const pairs = new Map<string, number>()
  for (let i = 0; i < polymer.length - 1; i++) {
    const pair = polymer.slice(i, i + 2)
    const count = pairs.get(pair) ?? 0
    pairs.set(pair, count + 1)
  }
  return pairs
}

function formulatePolymer(iterations: number, { polymer, rules }: Parsed) {
  let pairs = getPairs(polymer)

  for (let i = 0; i < iterations; i++) {
    const state = new Map()

    for (const [pair, count] of pairs) {
      const insert = rules.get(pair)
      if (!insert) {
        throw new Error(`missing insertion rule for pair [${pair}]`)
      }

      const leftPair = pair[0] + insert
      const rightPair = insert + pair[1]
      state.set(leftPair, (state.get(leftPair) ?? 0) + count)
      state.set(rightPair, (state.get(rightPair) ?? 0) + count)
    }

    pairs = state
  }

  const counts = new Map<string, number>([[polymer[0], 1]])
  for (const [pair, count] of pairs) {
    counts.set(pair[1], count + (counts.get(pair[1]) ?? 0))
  }

  const largest = [...counts.entries()].reduce((acc, ent) =>
    ent[1] > acc[1] ? ent : acc,
  )
  const smallest = [...counts.entries()].reduce((acc, ent) =>
    ent[1] < acc[1] ? ent : acc,
  )

  console.log('after', iterations)
  console.log('the most common element is', largest)
  console.log('the least common element is', smallest)
  console.log('difference is', largest[1] - smallest[1])

  return { largest, smallest }
}

export function test() {
  const input = dedent`
    NNCB

    CH -> B
    HH -> N
    CB -> H
    NH -> C
    HB -> C
    HC -> B
    HN -> C
    NN -> C
    BH -> H
    NC -> B
    NB -> B
    BN -> B
    BB -> N
    BC -> B
    CC -> N
    CN -> C
  `

  deepStrictEqual(formulatePolymer(10, parse(input)), {
    largest: ['B', 1749],
    smallest: ['H', 161],
  })
}

export function part1(input: string) {
  formulatePolymer(10, parse(input))
}

export function part2(input: string) {
  formulatePolymer(40, parse(input))
}
