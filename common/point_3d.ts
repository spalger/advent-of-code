export class Point3d {
  static min(a: Point3d, b: Point3d) {
    return new Point3d(
      Math.min(a.x, b.x),
      Math.min(a.y, b.y),
      Math.min(a.z, b.z),
    )
  }

  static max(a: Point3d, b: Point3d) {
    return new Point3d(
      Math.max(a.x, b.x),
      Math.max(a.y, b.y),
      Math.max(a.z, b.z),
    )
  }

  public key: string
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {
    this.key = `(${this.x},${this.y},${this.z})`
  }

  subtract(other: Point3d) {
    return new Point3d(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  add(other: Point3d) {
    return new Point3d(this.x + other.x, this.y + other.y, this.z + other.x)
  }

  valueOf() {
    return this.key
  }

  toString() {
    return this.key
  }

  mdist(other: Point3d) {
    return (
      Math.abs(this.x - other.x) +
      Math.abs(this.y - other.y) +
      Math.abs(this.z - other.z)
    )
  }
}
