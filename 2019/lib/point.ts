const pointCache = new Map<number, Map<number, Point>>()

export const p = (x: number, y: number) => {
  let ys = pointCache.get(x)
  if (!ys) {
    ys = new Map()
    pointCache.set(x, ys)
  }
  let point = ys.get(y)
  if (!point) {
    point = new Point(x, y)
    ys.set(y, point)
  }
  return point
}

export class Point {
  constructor(public readonly x: number, public readonly y: number) {}

  left(delta = 1) {
    return p(this.x - delta, this.y)
  }

  right(delta = 1) {
    return p(this.x + delta, this.y)
  }

  bottom(delta = 1) {
    return p(this.x, this.y - delta)
  }

  top(delta = 1) {
    return p(this.x, this.y + delta)
  }

  add(offset: Point) {
    return p(this.x + offset.x, this.y + offset.y)
  }

  /**
   * get the manhattan distance this and another point
   */
  mdist(other: Point) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
  }

  toString() {
    return `(${this.x},${this.y})`
  }
}
