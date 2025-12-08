import { toLines, dedent } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'
import { p, type Point } from '../../common/point.ts'

type Line = VerticalLine | HorizontalLine | DiagonalLine

class Vents {
  static parse(input: string, includeDiagonals = false) {
    const specs = toLines(input)

    const lines: Line[] = []
    for (const spec of specs) {
      const [left, right] = spec.split(' -> ')
      const [lx, ly] = left.split(',')
      const [rx, ry] = right.split(',')

      if (lx === rx) {
        lines.push(
          new VerticalLine(p(toInt(lx), toInt(ly)), p(toInt(rx), toInt(ry))),
        )
      } else if (ly === ry) {
        lines.push(
          new HorizontalLine(p(toInt(lx), toInt(ly)), p(toInt(rx), toInt(ry))),
        )
      } else if (includeDiagonals) {
        lines.push(
          new DiagonalLine(p(toInt(lx), toInt(ly)), p(toInt(rx), toInt(ry))),
        )
      }
    }

    return new Vents(lines)
  }

  private readonly lines: Line[]
  constructor(lines: Line[]) {
    this.lines = lines
  }

  findOverlappingPoints() {
    const overlapping = new Set<Point>()

    for (const line of this.lines) {
      for (const point of line.getPoints()) {
        if (overlapping.has(point)) {
          continue
        }
        for (const otherLine of this.lines) {
          if (line !== otherLine && otherLine.touches(point)) {
            overlapping.add(point)
          }
        }
      }
    }

    return overlapping
  }
}

class HorizontalLine {
  start: Point
  end: Point
  constructor(start: Point, end: Point) {
    this.start = start
    this.end = end
    if (this.start.x > this.end.x) {
      const realStart = this.end
      this.end = this.start
      this.start = realStart
    }
  }

  getPoints() {
    const points = []
    for (let x = this.start.x; x <= this.end.x; x++) {
      points.push(p(x, this.start.y))
    }
    return points
  }

  touches(point: Point) {
    return (
      this.start.y === point.y &&
      point.x >= this.start.x &&
      point.x <= this.end.x
    )
  }
}

class VerticalLine {
  start: Point
  end: Point
  constructor(start: Point, end: Point) {
    this.start = start
    this.end = end
    if (this.start.y > this.end.y) {
      const realStart = this.end
      this.end = this.start
      this.start = realStart
    }
  }

  getPoints() {
    const points = []
    for (let y = this.start.y; y <= this.end.y; y++) {
      points.push(p(this.start.x, y))
    }
    return points
  }

  touches(point: Point) {
    return (
      this.start.x === point.x &&
      point.y >= this.start.y &&
      point.y <= this.end.y
    )
  }
}

class DiagonalLine {
  readonly start: Point
  readonly end: Point
  readonly points: Set<Point>
  constructor(start: Point, end: Point) {
    this.start = start
    this.end = end
    this.points = new Set()
    const slope = this.start.slopeTo(this.end)
    for (let p = this.start; p !== this.end; p = p.add(slope)) {
      this.points.add(p)
    }
    this.points.add(this.end)
  }

  getPoints() {
    return this.points
  }

  touches(p: Point) {
    return this.points.has(p)
  }
}

export function test() {
  const input = dedent`
    0,9 -> 5,9
    8,0 -> 0,8
    9,4 -> 3,4
    2,2 -> 2,1
    7,0 -> 7,4
    6,4 -> 2,0
    0,9 -> 2,9
    3,4 -> 1,4
    0,0 -> 8,8
    5,5 -> 8,2
  `

  console.log(
    'overlapping points:',
    Vents.parse(input, false).findOverlappingPoints().size,
  )

  console.log(
    'overlapping points (with diagonals):',
    Vents.parse(input, true).findOverlappingPoints().size,
  )
}

export function part1(input: string) {
  const vents = Vents.parse(input)
  console.log('overlapping vents:', vents.findOverlappingPoints().size)
}

export function part2(input: string) {
  const vents = Vents.parse(input, true)
  console.log(
    'overlapping vents (with diagonals):',
    vents.findOverlappingPoints().size,
  )
}
