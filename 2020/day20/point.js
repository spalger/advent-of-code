/** @type {Map<number, Map<number, Point>>} */
const pointCache = new Map()

const p = (x, y) => {
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

  below() {
    return p(this.x, this.y + 1)
  }

  above() {
    return p(this.x, this.y - 1)
  }

  neighbors(max) {
    const neighbors = []
    if (this.y > 0) neighbors.push(this.above())
    if (this.x < max) neighbors.push(this.right())
    if (this.y < max) neighbors.push(this.below())
    if (this.x > 0) neighbors.push(this.left())
    return neighbors
  }

  toString() {
    return `(${this.x},${this.y})`
  }
}

module.exports = { p }
