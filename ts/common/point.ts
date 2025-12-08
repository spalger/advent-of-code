import { gcf } from './number.ts'

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
  public readonly x: number
  public readonly y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  left(delta = 1) {
    return p(this.x - delta, this.y)
  }

  right(delta = 1) {
    return p(this.x + delta, this.y)
  }

  bottom(delta = 1) {
    return p(this.x, this.y - delta)
  }

  bottomLeft(delta = 1) {
    return p(this.x - delta, this.y - delta)
  }

  bottomRight(delta = 1) {
    return p(this.x + delta, this.y - delta)
  }

  top(delta = 1) {
    return p(this.x, this.y + delta)
  }

  topLeft(delta = 1) {
    return p(this.x - delta, this.y + delta)
  }

  topRight(delta = 1) {
    return p(this.x + delta, this.y + delta)
  }

  add(offset: Point) {
    return p(this.x + offset.x, this.y + offset.y)
  }

  sub(offset: Point) {
    return p(this.x - offset.x, this.y - offset.y)
  }

  /**
   * get the manhattan distance this and another point
   */
  mdist(other: Point) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
  }

  /**
   * Get the slope from this point to another point, expressed as a third "offset" point
   */
  slopeTo(other: Point) {
    const xd = other.x - this.x
    const yd = other.y - this.y

    // if xd or yd is zero then we just convert -X into -1 or X into 1 and continue
    if (xd === 0 || yd === 0) {
      return p(xd ? xd / Math.abs(xd) : 0, yd ? yd / Math.abs(yd) : 0)
    }

    const div = gcf(xd, yd)
    return p(xd / div, yd / div)
  }

  /**
   * rotate a point around the origin by some number of degrees
   *
   * @param deg a number of degrees to rotate counter-clockwise (90 = 90 degrees to the left)
   */
  rotate(deg: number, origin: Point = p(0, 0)) {
    const radians = deg * (Math.PI / 180)
    const x = this.x - origin.x
    const y = this.y - origin.y
    return p(
      origin.x + Math.round(x * Math.cos(radians) - y * Math.sin(radians)),
      origin.y + Math.round(x * Math.sin(radians) + y * Math.cos(radians)),
    )
  }

  toString() {
    return `(${this.x},${this.y})`
  }
}
