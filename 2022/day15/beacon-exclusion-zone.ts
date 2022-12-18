import { deepStrictEqual } from 'assert'
import { toLines } from '../../common/string'
import { toInt } from '../../common/number'
import { PointMap } from '../../common/point_map'
import { p, Point } from '../../common/point'

const SENSOR_READING_RE =
  /^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/

class Reading {
  constructor(public readonly pos: Point, public readonly beacon: Point) {}

  pointsOn(y: number) {
    const radius = this.pos.mdist(this.beacon)
    const dist = Math.abs(y - this.pos.y)
    if (dist > radius) {
      return []
    }

    const points = [p(this.pos.x, y)]
    const iters = Math.abs(dist - radius)
    for (let i = 1; i <= iters; i++) {
      points.push(p(this.pos.x - i, y), p(this.pos.x + i, y))
    }
    return points
  }
}

function parse(input: string) {
  return toLines(input).map((line) => {
    const match = line.match(SENSOR_READING_RE)
    if (!match) {
      throw new Error(
        `expected error to match [${SENSOR_READING_RE.source}]\n  ${line}`,
      )
    }

    return new Reading(
      p(toInt(match[1]), toInt(match[2])),
      p(toInt(match[3]), toInt(match[4])),
    )
  })
}

function findZoneOfCertainty(readings: Reading[], yOfInterest: number) {
  const covered = new Set(readings.flatMap((r) => r.pointsOn(yOfInterest)))
  for (const r of readings) {
    covered.delete(r.beacon)
  }
  return covered
}

function printMap(readings: Reading[], zone: Set<Point>) {
  const map = PointMap.fromGenerator(function* () {
    for (const r of readings) {
      yield [r.pos, 'S']
      yield [r.beacon, 'B']
    }
    for (const z of zone) {
      yield [z, '*']
    }
  })

  console.log(map.toString())
}

export function test(input: string) {
  const readings = parse(input)
  const zone = findZoneOfCertainty(readings, 10)
  deepStrictEqual(zone.size, 26)
}

export function part1(input: string) {
  const readings = parse(input)
  const zone = findZoneOfCertainty(readings, 2_000_000)
  console.log(
    'based on the readings there are',
    zone.size,
    'points where beacons can not be',
  )
}
