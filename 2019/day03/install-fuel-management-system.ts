import { strictEqual } from 'assert'

import { p, Point } from '../../common/point'
import { repeat, intersect } from '../../common/array'

const ORIGIN = p(0, 0)

class Wire {
  path: Point[]
  constructor(path: string) {
    this.path = path.split(',').reduce((acc: Point[], chunk) => {
      const init = acc[acc.length - 1] ?? ORIGIN
      const dir = chunk.charAt(0)
      const value = parseInt(chunk.slice(1), 10)

      return [
        ...acc,
        ...repeat(value, (i) => {
          if (dir === 'U') return init.top(i + 1)
          if (dir === 'R') return init.right(i + 1)
          if (dir === 'D') return init.bottom(i + 1)
          return init.left(i + 1)
        }),
      ]
    }, [])
  }
}

const mDistanceToClosestIntersection = (wire1: Wire, wire2: Wire) => {
  return intersect(wire1.path, wire2.path)
    .map((point) => point.mdist(ORIGIN))
    .reduce((acc, mdist) => Math.min(acc, mdist))
}

const pDistanceToClosestIntersection = (wire1: Wire, wire2: Wire) => {
  return intersect(wire1.path, wire2.path)
    .map(
      (point) =>
        wire1.path.indexOf(point) + 1 + (wire2.path.indexOf(point) + 1),
    )
    .reduce((acc, pdist) => Math.min(acc, pdist))
}

export function test() {
  const example1 = [new Wire('R8,U5,L5,D3'), new Wire('U7,R6,D4,L4')] as const
  const example2 = [
    new Wire(`R75,D30,R83,U83,L12,D49,R71,U7,L72`),
    new Wire(`U62,R66,U55,R34,D71,R55,D58,R83`),
  ] as const
  const example3 = [
    new Wire(`R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51`),
    new Wire(`U98,R91,D20,R16,D67,R40,U7,R15,U6,R7`),
  ] as const

  strictEqual(mDistanceToClosestIntersection(...example1), 6)
  strictEqual(mDistanceToClosestIntersection(...example2), 159)
  strictEqual(mDistanceToClosestIntersection(...example3), 135)

  strictEqual(pDistanceToClosestIntersection(...example1), 30)
  strictEqual(pDistanceToClosestIntersection(...example2), 610)
  strictEqual(pDistanceToClosestIntersection(...example3), 410)
}

export function part1(input: string) {
  const [wire1Chunk, wire2Chunk] = input.split('\n')
  console.log(
    'the distance to the closest intersection is',
    mDistanceToClosestIntersection(new Wire(wire1Chunk), new Wire(wire2Chunk)),
  )
}

export function part2(input: string) {
  const [wire1Chunk, wire2Chunk] = input.split('\n')
  console.log(
    'this path distance to the closest intersection is',
    pDistanceToClosestIntersection(new Wire(wire1Chunk), new Wire(wire2Chunk)),
  )
}
