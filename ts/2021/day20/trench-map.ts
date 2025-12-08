import { strictEqual } from 'assert'

import { toLines } from '../../common/string.ts'
import { p, Point } from '../../common/point.ts'
import { bitsToInt } from '../../common/number.ts'

type Bit = 1 | 0
const charToBit = (c: string): Bit => (c === '#' ? 1 : 0)

class Bounds {
  static forPoints(points: Iterable<Point>) {
    let bounds = new Bounds(0, 0, 0, 0)
    for (const point of points) {
      bounds = bounds.expandToContain(point)
    }
    return bounds
  }

  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number
  constructor(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ) {
    this.minX = minX
    this.maxX = maxX
    this.minY = minY
    this.maxY = maxY
  }

  isInside(point: Point) {
    return (
      point.x >= this.minX &&
      point.x <= this.maxX &&
      point.y >= this.minY &&
      point.y <= this.maxY
    )
  }

  expandToContain(point: Point) {
    return new Bounds(
      Math.min(this.minX, point.x),
      Math.max(this.maxX, point.x),
      Math.min(this.minY, point.y),
      Math.max(this.maxY, point.y),
    )
  }

  expand(size: number) {
    return new Bounds(
      this.minX - size,
      this.maxX + size,
      this.minY - size,
      this.maxY + size,
    )
  }
}

class Img {
  static parse(input: string) {
    const lines = toLines(input)
    const algo = lines[0].split('').map(charToBit)
    const active = new Set<Point>()

    let y = lines.length - 1
    for (const line of lines.slice(1)) {
      y -= 1
      let x = -1
      for (const char of line) {
        x += 1
        const bit: Bit = char === '#' ? 1 : 0
        if (bit) {
          active.add(p(x, y))
        }
      }
    }

    return new Img(algo, 0, 0, active, Bounds.forPoints(active))
  }

  algo: Bit[]
  infinityBit: Bit
  iterations: number
  active: Set<Point>
  bounds: Bounds
  constructor(
    algo: Bit[],
    infinityBit: Bit,
    iterations: number,
    active: Set<Point>,
    bounds: Bounds,
  ) {
    this.algo = algo
    this.infinityBit = infinityBit
    this.iterations = iterations
    this.active = active
    this.bounds = bounds
  }

  readBit(point: Point) {
    const active = this.bounds.isInside(point)
      ? this.active.has(point)
      : this.infinityBit
    return active ? 1 : 0
  }

  getNewBit(bits: Bit[]) {
    const i = bitsToInt(bits)
    if (i < 0 || i > this.algo.length) {
      throw new Error(
        `expected bits to convert to a number between 0 and ${this.algo.length}`,
      )
    }
    return this.algo[i]
  }

  enhance(): Img {
    const newActive = new Set<Point>()
    // iterate through two extra pixels in every direction so we see every pixel when checking neighbors
    const iterBounds = this.bounds.expand(1)
    for (let y = iterBounds.minY; y <= iterBounds.maxY; y++) {
      for (let x = iterBounds.minX; x <= iterBounds.maxX; x++) {
        const point = p(x, y)
        const bit = this.getNewBit([
          this.readBit(point.topLeft()),
          this.readBit(point.top()),
          this.readBit(point.topRight()),
          this.readBit(point.left()),
          this.readBit(point),
          this.readBit(point.right()),
          this.readBit(point.bottomLeft()),
          this.readBit(point.bottom()),
          this.readBit(point.bottomRight()),
        ])

        if (bit === 1) {
          newActive.add(point)
        }
      }
    }

    return new Img(
      this.algo,
      this.getNewBit(new Array(9).fill(this.infinityBit)),
      this.iterations + 1,
      newActive,
      Bounds.forPoints(newActive),
    )
  }

  print() {
    // render some extra cells
    const iterBounds = this.bounds.expand(2)

    const lines: string[] = []

    for (let y = iterBounds.maxY; y >= iterBounds.minY; y--) {
      let line = ''
      for (let x = iterBounds.minX; x <= iterBounds.maxX; x++) {
        const point = p(x, y)
        const char = this.readBit(point) ? '#' : '.'
        line += char
      }
      lines.push(line)
    }

    console.log(`iterations ${this.iterations}:`)
    console.log(lines.join('\n'))
    console.log()
  }
}

function enhanceN(input: string, iterations: number) {
  let image = Img.parse(input)
  for (let i = 1; i <= iterations; i++) {
    image = image.enhance()
  }
  image.print()
  console.log(
    'after',
    iterations,
    'enhancement iterations there are',
    image.active.size,
    'pixels active',
  )
  return image.active.size
}

export function test(input: string) {
  strictEqual(enhanceN(input, 2), 35)
  strictEqual(enhanceN(input, 50), 3351)
}

export function part1(input: string) {
  strictEqual(enhanceN(input, 2), 5571)
}

export function part2(input: string) {
  strictEqual(enhanceN(input, 50), 17965)
}
