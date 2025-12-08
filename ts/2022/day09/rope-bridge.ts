import { strictEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'
import { p, type Point } from '../../common/point.ts'
import { PointMap } from '../../common/point_map.ts'
import { toInt } from '../../common/number.ts'

const DEBUG = false
const DIRS = {
  U: p(0, 1),
  R: p(1, 0),
  D: p(0, -1),
  L: p(-1, 0),
}

type Move = [Point, number]

function parse(input: string) {
  return toLines(input).map((l): Move => {
    const [dir, count] = l.split(' ')
    const delta = DIRS[dir as keyof typeof DIRS]
    if (!delta) {
      throw new Error(`invalid direction ${dir}`)
    }
    return [delta, toInt(count)]
  })
}

function shouldScoot(h: Point, t: Point) {
  if (h.x === t.x) {
    return Math.abs(h.y - t.y) >= 2 ? p(0, h.y > t.y ? 1 : -1) : undefined
  }

  if (h.y === t.y) {
    return Math.abs(h.x - t.x) >= 2 ? p(h.x > t.x ? 1 : -1, 0) : undefined
  }

  if (
    h === t.topRight() ||
    h === t.bottomRight() ||
    h === t.bottomLeft() ||
    h === t.topLeft()
  ) {
    return
  }

  // move diagonally in the direction of the head
  return p(h.x > t.x ? 1 : -1, h.y > t.y ? 1 : -1)
}

function simulate(moves: Move[], size: number) {
  const rope = new Array(size).fill(p(0, 0))
  const tailTrail = new Set<Point>(rope)

  for (const move of moves) {
    for (let i = 0; i < move[1]; i++) {
      // move the head
      rope[0] = rope[0].add(move[0])

      // move all the following knots
      for (let r = 1; r < size; r++) {
        const scoot = shouldScoot(rope[r - 1], rope[r])
        if (scoot) {
          rope[r] = rope[r].add(scoot)
          if (r === size - 1) {
            tailTrail.add(rope[r])
          }
        }
      }

      if (DEBUG) {
        console.log(
          PointMap.fromGenerator(function* () {
            for (const p of tailTrail) {
              yield [p, '#']
            }
            for (let r = 0; r < size; r++) {
              yield [rope[r], r === 0 ? 'H' : r === size - 1 ? 'T' : `${r}`]
            }
          }).toString(),
        )
      }
    }
  }

  return tailTrail.size
}

export function test() {
  strictEqual(
    simulate(
      parse(dedent`
        R 4
        U 4
        L 3
        D 1
        R 4
        D 1
        L 5
        R 2
      `),
      2,
    ),
    13,
  )
  strictEqual(
    simulate(
      parse(dedent`
        R 5
        U 8
        L 8
        D 3
        R 17
        D 10
        L 25
        U 20
      `),
      10,
    ),
    36,
  )
}

export function part1(input: string) {
  const moves = parse(input)
  console.log(
    'basic simulation of the rope says the tail will take',
    simulate(moves, 2),
    'spaces',
  )
}

export function part2(input: string) {
  const moves = parse(input)
  console.log(
    'complex simulation of the rope says the tail will take',
    simulate(moves, 10),
    'steps',
  )
}
