import { strictEqual } from 'assert'

import { dedent } from '../../common/string.ts'
import { PointMap } from '../../common/point_map.ts'
import { type Point } from '../../common/point.ts'
import { toInt } from '../../common/number.ts'

type DepthMap = PointMap<number>
function parse(input: string): DepthMap {
  return PointMap.fromString(input).map(toInt)
}

function findLowPoints(map: DepthMap) {
  const lowPoints = map.filterPoints((point, height) =>
    map.neighbors(point).every(([, otherHeight]) => height < otherHeight),
  )

  console.log('map has', lowPoints.length, 'low points')
  return lowPoints
}

function findRiskLevel(map: DepthMap) {
  const lowPoints = findLowPoints(map)
  const riskLevel = lowPoints.reduce(
    (acc, p) => acc + ((map.points.get(p) ?? 0) + 1),
    0,
  )
  console.log(' - risk level is', riskLevel)
  return riskLevel
}

function findBasins(map: DepthMap) {
  const basins = []
  for (const lowPoint of findLowPoints(map)) {
    const basin = new Set<Point>([lowPoint])
    basins.push(basin)

    // iterate through all points in the basin and add the neighbors of each point
    // which resolves to a value less than 9 to the basin
    for (const point of basin) {
      for (const [neighbor, height] of map.neighbors(point)) {
        if (height < 9) {
          basin.add(neighbor)
        }
      }
    }

    console.log('found a basin with', basin.size, 'points')
  }

  return basins
}

function productOfThreeLargestBasins(map: DepthMap) {
  const sizes = findBasins(map)
    .sort((a, b) => b.size - a.size)
    .slice(0, 3)
    .map((b) => b.size)

  console.log('three largest sizes:', sizes)

  const product = sizes.reduce((acc, s) => acc * s)
  console.log('product is:', product)
  return product
}

export function test() {
  const input = dedent`
    2199943210
    3987894921
    9856789892
    8767896789
    9899965678
  `

  strictEqual(findRiskLevel(parse(input)), 15)
  strictEqual(productOfThreeLargestBasins(parse(input)), 1134)
}

export function part1(input: string) {
  strictEqual(findRiskLevel(parse(input)), 514)
}

export function part2(input: string) {
  strictEqual(productOfThreeLargestBasins(parse(input)), 1103130)
}
