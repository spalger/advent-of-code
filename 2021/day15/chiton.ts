import { strictEqual } from 'assert'

import { dedent } from '../../common/string'
import { PointMap } from '../../common/point_map'
import { toInt } from '../../common/number'
import { p, Point } from '../../common/point'

class Cavern {
  static fromString(input: string) {
    return new Cavern(PointMap.fromString(input).map(toInt))
  }

  public readonly entrance: Point
  public readonly exit: Point
  constructor(public readonly map: PointMap<number>) {
    this.entrance = p(0, map.maxY)
    this.exit = p(map.maxX, 0)
  }

  getRiskLevel(point: Point) {
    const riskLevel = this.map.points.get(point)
    if (riskLevel === undefined) {
      throw new Error(`point ${point} is out of bounds of map`)
    }
    return riskLevel
  }
}

function findLowestRiskPath(cavern: Cavern) {
  const steps = new Map<Point, { riskLevel: number; next: Point[] }>()
  for (const [point] of cavern.map.points) {
    const next = []
    if (point !== cavern.exit) {
      for (const [neighbor] of cavern.map.neighbors(point)) {
        next.push(neighbor)
      }
    }

    steps.set(point, {
      next,
      riskLevel: Infinity,
    })
  }

  const start = steps.get(cavern.entrance)!
  start.riskLevel = 0
  const queue = new Set([start])
  for (const step of queue) {
    for (const nextPoint of step.next) {
      const nextStep = steps.get(nextPoint)!
      nextStep.riskLevel = Math.min(
        cavern.getRiskLevel(nextPoint) + step.riskLevel,
        nextStep.riskLevel,
      )
      queue.add(nextStep)
    }
  }

  const endStep = steps.get(cavern.exit)!
  console.log('lowest risk level to get to exit is', endStep.riskLevel)
  return endStep.riskLevel
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
}

export function part1(input: string) {
  const cavern = Cavern.fromString(input)
  findLowestRiskPath(cavern)
}
