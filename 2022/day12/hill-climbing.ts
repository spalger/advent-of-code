import { deepStrictEqual } from 'assert'
import { dedent } from '../../common/string'
import { PointMap } from '../../common/point_map'
import { Point } from '../../common/point'
import { shift } from '../../common/array'

function aToN(char: string) {
  return char.charCodeAt(0) - 97
}

function nToA(number: number) {
  return String.fromCharCode(number + 97)
}

type Maze = { start: Point; end: Point; map: PointMap<number> }

function parse(input: string): Maze {
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

  return { start, end, map }
}

type TopoGroup = {
  id: string
  points: Point[]
  next: TopoGroup[]
}

function topoGroup(maze: Maze) {
  const groupByPoint = new Map<Point, TopoGroup>()
  const groups: TopoGroup[] = []

  function getGroup(point: Point) {
    const existing = groupByPoint.get(point)
    if (existing) {
      return existing
    }

    const nextSteps = new Set<Point>()
    const ent = maze.map.get(point)
    const points = new Set([point])
    for (const p of points) {
      for (const [n, nent] of maze.map.neighbors(p)) {
        if (nent === ent) {
          points.add(n)
        } else if (nent <= ent + 1) {
          nextSteps.add(n)
        }
      }
    }

    const group: TopoGroup = {
      id: `${nToA(ent)} ${
        Array.from(points).sort((a, b) => {
          const x = a.x - b.x
          return x === 0 ? b.y - a.y : x
        })[0]
      }`,
      points: Array.from(points),
      next: [],
    }

    // store group in cache without populating "next" so we can
    // recurse and not duplicate work
    for (const p of points) {
      groupByPoint.set(p, group)
    }
    groups.push(group)

    for (const n of nextSteps) {
      const g = getGroup(n)
      if (!group.next.includes(g)) {
        group.next.push(g)
      }
    }

    return group
  }

  for (const point of maze.map.points.keys()) {
    getGroup(point)
  }

  return {
    all: groups,
    byPoint: groupByPoint,
    get(p: Point) {
      const g = groupByPoint.get(p)
      if (!g) {
        throw new Error(`point ${p} is not in a group`)
      }
      return g
    },
  }
}

function solve(maze: Maze) {
  const groups = topoGroup(maze)
  const s = groups.get(maze.start)
  const e = groups.get(maze.end)

  const valid: TopoGroup[][] = []
  const queue: TopoGroup[][] = [[s]]
  while (queue.length) {
    const path = shift(queue)
    for (const next of path[0].next) {
      if (path.includes(next)) {
        continue
      } else {
        if (next === e) {
          valid.push([e, ...path].reverse())
        } else {
          queue.push([next, ...path])
        }
      }
    }
  }

  console.log(valid)
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

  deepStrictEqual(solve(maze), 31)
}

export function part1(input: string) {
  const maze = parse(input)
  console.log(
    'the shortest path to the signal strength is',
    solve(maze),
    'steps',
  )
}
