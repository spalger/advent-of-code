import { p, type Point } from './point.ts'
import { repeat } from './array.ts'
import { toLines } from './string.ts'

export class PointMap<Ent> {
  static fromStringOf<T extends string>(input: string, entTypes: T[]) {
    return PointMap.fromString<T>(input, (ent) => {
      if (entTypes.includes(ent as T)) {
        return ent as T
      }
      throw new Error(`Invalid entity type: ${ent}`)
    })
  }

  static fromString<T = string>(
    input: string,
    map?: (ent: string, point: Point) => T,
  ) {
    return PointMap.fromGenerator<T>(function* () {
      const lines = toLines(input)
      for (let li = 0; li < lines.length; li++) {
        const y = lines.length - li - 1
        const line = lines[li]
        for (let x = 0; x < line.length; x++) {
          if (line[x] && line[x] !== ' ') {
            const point = p(x, y)
            yield [point, (map ? map(line[x], point) : line[x]) as T]
          }
        }
      }
    })
  }

  static fromGenerator<Ent>(gen: () => Generator<[Point, Ent]>) {
    return PointMap.fromIterable(gen())
  }

  static fromIterable<Ent>(iter: Iterable<readonly [Point, Ent]>) {
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

  public minX = Infinity
  public maxX = -Infinity
  public minY = Infinity
  public maxY = -Infinity
  public readonly points: Map<Point, Ent>

  constructor(points: Map<Point, Ent>) {
    this.points = points
    this.resetBounds()
  }

  resetBounds() {
    for (const p of this.points.keys()) {
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

    const xs = repeat(1 + (this.maxX - this.minX), (i) =>
      Math.abs(this.minX + i),
    )

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

  find(test: (ent: Ent, point: Point) => boolean): Point | undefined {
    for (const [point, ent] of this.points) {
      if (test(ent, point)) {
        return point
      }
    }

    return undefined
  }

  first(test: (ent: Ent, point: Point) => boolean) {
    const found = this.find(test)
    if (found) return found
    throw new Error('No matching entity found')
  }

  row(y: number): Array<[Point, Ent]> {
    if (y < this.minY || y > this.maxY) {
      throw new Error('row is outside of map')
    }

    return Array.from({ length: this.maxX - this.minX + 1 }, (_, x) => {
      const point = p(x + this.minX, y)
      return [point, this.get(point)]
    })
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

  get(point: Point) {
    const value = this.points.get(point)
    if (value === undefined) {
      throw new Error('point is not in map')
    }
    return value
  }

  isOutside(point: Point) {
    return (
      point.x < this.minX ||
      point.x > this.maxX ||
      point.y < this.minY ||
      point.y > this.maxY
    )
  }

  isInside(point: Point) {
    return !this.isOutside(point)
  }

  isEdge(point: Point) {
    return (
      point.x === this.minX ||
      point.x === this.maxX ||
      point.y === this.minY ||
      point.y === this.maxY
    )
  }

  update(point: Point, ent: Ent) {
    const current = this.points.get(point)
    if (current === undefined) {
      throw new Error('point is not in map')
    }
    this.points.set(point, ent)
  }
}
