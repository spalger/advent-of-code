import { strictEqual } from 'assert'
import * as Fs from 'fs'
import * as Path from 'path'

import { PointMap } from '../lib/point_map'
import { MazeGraph, Node } from '../lib/maze_graph'
import { Point } from '../lib/point'
import { shift } from '../lib/array'
import { memoize } from '../lib/fn'

const read = (p: string) => Fs.readFileSync(Path.resolve(__dirname, p), 'utf-8')

const portalCache = new Map<string, Portal>()
class Portal {
  static forLabel(label: string) {
    const cached = portalCache.get(label)
    if (cached) {
      return cached
    }

    const portal = new Portal(label)
    portalCache.set(label, portal)
    return portal
  }

  public i = portalCache.size
  private constructor(public readonly label: string) {}
  toString() {
    return `@`
  }
}

function parseMaze(input: string) {
  const baseMap = PointMap.fromString(input)
  const portalsByPoint = new Map<Point, Portal>()

  const isStructural = (ent: string): ent is '#' | '.' =>
    ent === '#' || ent === '.'

  // map the basemap to its structural components and identify the portals
  // when we find a letter with another letter next to it, and a . in the same
  // direction. Cache those in the portalsByPoint map and insert them next
  const map: PointMap<Portal | '#' | '.'> = baseMap.map((ent, point) => {
    if (isStructural(ent)) {
      return ent
    }

    for (const [neighbor, nEnt] of baseMap.neighbors(point)) {
      if (isStructural(nEnt)) {
        continue
      }

      const delta = neighbor.sub(point)
      const portalLoc = neighbor.add(delta)

      if (baseMap.points.get(portalLoc) !== '.') {
        return
      }

      portalsByPoint.set(
        portalLoc,
        Portal.forLabel(
          neighbor.y > point.y || neighbor.x < point.x
            ? `${nEnt}${ent}`
            : `${ent}${nEnt}`,
        ),
      )
    }
  })

  for (const [point, portal] of portalsByPoint) {
    map.points.set(point, portal)
  }

  const graph = MazeGraph.fromPointMap({
    map,
    baseMap,
  })

  let start
  let end
  const portalNodes = new Map<Portal, Node<Portal>[]>()
  for (const node of graph.nodes) {
    if (node.ent) {
      if (node.ent.label === 'AA') {
        start = node
      } else if (node.ent.label === 'ZZ') {
        end = node
      } else {
        portalNodes.set(node.ent, [...(portalNodes.get(node.ent) ?? []), node])
      }
    }
  }

  if (!start || !end) {
    throw new Error('missing start or end')
  }

  const getOtherEndOfPortal = memoize((node: Node<Portal>) => {
    if (!node.ent) {
      throw new Error('not a portal node')
    }

    const other = portalNodes.get(node.ent)?.find((n) => n !== node)
    if (!other) {
      throw new Error(`portal ${node.ent.label} can't be used`)
    }

    return other
  })

  const isOnOuterRing = memoize((node: Node<Portal>) => {
    return (
      node.loc.x === map.minX ||
      node.loc.x === map.maxX ||
      node.loc.y === map.minY ||
      node.loc.y === map.maxY
    )
  })

  return {
    graph,
    start,
    end,
    isOnOuterRing,
    getOtherEndOfPortal,
  }
}

function findShortestPathThroughMaze(input: string, recursive = false) {
  const { start, end, getOtherEndOfPortal, isOnOuterRing } = parseMaze(input)

  type Task = {
    loc: Node<Portal>
    level: number
    visited: string[]
    distance: number
  }

  let shortest: undefined | number

  const distanceCache = new Map<string, number>()
  const queue: Task[] = [
    {
      loc: start,
      level: 0,
      visited: [`outer AA, level 0`],
      distance: 0,
    },
  ]

  while (queue.length) {
    const { visited, level, loc, distance } = shift(queue)

    if (shortest && shortest < distance) {
      continue
    }

    for (const [neighbor, stepLength] of loc.edges) {
      // we can't go back through the start
      if (neighbor === start) {
        continue
      }

      const neighborDistance = distance + stepLength

      // did we really reach the end?
      if (neighbor === end) {
        if (level === 0 && (!shortest || shortest > neighborDistance)) {
          shortest = neighborDistance
        }
        continue
      }

      const nextKey = `${neighbor.loc.x},${neighbor.loc.y},${level}`

      // have we already been here?
      if (visited.includes(nextKey)) {
        continue
      }

      // have we gotten here faster somehow?
      const shortestToHere = distanceCache.get(nextKey)
      if (shortestToHere && shortestToHere < neighborDistance) {
        continue
      }
      distanceCache.set(nextKey, neighborDistance)

      if (neighbor.ent) {
        // handle stepping into a portal
        const nextLevel = recursive
          ? isOnOuterRing(neighbor)
            ? level - 1
            : level + 1
          : level

        if (level < 0) {
          // there aren't any negative levels
          continue
        }

        queue.push({
          loc: getOtherEndOfPortal(neighbor),
          level: nextLevel,
          visited: [...visited, nextKey],
          distance: neighborDistance + 1,
        })
      } else {
        // handle stepping to a normal space
        queue.push({
          loc: neighbor,
          level,
          visited: [...visited, nextKey],
          distance: neighborDistance,
        })
      }
    }
  }

  return shortest
}

export function test() {
  strictEqual(findShortestPathThroughMaze(read('test-maze1.txt')), 23)
  strictEqual(findShortestPathThroughMaze(read('test-maze2.txt')), 58)
  strictEqual(findShortestPathThroughMaze(read('test-maze3.txt'), true), 396)
}

export function part1(input: string) {
  console.log(
    'the shortest path from AA to ZZ is',
    findShortestPathThroughMaze(input),
  )
}

export function part2(input: string) {
  console.log(
    'the shortest path from AA to ZZ is',
    findShortestPathThroughMaze(input, true),
  )
}
