import { p, Point } from './point'
import { repeat } from './array'

type Bound = { min: number; max: number }
type Bounds = { x: Bound; y: Bound }

export class PointMap<Ent> {
  static fromGenerator<Ent>(gen: () => Generator<[Point, Ent]>) {
    return PointMap.fromIterable(gen())
  }

  static fromIterable<Ent>(iter: Iterable<[Point, Ent]>) {
    return new PointMap(new Map(iter))
  }

  static fromSquare<Ent>(
    bottomLeft: Point,
    width: number,
    getEnt: (p: Point) => Ent,
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
    getEnt: (p: Point) => Ent,
  ) {
    const points = new Map<Point, Ent>()
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y >= bottomRight.y; y--) {
        const point = p(x, y)
        points.set(point, getEnt(point))
      }
    }
    return new PointMap(points)
  }

  constructor(public readonly points: Map<Point, Ent>) {}

  private _bounds: undefined | Bounds
  getBounds(): Bounds {
    if (this._bounds) {
      return this._bounds
    }

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    for (const p of this.points.keys()) {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    }

    return (this._bounds = {
      x: {
        min: minX,
        max: maxX,
      },
      y: {
        min: minY,
        max: maxY,
      },
    })
  }

  toString() {
    const bounds = this.getBounds()

    const lines = []
    for (let y = bounds.y.max; y >= bounds.y.min; y--) {
      let line = ''

      if (y < 10) {
        line += ` ${y} `
      } else {
        line += `${y} `
      }

      for (let x = bounds.x.min; x <= bounds.x.max; x++) {
        const ent = this.points.get(p(x, y))
        line += ent ?? ' '
      }

      lines.push(line)
    }

    const xs = repeat(
      1 + (bounds.x.max - bounds.x.min),
      (i) => bounds.x.min + i,
    )

    lines.push(
      '   ' + xs.map((i) => (i < 10 ? i : Math.floor((i % 100) / 10))).join(''),
      '   ' + xs.map((i) => (i < 10 ? ' ' : i % 10)).join(''),
    )

    return lines.join('\n')
  }
}
