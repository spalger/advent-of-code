import { runIntCode } from '../../common/intcode-computer'
import { PointMap } from '../../common/point_map'
import { p, Point } from '../../common/point'
import { memoize } from '../../common/fn'
import chalk from 'chalk'

type Ent = '#' | '.'

export function part1(input: string) {
  let affectedPoints = 0

  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      const [result] = runIntCode(input, [x, y])
      if (result === 1) {
        affectedPoints++
      }
    }
  }

  console.log(
    'the number of points affected by the tractor beam in the 50x50 test area is',
    affectedPoints,
  )
}

export function part2(input: string) {
  const getMapEnt = memoize(
    (p: Point): Ent => {
      const [result] = runIntCode(input, [p.x, p.y])
      return result === 1 ? '#' : '.'
    },
  )

  const bottomLeftDelta = p(0, -99)
  const bottomRightDelta = p(99, -99)

  function findFit() {
    let lastX = 0

    findY: for (let y = 100; y < 10_000; y++) {
      findX: for (let x = lastX; x < 10_000; x++) {
        const point = p(x, y)
        if (getMapEnt(point) !== '#') {
          continue findX
        }

        if (getMapEnt(point.add(bottomRightDelta)) === '#') {
          return point
        }

        lastX = x
        continue findY
      }
    }

    throw new Error('unable to find a place where a 100x100 square would fit')
  }

  const topLeft = findFit()
  const bottomLeft = topLeft.add(bottomLeftDelta)
  const bottomRight = topLeft.add(bottomRightDelta)

  console.log(
    `the 100x100 square would fit between ${topLeft} and ${bottomRight} answer =`,
    bottomLeft.x * 10000 + bottomLeft.y,
  )

  const resultMap = PointMap.fromRange(
    p(topLeft.x - 50, topLeft.y + 20),
    p(bottomRight.x + 50, bottomRight.y - 20),
    getMapEnt,
  )

  const resultSquare = PointMap.fromRange(topLeft, bottomRight, (p) => {
    if (p === bottomLeft) {
      return chalk.green('@')
    }
    if (p === bottomRight || p === topLeft) {
      return chalk.green(resultMap.points.get(p) === '#' ? 'O' : '!')
    }

    return resultMap.points.get(p) === '#' ? 'O' : '!'
  })

  console.log('result')
  console.log(
    PointMap.fromIterable([
      ...resultMap.points,
      ...resultSquare.points,
    ]).toString(),
  )
}
