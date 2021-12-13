import { strictEqual } from 'assert'

import { dedent, toLines } from '../../common/string'
import { toInt } from '../../common/number'
import { Point, p } from '../../common/point'

type Points = Set<Point>
type Folder = (points: Points, n: number) => Points
type TransparentPage = {
  points: Points
  instructions: Array<{
    n: number
    fold: Folder
  }>
}

function printPage(page: TransparentPage) {
  let maxX = 0
  let maxY = 0
  for (const point of page.points) {
    maxX = Math.max(point.x, maxX)
    maxY = Math.max(point.y, maxY)
  }

  for (let y = 0; y <= maxY; y++) {
    let line = ''
    for (let x = 0; x <= maxX; x++) {
      line += page.points.has(p(x, y)) ? '#' : '.'
    }
    console.log(line)
  }
}

function foldPointsUp(points: Points, y: number) {
  const newPoints: Points = new Set()
  for (const point of points) {
    const diff = point.y - y
    if (diff === 0) {
      throw new Error(`point ${point} on fold line [${y}]`)
    }
    newPoints.add(diff < 0 ? point : p(point.x, y - diff))
  }
  return newPoints
}
function foldPointsLeft(points: Points, x: number) {
  const newPoints: Points = new Set()
  for (const point of points) {
    const diff = point.x - x
    if (diff === 0) {
      throw new Error(`point ${point} on fold line [${x}]`)
    }
    newPoints.add(diff < 0 ? point : p(x - diff, point.y))
  }
  return newPoints
}

function parse(input: string) {
  const lines = toLines(input)
  const split = lines.findIndex((l) => l.startsWith('fold along'))
  const pointLines = lines.slice(0, split)
  const instructions = lines.slice(split)

  const points = new Set(
    pointLines.map((line) => {
      const [x, y] = line.split(',')
      return p(toInt(x), toInt(y))
    }),
  )

  const page: TransparentPage = {
    points,
    instructions: instructions.map((line) => {
      const [, , inst] = line.split(' ')
      const [axis, num] = inst.split('=')
      if (axis === 'y') {
        return { fold: foldPointsUp, n: toInt(num) }
      } else {
        return { fold: foldPointsLeft, n: toInt(num) }
      }
    }),
  }

  return page
}

function step(page: TransparentPage): TransparentPage {
  const [thisStep, ...nextSteps] = page.instructions
  return {
    points: thisStep.fold(page.points, thisStep.n),
    instructions: nextSteps,
  }
}

function runOneStep(input: string) {
  const page = parse(input)
  const result = step(page)

  console.log('after one fold there are', result.points.size, 'point')
  return result.points.size
}

function runCompletely(input: string) {
  let page = parse(input)
  while (page.instructions.length) {
    page = step(page)
  }

  console.log('folded completely:')
  printPage(page)
  console.log('')

  return page.points.size
}

export function test() {
  const input = dedent`
    6,10
    0,14
    9,10
    0,3
    10,4
    4,11
    6,0
    6,12
    4,1
    0,13
    10,12
    3,4
    3,0
    8,4
    1,10
    2,14
    8,10
    9,0

    fold along y=7
    fold along x=5
  `

  strictEqual(runOneStep(input), 17)
  strictEqual(runCompletely(input), 16)
}

export function part1(input: string) {
  strictEqual(runOneStep(input), 753)
}

export function part2(input: string) {
  strictEqual(runCompletely(input), 98)
}
