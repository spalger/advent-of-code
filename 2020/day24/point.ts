const pointCache = new Map<number, Map<number, HexPoint>>()

export const p = (x: number, y: number) => {
  let ys = pointCache.get(x)
  if (!ys) {
    ys = new Map()
    pointCache.set(x, ys)
  }
  let point = ys.get(y)
  if (!point) {
    point = new HexPoint(x, y)
    ys.set(y, point)
  }
  return point
}

export class HexPoint {
  constructor(public readonly x: number, public readonly y: number) {}

  nw() {
    return p(this.x - 1, this.y + 1)
  }
  ne() {
    return p(this.x, this.y + 1)
  }
  e() {
    return p(this.x + 1, this.y)
  }
  w() {
    return p(this.x - 1, this.y)
  }
  sw() {
    return p(this.x, this.y - 1)
  }
  se() {
    return p(this.x + 1, this.y - 1)
  }

  neighbors() {
    return [this.nw(), this.ne(), this.e(), this.sw(), this.se(), this.w()]
  }
}
