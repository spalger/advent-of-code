import { type Point } from './point.ts'

export class Line {
  public from: Point
  public to: Point

  constructor(from: Point, to: Point) {
    this.from = from
    this.to = to
  }

  get length() {
    return Math.hypot(this.to.x - this.from.x, this.to.y - this.from.y)
  }

  intersects(other: Line): 'none' | 'colinear' | 'endpoint' | 'cross' {
    const r = this.to.sub(this.from)
    const s = other.to.sub(other.from)
    const det = cross(r.x, r.y, s.x, s.y)

    if (det === 0) {
      const qp = other.from.sub(this.from)
      if (cross(qp.x, qp.y, r.x, r.y) !== 0) {
        return 'none'
      }
      // colinear
      const useX = Math.abs(r.x) >= Math.abs(r.y)
      let a1 = useX ? this.from.x : this.from.y
      let a2 = useX ? this.to.x : this.to.y
      let b1 = useX ? other.from.x : other.from.y
      let b2 = useX ? other.to.x : other.to.y

      if (a1 > a2) [a1, a2] = [a2, a1]
      if (b1 > b2) [b1, b2] = [b2, b1]

      const overlapStart = Math.max(a1, b1)
      const overlapEnd = Math.min(a2, b2)

      if (overlapEnd < overlapStart) {
        return 'none' // colinear but disjoint
      }
      if (overlapEnd === overlapStart) {
        return 'endpoint' // touch at a single point
      }
      return 'colinear' // overlap with non-zero length
    }

    const qp = other.from.sub(this.from)
    const t = cross(qp.x, qp.y, s.x, s.y) / det
    const u = cross(qp.x, qp.y, r.x, r.y) / det
    const epsilon = 1e-10

    if (t > epsilon && t < 1 - epsilon && u > epsilon && u < 1 - epsilon) {
      return 'cross' // proper interior intersection
    } else if (
      t >= -epsilon &&
      t <= 1 + epsilon &&
      u >= -epsilon &&
      u <= 1 + epsilon
    ) {
      return 'endpoint' // intersect only at an endpoint
    } else {
      return 'none'
    }

    function cross(ax: number, ay: number, bx: number, by: number): number {
      return ax * by - ay * bx
    }
  }

  toString() {
    return `Line(${this.from.toString()} -> ${this.to.toString()})`
  }
}
