import { deepStrictEqual } from 'assert'
import { dedent } from '../../common/string.ts'
import { PointMap } from '../../common/point_map.ts'
import { Point } from '../../common/point.ts'

function aToN(char: string) {
  return char.charCodeAt(0) - 97
}

class Solver {
  readonly start: Point
  readonly end: Point
  readonly map: PointMap<number>
  constructor(start: Point, end: Point, map: PointMap<number>) {
    this.start = start
    this.end = end
    this.map = map
  }

  private readonly fastestCache = new Map<Point, Map<Point, Point[] | null>>()
  setFastestPath(from: Point, to: Point, path: Point[] | null) {
    const tos = this.fastestCache.get(from)
    if (tos) {
      tos.set(to, path)
    } else {
      this.fastestCache.set(from, new Map([[to, path]]))
    }

    return path
  }

  getFastestPath(from: Point, to: Point): Point[] | null {
    if (from === to) {
      return []
    }

    const cached = this.fastestCache.get(from)?.get(to)
    if (cached !== undefined) {
      return cached
    }

    const height = this.map.get(from)
    let shortest
    for (const [neighbor, nHeight] of this.map.neighbors(from)) {
      if (height > nHeight + 1) {
        continue
      }

      const next = this.getFastestPath(neighbor, to)
      if (!shortest || (next && next.length > shortest.length)) {
        shortest = next
      }
    }

    return this.setFastestPath(from, to, shortest ? [from, ...shortest] : null)
  }

  solve() {
    // populate cache by walking outward from the end, finding the shortest path from every point to the map
    const queue = new Set([this.end])
    for (const point of queue) {
      this.getFastestPath(point, this.end)
      for (const [neighbor] of this.map.neighbors(point)) {
        queue.add(neighbor)
      }
    }

    // use the cache to determine the fastest path from the start to the end
    return this.getFastestPath(this.start, this.end)
  }
}

function parse(input: string): Solver {
  let start: Point
  let end: Point
  const map = PointMap.fromString(input, (ent, point) => {
    if (ent.toLowerCase() === ent) {
      return aToN(ent)
    }

    if (ent === 'S') {
      start = point
      return aToN('a')
    }

    if (ent === 'E') {
      end = point
      return aToN('z')
    }

    throw new Error(`unexpected entity in map ${ent} at ${point}`)
  })

  if (start! === undefined || end! === undefined) {
    throw new Error(`start and/or end points were not defined`)
  }

  return new Solver(start, end, map)
}

export function test() {
  const maze = parse(
    dedent`
      Sabqponm
      abcryxxl
      accszExk
      acctuvwj
      abdefghi
    `,
  )

  deepStrictEqual(maze.solve(), 31)
}

export function part1(input: string) {
  const maze = parse(input)
  console.log(
    'the shortest path to the signal strength is',
    maze.solve(),
    'steps',
  )
}
