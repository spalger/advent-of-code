import { strictEqual } from 'assert'

import { dedent } from '../../common/string.ts'
import { PointMap } from '../../common/point_map.ts'
import { Point } from '../../common/point.ts'
import { toInt } from '../../common/number.ts'

type OctoMap = PointMap<number>
function parse(input: string): OctoMap {
  return PointMap.fromString(input).map(toInt)
}

function step(map: OctoMap) {
  const flashing = new Set<Point>()
  const flashed = new Set<Point>()

  // +1 energies
  for (const [point, energy] of map.points) {
    const newEnergy = energy + 1
    map.points.set(point, newEnergy)
    if (newEnergy > 9) {
      flashing.add(point)
    }
  }

  for (const point of flashing) {
    flashed.add(point)
    map.points.set(point, 0)

    for (const [neighbor, energy] of map.neighborsWithDiagonals(point)) {
      if (flashed.has(neighbor)) {
        continue
      }

      const newEnergy = energy + 1
      map.points.set(neighbor, newEnergy)
      if (newEnergy > 9) {
        flashing.add(neighbor)
      }
    }
  }

  return flashed.size
}

function runForSteps(map: OctoMap, steps: number) {
  let flashes = 0

  for (let i = 0; i < steps; i++) {
    flashes += step(map)
  }

  console.log('octopus flashes', flashes)
  return flashes
}

function runUntilSynchronized(map: OctoMap) {
  let i = 0
  for (let flashes = 0; flashes !== map.points.size; i++) {
    flashes = step(map)
  }

  console.log('octopus flashes synchronized after', i, 'steps')
  return i
}

export function test() {
  const input = dedent`
    5483143223
    2745854711
    5264556173
    6141336146
    6357385478
    4167524645
    2176841721
    6882881134
    4846848554
    5283751526
  `

  strictEqual(runForSteps(parse(input), 100), 1656)
  strictEqual(runUntilSynchronized(parse(input)), 195)
}

export function part1(input: string) {
  strictEqual(runForSteps(parse(input), 100), 1743)
}

export function part2(input: string) {
  strictEqual(runUntilSynchronized(parse(input)), 364)
}
