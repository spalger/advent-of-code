import { p, Point } from './point'
import { repeat } from './array'
import { toLines } from './string'
export class PointMap<Ent> {
  static fromString(input: string) {
    return PointMap.fromGenerator<string>(function* () {
      const lines = toLines(input)
      for (let li = 0; li < lines.length; li++) {
        const y = lines.length - li - 1
        const line = lines[li]
        for (let x = 0; x < line.length; x++) {
          if (line[x] && line[x] !== ' ') {
            yield [p(x, y), line[x]]
          }
        }
      }
    })
  }

  static fromGenerator<Ent>(gen: () => Generator<[Point, Ent]>) {
    return PointMap.fromIterable(gen())
  }

  static fromIterable<Ent>(iter: Iterable<[Point, Ent]>) {
    return new PointMap(new Map(iter))
  }

  static fromSquare<Ent>(
    bottomLeft: Point,
    width: number,
    getEnt: (p: Point) => Ent | undefined,
  ) {
    return PointMap.fromRange<Ent>(
      p(bottomLeft.x, bottomLeft.y + width - 1),
      p(bottomLeft.x + width - 1, bottomLeft.y),
      getEnt,
    )
  }

  static fromRange<Ent>(
    topLeft: Point,
    bottomRight: Point,
    getEnt: (p: Point) => Ent | undefined,
  ) {
    const points = new Map<Point, Ent>()
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y >= bottomRight.y; y--) {
        const point = p(x, y)
        const ent = getEnt(point)
        if (ent !== undefined) {
          points.set(point, ent)
        }
      }
    }
    return new PointMap(points)
  }

  public readonly minX = Infinity
  public readonly maxX = -Infinity
  public readonly minY = Infinity
  public readonly maxY = -Infinity

  constructor(public readonly points: Map<Point, Ent>) {
    for (const p of points.keys()) {
      this.minX = Math.min(this.minX, p.x)
      this.maxX = Math.max(this.maxX, p.x)
      this.minY = Math.min(this.minY, p.y)
      this.maxY = Math.max(this.maxY, p.y)
    }
  }

  toString() {
    const lines = []
    for (let y = this.maxY; y >= this.minY; y--) {
      let line = ''

      if (y < 10) {
        line += ` ${y} `
      } else {
        line += `${y} `
      }

      for (let x = this.minX; x <= this.maxX; x++) {
        const ent = this.points.get(p(x, y))
        line += ent ?? ' '
      }

      lines.push(line)
    }

    const xs = repeat(1 + (this.maxX - this.minX), (i) => this.minX + i)

    lines.push(
      '   ' + xs.map((i) => (i < 10 ? i : Math.floor((i % 100) / 10))).join(''),
      '   ' + xs.map((i) => (i < 10 ? ' ' : i % 10)).join(''),
    )

    return lines.join('\n')
  }

  map<Ent2>(fn: (ent: Ent, point: Point) => Ent2 | undefined): PointMap<Ent2> {
    const { points } = this
    return PointMap.fromGenerator(function* () {
      for (const [point, ent] of points) {
        const newEnt = fn(ent, point)
        if (newEnt !== undefined) {
          yield [point, newEnt]
        }
      }
    })
  }

  filterPoints(test: (point: Point, ent: Ent) => boolean): Point[] {
    const subset = []
    for (const [point, ent] of this.points) {
      if (test(point, ent)) {
        subset.push(point)
      }
    }
    return subset
  }

  neighbors(p: Point) {
    const neighbors: [Point, Ent][] = []

    if (p.y < this.maxY) {
      this.pushEntry(p.top(), neighbors)
    }

    if (p.x < this.maxX) {
      this.pushEntry(p.right(), neighbors)
    }

    if (p.y > this.minY) {
      this.pushEntry(p.bottom(), neighbors)
    }

    if (p.x > this.minX) {
      this.pushEntry(p.left(), neighbors)
    }

    return neighbors
  }

  neighborsWithDiagonals(point: Point) {
    const neighbors: [Point, Ent][] = []
    if (point.y < this.maxY) {
      if (point.x > this.minX) {
        this.pushEntry(point.topLeft(), neighbors)
      }

      this.pushEntry(point.top(), neighbors)

      if (point.x < this.maxX) {
        this.pushEntry(point.topRight(), neighbors)
      }
    }

    if (point.x < this.maxX) {
      this.pushEntry(point.right(), neighbors)
    }

    if (point.y > this.minY) {
      if (point.x < this.maxX) {
        this.pushEntry(point.bottomRight(), neighbors)
      }

      this.pushEntry(point.bottom(), neighbors)

      if (point.x > this.minX) {
        this.pushEntry(point.bottomLeft(), neighbors)
      }
    }

    if (point.x > this.minX) {
      this.pushEntry(point.left(), neighbors)
    }

    return neighbors
  }

  private pushEntry(point: Point, arr: Array<[Point, Ent]>) {
    const ent = this.points.get(point)
    if (ent !== undefined) {
      arr.push([point, ent])
    }
  }

  *[Symbol.iterator]() {
    for (let y = this.maxY; y >= this.minY; y--) {
      for (let x = this.minX; x <= this.maxX; x++) {
        const point = p(x, y)
        const ent = this.points.get(point)
        if (ent !== undefined) {
          yield [point, ent] as const
        }
      }
    }
  }
}
