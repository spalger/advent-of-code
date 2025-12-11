import { strictEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'
import { allPermutations } from '../../common/array.ts'
import { getSum } from '../../common/number.ts'

type Diagram = Map<string, string[]>

function parse(input: string): Diagram {
  return new Map(
    toLines(input).map((line) => {
      const [label, connections] = line.split(':')
      return [
        label.trim(),
        connections
          .trim()
          .split(' ')
          .map((c) => c.trim()),
      ]
    }),
  )
}

function countAllPossiblePaths(
  diagram: Diagram,
  from: string,
  to: string,
): number {
  const queue: string[][] = [[from]]
  let count = 0

  while (queue.length > 0) {
    const path = queue.shift()!
    const pos = path.at(-1)!

    const outputs = diagram.get(pos)
    if (!outputs) {
      continue
    }

    for (const next of outputs) {
      if (!path.includes(next)) {
        if (next == to) {
          count++
        } else {
          queue.push([...path, next])
        }
      }
    }
  }

  return count
}

function countAllPossiblePathsInluding(
  diagram: Diagram,
  from: string,
  mustInclude: string[],
  to: string,
): number {
  return getSum(
    allPermutations(mustInclude).map((steps) => {
      const [, product] = [...steps, to].reduce(
        ([prev, product], step) => [
          step,
          product * countAllPossiblePaths(diagram, prev, step),
        ],
        [from, 1] satisfies [string, number],
      )

      return product
    }),
  )
}

export function test() {
  // const map1 = parse(dedent`
  //   aaa: you hhh
  //   you: bbb ccc
  //   bbb: ddd eee
  //   ccc: ddd eee fff
  //   ddd: ggg
  //   eee: out
  //   fff: out
  //   ggg: out
  //   hhh: ccc fff iii
  //   iii: out
  // `)

  // strictEqual(countAllPossiblePaths(map1, 'you', 'out'), 5)

  const map2 = parse(dedent`
    svr: aaa bbb
    aaa: fft
    fft: ccc
    bbb: tty
    tty: ccc
    ccc: ddd eee
    ddd: hub
    hub: fff
    eee: dac
    dac: fff
    fff: ggg hhh
    ggg: out
    hhh: out
  `)
  strictEqual(
    countAllPossiblePathsInluding(map2, 'svr', ['dac', 'fft'], 'out'),
    2,
  )
}

export function part1(input: string) {
  console.log(
    'There are a total of',
    countAllPossiblePaths(parse(input), 'you', 'out'),
    'possible paths from me to the output.',
  )
}

export function part2(input: string) {
  console.log(
    'There are a total of',
    countAllPossiblePathsInluding(parse(input), 'svr', ['dac', 'fft'], 'out'),
    'possible paths from the server to the output that go through both dac and fft.',
  )
}
