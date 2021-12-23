export class Point3d {
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
