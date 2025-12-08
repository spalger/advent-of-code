import { strictEqual } from 'assert'
import { toLines } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'
import { p, type Point } from '../../common/point.ts'
import { last } from '../../common/array.ts'

const SENSOR_READING_RE =
  /^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/

interface Reading {
  readonly center: Point
  readonly beacon: Point
}

function parse(input: string) {
  return toLines(input).map((line): Reading => {
    const match = line.match(SENSOR_READING_RE)
    if (!match) {
      throw new Error(
        `expected error to match [${SENSOR_READING_RE.source}]\n  ${line}`,
      )
    }

    return {
      center: p(toInt(match[1]), toInt(match[2])),
      beacon: p(toInt(match[3]), toInt(match[4])),
    }
  })
}

// reduce range set to the minimal set of ranges
function reduceCoverage(ranges: XRange[]) {
  return (
    [...ranges]
      // sort ranges by starting x position asc, if those are the same the ending x postition desc
      .sort((a, b) => a[0] - b[0] || b[1] - a[1])
      .reduce((acc: XRange[], range): XRange[] => {
        if (!acc.length) {
          return [range]
        }

        const prev = last(acc)
        // if the start of this range is beyond the end of the previous one, keep it
        if (range[0] > prev[1]) {
          return [...acc, range]
        }

        // drop this range if it is completely encompassed by previous range
        if (range[1] <= prev[1]) {
          return acc
        }

        // extend the previous range if this goes beyond it
        return [...acc.slice(0, -1), [prev[0], range[1]]]
      }, [])
  )
}

function getCoverage(readings: Reading[], yOfInterest: number) {
  return reduceCoverage(
    readings.flatMap((r): XRange[] => {
      const radius = r.center.mdist(r.beacon)
      const dist = radius - Math.abs(yOfInterest - r.center.y)
      if (dist < 0) {
        return []
      }

      // return a range covering the point included in this, inclusive on the left and exclusive on the right
      return [[r.center.x - dist, r.center.x + dist + 1]]
    }),
  )
}

type XRange = [number, number]
function getKnownEmptySpace(readings: Reading[], yOfInterest: number) {
  // sum the absolute distance between the start and end of each range
  const sum = getCoverage(readings, yOfInterest).reduce(
    (acc, r) => acc + Math.abs(r[0] - r[1]),
    0,
  )

  // find the list of beacons in this row because we know there are becons there
  const beacons = new Set(
    readings.map((r) => r.beacon).filter((b) => b.y === yOfInterest),
  )

  return sum - beacons.size
}

function findUncoveredSpace(readings: Reading[], maxCoord: number) {
  for (let y = 0; y <= maxCoord; y++) {
    const ranges = getCoverage(readings, y)

    const filteredRanges = ranges.flatMap((r): XRange[] => {
      // any range which ends before 0 or starts after maxCoord is completely out of bounds
      if (r[1] < 0 || r[0] > maxCoord) {
        return []
      }

      return [[Math.max(0, r[0]), Math.min(maxCoord, r[1])]]
    })

    if (filteredRanges.length === 2) {
      return p(filteredRanges[0][1], y)
    }
  }

  throw new Error('unable to find uncovered space')
}

export function test(input: string) {
  const readings = parse(input)
  strictEqual(getKnownEmptySpace(readings, 10), 26)
  strictEqual(findUncoveredSpace(readings, 20), p(14, 11))
}

export function part1(input: string) {
  const readings = parse(input)
  console.log(
    'based on the readings there are',
    getKnownEmptySpace(readings, 2_000_000),
    'points where beacons can not be',
  )
}

export function part2(input: string) {
  const readings = parse(input)
  const pos = findUncoveredSpace(readings, 4_000_000)
  console.log(
    'the only valid location for a beacon based on the readings is',
    pos,
    'and its tuning freq is',
    pos.x * 4_000_000 + pos.y,
  )
}
