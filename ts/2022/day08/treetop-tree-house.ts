import { deepStrictEqual } from 'assert'
import { dedent } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'
import { Point, p } from '../../common/point.ts'
import { PointMap } from '../../common/point_map.ts'

type Trees = PointMap<number>

const dirs = [
  p(0, 1), // up
  p(1, 0), // right
  p(0, -1), // bottom
  p(-1, 0), // left
]

function getMaxHeight(map: Trees, from: Point, dir: Point): number {
  const point = from.add(dir)
  const height = map.points.get(point)
  if (height === undefined) {
    return -Infinity
  }

  return Math.max(height, getMaxHeight(map, point, dir))
}

function findVisibleTrees(map: Trees) {
  return map.filterPoints((p, height) => {
    if (map.isEdge(p)) {
      return true
    }

    return dirs.some((dir) => getMaxHeight(map, p, dir) < height)
  })
}

function countVisibleTrees(map: Trees, from: Point, dir: Point) {
  const ownHeight = map.get(from)
  let count = 0
  let cursor = from.add(dir)
  while (true) {
    const height = map.points.get(cursor)
    if (height === undefined) {
      break
    }
    count += 1
    if (height >= ownHeight) {
      break
    }
    cursor = cursor.add(dir)
  }
  return count
}

function getMaxScenicScore(map: Trees) {
  let max = -Infinity
  let maxPoint: Point

  iterPoints: for (const p of map.points.keys()) {
    if (map.isEdge(p)) {
      continue
    }

    let score = 1
    for (const dir of dirs) {
      const visible = countVisibleTrees(map, p, dir)
      if (visible === 0) {
        continue iterPoints
      }
      score *= visible
    }

    if (score > max) {
      max = score
      maxPoint = p
    }
  }

  return { score: max, point: maxPoint! }
}

export function test() {
  const map = PointMap.fromString(
    dedent`
      30373
      25512
      65332
      33549
      35390
    `,
    toInt,
  )

  const visible = findVisibleTrees(map)
  deepStrictEqual(visible.length, 21)

  const max = getMaxScenicScore(map)
  deepStrictEqual(max.score, 8)
  deepStrictEqual(max.point, p(2, 1))
}

export function part1(input: string) {
  const map = PointMap.fromString(input, toInt)
  console.log(
    'in this forest there are',
    findVisibleTrees(map).length,
    'visible trees',
  )
}

export function part2(input: string) {
  const map = PointMap.fromString(input, toInt)
  const max = getMaxScenicScore(map)
  console.log(
    'the tree with the best scenic score is at',
    max.point,
    'with a score of',
    max.score,
  )
}
