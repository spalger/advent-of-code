import { strictEqual } from 'assert'

import { toLines } from '../../common/string'
import { toInt } from '../../common/number'
import { Point3d } from '../../common/point_3d'

type Transform = (p: Point3d) => Point3d
type Rotation = { name: string; transform: Transform }

const DIRECTION_ROTATIONS: [string, Transform][] = [
  ['face +x', (p) => p],
  ['face -x', (p) => new Point3d(-p.x, p.y, -p.z)],
  ['face +z', (p) => new Point3d(-p.z, p.y, p.x)],
  ['face -z', (p) => new Point3d(p.z, p.y, -p.x)],
  ['face +y', (p) => new Point3d(-p.y, p.x, p.z)],
  ['face -y', (p) => new Point3d(p.y, -p.x, p.z)],
]
const ROLL_ROTATIONS: [string, Transform][] = [
  ['0º', (p) => p],
  ['90º', (p) => new Point3d(p.x, p.z, -p.y)],
  ['180º', (p) => new Point3d(p.x, -p.y, -p.z)],
  ['270º', (p) => new Point3d(p.x, -p.z, p.y)],
]
const ROTATIONS = DIRECTION_ROTATIONS.flatMap(([dn, d]) =>
  ROLL_ROTATIONS.map(
    ([rn, r]): Rotation => ({
      name: `${dn} ${rn}`,
      transform: (p) => d(r(p)),
    }),
  ),
)

class Report {
  static parse(input: string) {
    const reports = []

    for (const line of toLines(input)) {
      if (line.startsWith('--- ')) {
        reports.push(new Report(line.slice(4, -4), [], new Point3d(0, 0, 0)))
      } else {
        const report = reports[reports.length - 1]
        const [x, y, z] = line.split(',')
        report.beacons.push(new Point3d(toInt(x), toInt(y), toInt(z)))
      }
    }

    return reports
  }

  constructor(
    public name: string,
    public beacons: Point3d[],
    public from: Point3d,
  ) {}

  /**
   * Find a transformation of `other` that matches at least 12 beacons in `this` report by
   * rotating all of the beacons in `other` by each of the standard rotations, then attempting
   * to find the right translation by assuming one beacon from `this` and one beacon from `other`
   * are the same, then apply the difference between those two points to all other beacons
   * in `other`. If the two beacons are really the same then we will see at least 12 matching
   * beacons between `this` and `other` and can return a new Report with all the transformed
   * and translated points
   */
  match(other: Report) {
    const beaconKeys = new Set(this.beacons.map((b) => b.key))
    // loop through all the different transformations (rotation and direction)
    for (const rotation of ROTATIONS) {
      const otherBeacons = other.beacons.map((p) => rotation.transform(p))
      for (const beacon of this.beacons) {
        for (const otherBeacon of otherBeacons) {
          const dist = otherBeacon.subtract(beacon)
          const translatedBeacons = otherBeacons.map((b) => b.subtract(dist))
          let matchCount = 0
          for (const movedBeacon of translatedBeacons) {
            if (beaconKeys.has(movedBeacon.key)) {
              matchCount += 1
              // if 12 measurements overlap then we have found the right transformation for this report
              if (matchCount === 12) {
                return new Report(
                  `${other.name} (rotated to ${rotation.name}, translated by ${dist})`,
                  translatedBeacons,
                  dist,
                )
              }
            }
          }

          // if we don't have 12 matching beacons based on this measurement then move
          // onto the next beacon from `other`, then the next beacon from `this`, then
          // the next rotation until all possible combinations have been tried
        }
      }
    }
  }
}

function matchAllReports(reports: Report[]) {
  let matchedReports: Report[] = [reports[0]]
  let unmatchedReports = reports.slice(1)

  findMatch: while (unmatchedReports.length) {
    for (const unmatched of unmatchedReports) {
      for (const matched of matchedReports) {
        const match = matched.match(unmatched)
        if (match) {
          matchedReports = [...matchedReports, match]
          unmatchedReports = unmatchedReports.filter((r) => r !== unmatched)
          continue findMatch
        }
      }
    }

    throw new Error(
      `unable to match ${unmatchedReports.length} with other matched reports`,
    )
  }

  return matchedReports
}

function countUniqueBeacons(reports: Report[]) {
  const uniqueBeacons = new Set(
    reports.flatMap((r) => r.beacons.map((b) => b.key)),
  )
  console.log('there are', uniqueBeacons.size, 'unique beacons discovered')
  return uniqueBeacons.size
}

function findLargestManhattanDistance(reports: Report[]) {
  let largest
  for (const a of reports) {
    for (const b of reports) {
      if (a === b) {
        continue
      }

      const mdist = a.from.mdist(b.from)
      if (!largest || largest.mdist < mdist) {
        largest = {
          a,
          b,
          mdist,
        }
      }
    }
  }

  if (!largest) {
    throw new Error('')
  }

  console.log(
    'the largest mdist between scanners is',
    largest.mdist,
    `between`,
    largest.a.name,
    'and',
    largest.b.name,
  )

  return largest.mdist
}

export function test(input: string) {
  const allReports = matchAllReports(Report.parse(input))
  strictEqual(countUniqueBeacons(allReports), 79)
  strictEqual(findLargestManhattanDistance(allReports), 3621)
}

export function part1(input: string) {
  countUniqueBeacons(matchAllReports(Report.parse(input)))
}

export function part2(input: string) {
  findLargestManhattanDistance(matchAllReports(Report.parse(input)))
}
