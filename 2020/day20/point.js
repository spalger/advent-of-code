/** @type {Map<number, Map<number, Point>>} */
const pointCache = new Map()

export const p = (x, y) => {
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

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  left() {
    return p(this.x - 1, this.y)
  }

  right() {
    return p(this.x + 1, this.y)
  }

  bottom() {
    return p(this.x, this.y - 1)
  }

  top() {
    return p(this.x, this.y + 1)
  }

  add(offset) {
    return p(this.x + offset.x, this.y + offset.y)
  }

  neighbors(max) {
    const neighbors = []
    if (this.y > 0) neighbors.push(this.top())
    if (this.x < max) neighbors.push(this.right())
    if (this.y < max) neighbors.push(this.bottom())
    if (this.x > 0) neighbors.push(this.left())
    return neighbors
  }

  toString() {
    return `(${this.x},${this.y})`
  }

  abs() {
    return p(Math.abs(this.x), Math.abs(this.y))
  }

  isLarger(p) {
    return this !== p && this.x >= p.x && this.y > p.y
  }
}
