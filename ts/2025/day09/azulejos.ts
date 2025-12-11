import { strictEqual } from 'assert'
import { toInt } from '../../common/number.ts'
import { p, type Point } from '../../common/point.ts'
import { dedent, toLines } from '../../common/string.ts'
import { Line } from '../../common/line.ts'
import { PointMap } from '../../common/point_map.ts'

function parsePoints(input: string) {
  return toLines(input).map((line) => {
    const [x, y] = line.split(',').map(toInt)
    return p(x, y)
  })
}

function largestArea(
  points: Point[],
  { isValid }: { isValid?: (from: Point, to: Point) => boolean } = {},
) {
  let largest: null | [size: number, from: Point, to: Point] = null
  for (const point of points) {
    for (const other of points) {
      if (point !== other) {
        const area =
          (Math.abs(point.x - other.x) + 1) * (Math.abs(point.y - other.y) + 1)
        if (isValid && !isValid(point, other)) continue
        if (!largest || area > largest[0]) {
          largest = [area, point, other]
        }
      }
    }
  }

  if (!largest) throw new Error('No largest area found')
  const debug: PointMap<string> = PointMap.ofPolygon(points)
  debug.drawSquare(largest[1], largest[2], (p, ent) =>
    ent === '#' ? '@' : '%',
  )
  console.log(debug.toString())
  console.log('Area:', largest[0], 'from', largest[1], 'to', largest[2])
  return largest[0]
}

function largestAreaWithinPolygon(points: Point[]) {
  return largestArea(points, {
    isValid: (from, to) => {
      const topLeft = p(Math.min(from.x, to.x), Math.max(from.y, to.y))
      const topRight = p(Math.max(from.x, to.x), Math.max(from.y, to.y))
      const bottomLeft = p(Math.min(from.x, to.x), Math.min(from.y, to.y))
      const bottomRight = p(Math.max(from.x, to.x), Math.min(from.y, to.y))

      const top = new Line(topLeft, topRight)
      const right = new Line(topRight, bottomRight)
      const bottom = new Line(bottomRight, bottomLeft)
      const left = new Line(bottomLeft, topLeft)

      for (let i = -1; i < points.length - 1; i++) {
        const from = points.at(i)
        const to = points.at(i + 1)
        if (!from || !to) throw new Error('bounds error')

        const edge = new Line(from, to)
        const topInt = top.intersects(edge)
        const rightInt = right.intersects(edge)
        const bottomInt = bottom.intersects(edge)
        const leftInt = left.intersects(edge)

        const blocks = (kind: ReturnType<Line['intersects']>) => kind !== 'none'

        if (
          blocks(topInt) ||
          blocks(rightInt) ||
          blocks(bottomInt) ||
          blocks(leftInt)
        ) {
          const debug: PointMap<string> = PointMap.ofPolygon(points)
          debug.drawLine(top, 't')
          debug.drawLine(right, 'r')
          debug.drawLine(bottom, 'b')
          debug.drawLine(left, 'l')
          debug.drawLine(edge, '*')
          console.log(debug.toString())
          return false
        }
      }

      return true
    },
  })
}

export function test() {
  const points = parsePoints(dedent`
    7,1
    11,1
    11,7
    9,7
    9,5
    2,5
    2,3
    7,3
  `)

  strictEqual(largestArea(points), 50)
  strictEqual(largestAreaWithinPolygon(points), 24)
}

export function part1(input: string) {
  console.log(
    largestArea(parsePoints(input)),
    'is the largest area you can make',
  )
}

export function part2(input: string) {
  console.log(
    largestAreaWithinPolygon(parsePoints(input)),
    'is the largest area you can make',
  )
}
