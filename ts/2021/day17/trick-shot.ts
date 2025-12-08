import { strictEqual } from 'assert'
import { p, Point } from '../../common/point.ts'
import { PointMap } from '../../common/point_map.ts'
import { toInt } from '../../common/number.ts'

const TARGET_RE = /x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/
class Target {
  static parse(input: string) {
    const match = input.match(TARGET_RE)
    if (!match) {
      throw new Error(`target doesn't match pattern ${TARGET_RE.source}`)
    }

    const xs = [match[1], match[2]].map(toInt).sort((a, b) => a - b)
    const ys = [match[3], match[4]].map(toInt).sort((a, b) => a - b)

    return new Target(p(xs[0], ys[1]), p(xs[1], ys[0]))
  }

  public readonly points: Map<Point, string>
  constructor(public readonly tl: Point, public readonly br: Point) {
    this.points = PointMap.fromRange(tl, br, () => 'T').points
  }
}

class Path {
  readonly valid: boolean
  constructor(readonly vel: Point, t: Target) {
    let pos = p(0, 0)
    let v = vel

    while (true) {
      pos = pos.add(v)
      v = p(v.x === 0 ? 0 : v.x < 0 ? v.x + 1 : v.x - 1, v.y - 1)

      if (
        pos.x >= t.tl.x &&
        pos.x <= t.br.x &&
        pos.y <= t.tl.y &&
        pos.y >= t.br.y
      ) {
        this.valid = true
        return
      }

      if (pos.y < t.br.y || pos.x > t.br.x) {
        // we're past the target
        break
      }
      if (v.x === 0 && pos.x < t.tl.x) {
        // we didn't have enough x to get to the target
        break
      }
    }

    this.valid = false
  }
}

function findMaxY(target: Target) {
  // largest y velocity that will still land in the target is the distance from y=0
  // to the bottom of the target zone, minus 1, which represents the inverse of the
  // first step and also the last step before the item lands in the target.
  const initialVel = Math.abs(target.br.y) - 1
  let vel = initialVel
  let y = 0

  while (vel > 0) {
    y = y + vel
    vel = vel - 1
  }
  console.log(`with an initial Y velocity of ${initialVel} we reached ${y}`)
  return y
}

function findAllPossibleVelocities(target: Target) {
  const valid = new Set()
  const minY = -Math.abs(target.br.y)
  const maxY = Math.abs(target.br.y)
  for (let x = 0; x <= target.br.x; x++) {
    for (let y = minY; y <= maxY; y++) {
      const path = new Path(p(x, y), target)
      if (path.valid) {
        valid.add(path)
      }
    }
  }

  console.log('found', valid.size, 'valid paths')
  return valid.size
}

export function test() {
  const target = Target.parse('target area: x=20..30, y=-10..-5')
  strictEqual(findMaxY(target), 45)
  findAllPossibleVelocities(target)
}

export function part1(input: string) {
  findMaxY(Target.parse(input))
}

export function part2(input: string) {
  findAllPossibleVelocities(Target.parse(input))
}
