const point3dCache: Point3d[][][] = []

export function p3d(x: number, y: number, z: number) {
  point3dCache[x] ??= []
  point3dCache[x][y] ??= []

  if (!point3dCache[x][y][z]) {
    return (point3dCache[x][y][z] = new Point3d(x, y, z))
  } else {
    return point3dCache[x][y][z]
  }
}

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
  public readonly x: number
  public readonly y: number
  public readonly z: number
  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
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

  straightDist(other: Point3d) {
    return Math.sqrt(
      (this.x - other.x) ** 2 +
        (this.y - other.y) ** 2 +
        (this.z - other.z) ** 2,
    )
  }
}
