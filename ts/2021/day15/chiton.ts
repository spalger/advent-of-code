import { strictEqual } from 'assert'

import { dedent } from '../../common/string.ts'
import { PointMap } from '../../common/point_map.ts'
import { toInt } from '../../common/number.ts'
import { p, type Point } from '../../common/point.ts'

class Cavern {
  static fromString(input: string) {
    return new Cavern(PointMap.fromString(input).map(toInt))
  }

  readonly map: PointMap<number>
  readonly entrance: Point
  readonly exit: Point
  constructor(map: PointMap<number>) {
    this.map = map
    this.entrance = p(map.minX, map.maxY)
    this.exit = p(map.maxX, map.minY)
  }

  getRiskLevel(point: Point) {
    const riskLevel = this.map.points.get(point)
    if (riskLevel === undefined) {
      throw new Error(`point ${point} is out of bounds of map`)
    }
    return riskLevel
  }

  expandToFullMap() {
    const newPoints = new Map<Point, number>()

    for (let x = 0; x < 5; x++) {
      for (let y = 4; y >= 0; y--) {
        for (const [sourcePoint, sourceCost] of this.map.points) {
          const newCost = sourceCost + p(x, y).mdist(p(0, 4))
          newPoints.set(
            sourcePoint.add(
              p((this.map.maxX + 1) * x, (this.map.maxY + 1) * y),
            ),
            newCost < 10 ? newCost : 1 + (newCost % 10),
          )
        }
      }
    }

    return new Cavern(new PointMap(newPoints))
  }
}

class Path {
  readonly cost: number
  readonly history: Point[]
  readonly end: Point
  constructor(cost: number, history: Point[], end: Point) {
    this.cost = cost
    this.history = history
    this.end = end
  }

  next(cavern: Cavern) {
    const newHistory = [...this.history, this.end]
    const next: Path[] = []

    if (this.end.y < cavern.map.maxY) {
      const p = this.end.top()
      if (!this.history.includes(p)) {
        next.push(new Path(this.cost + cavern.getRiskLevel(p), newHistory, p))
      }
    }

    if (this.end.x < cavern.map.maxX) {
      const p = this.end.right()
      if (!this.history.includes(p)) {
        next.push(new Path(this.cost + cavern.getRiskLevel(p), newHistory, p))
      }
    }

    if (this.end.y > cavern.map.minY) {
      const p = this.end.bottom()
      if (!this.history.includes(p)) {
        next.push(new Path(this.cost + cavern.getRiskLevel(p), newHistory, p))
      }
    }

    if (this.end.x > cavern.map.minX) {
      const p = this.end.left()
      if (!this.history.includes(p)) {
        next.push(new Path(this.cost + cavern.getRiskLevel(p), newHistory, p))
      }
    }

    return next
  }
}

function findLowestRiskPath(cavern: Cavern) {
  const starting = new Path(0, [], cavern.entrance)
  const cheapestToPoint = new Map<Point, Path>([[starting.end, starting]])

  const queue = [starting]
  findCheapest: while (queue.length) {
    const path = queue.shift()!

    for (const next of path.next(cavern)) {
      const cheapest = cheapestToPoint.get(next.end)
      if (cheapest && cheapest.cost <= next.cost) {
        // skip this path, we already have a faster path to this point
        continue
      }

      cheapestToPoint.set(next.end, next)

      if (next.end === cavern.exit) {
        break findCheapest
      }

      const insertionPoint = queue.findIndex((p) => p.cost >= next.cost)
      if (insertionPoint === -1) {
        queue.push(next)
      } else if (insertionPoint === 0) {
        queue.unshift(next)
      } else {
        queue.splice(insertionPoint - 1, 0, next)
      }
    }
  }

  const cheapest = cheapestToPoint.get(cavern.exit)
  if (!cheapest) {
    throw new Error('failed to find cheapest path')
  }
  console.log(
    'the safest path has a risk level of',
    cheapest.cost,
    'and',
    cheapest.history.length + 1,
    'steps',
  )
  return cheapest.cost
}

export function test() {
  const cavern = Cavern.fromString(dedent`
    1163751742
    1381373672
    2136511328
    3694931569
    7463417111
    1319128137
    1359912421
    3125421639
    1293138521
    2311944581
  `)

  strictEqual(findLowestRiskPath(cavern), 40)
  strictEqual(findLowestRiskPath(cavern.expandToFullMap()), 315)
}

export function part1(input: string) {
  findLowestRiskPath(Cavern.fromString(input))
}

export function part2(input: string) {
  findLowestRiskPath(Cavern.fromString(input).expandToFullMap())
}
