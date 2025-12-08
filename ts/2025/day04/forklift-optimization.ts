import { strictEqual } from 'assert'
import { dedent } from '../../common/string.ts'
import { PointMap } from '../../common/point_map.ts'
import { Point } from '../../common/point.ts'

function parse(input: string) {
  return PointMap.fromString<boolean>(input, (ent) => ent === '@')
}

function findAccessibleRolls(map: PointMap<boolean>) {
  return map.filterPoints((point, isRoll) => {
    if (!isRoll) return false

    let adjacentRolls = 0
    for (const [, isRoll] of map.neighborsWithDiagonals(point)) {
      if (isRoll) {
        adjacentRolls++
      }

      if (adjacentRolls >= 4) {
        return false
      }
    }

    return true
  })
}

function removeAllAccessibleRolls(map: PointMap<boolean>) {
  const removed: Point[] = []
  while (true) {
    const accessibleRolls = findAccessibleRolls(map)
    if (accessibleRolls.length === 0) {
      return removed
    }

    for (const point of accessibleRolls) {
      map.update(point, false)
      removed.push(point)
    }
  }
  return removed
}

export function test() {
  const map = parse(dedent`
    ..@@.@@@@.
    @@@.@.@.@@
    @@@@@.@.@@
    @.@@@@..@.
    @@.@@@@.@@
    .@@@@@@@.@
    .@.@.@.@@@
    @.@@@.@@@@
    .@@@@@@@@.
    @.@.@@@.@.
  `)

  strictEqual(findAccessibleRolls(map).length, 13)
  strictEqual(removeAllAccessibleRolls(map).length, 43)
}

export function part1(input: string) {
  console.log(
    'the number of accessible rolls is',
    findAccessibleRolls(parse(input)).length,
  )
}

export function part2(input: string) {
  console.log(
    'the number of removed rolls is',
    removeAllAccessibleRolls(parse(input)).length,
  )
}
