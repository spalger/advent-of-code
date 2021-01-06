import { PointMap } from '../lib/point_map'
import { MazeGraph, Node } from '../lib/maze_graph'
import { Point } from '../lib/point'
import { shift, last } from '../lib/array'

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

  return MazeGraph.fromPointMap({
    map,
    baseMap,
  })
}

export function test() {
  console.log(
    parseMaze(`
               A
               A
        #######.#########
        #######.........#
        #######.#######.#
        #######.#######.#
        #######.#######.#
        #####  B    ###.#
      BC...##  C    ###.#
        ##.##       ###.#
        ##...DE  F  ###.#
        #####    G  ###.#
        #########.#####.#
      DE..#######...###.#
        #.###..####.###.#
      FG..#########.....#
        ###########.#####
                   Z
                   Z
    `).toString(),
  )

  console.log(
    parseMaze(`
                         A
                         A
        #################.#############
        #.#...#...................#.#.#
        #.#.#.###.###.###.#########.#.#
        #.#.#.......#...#.....#.#.#...#
        #.#########.###.#####.#.#.###.#
        #.............#.#.....#.......#
        ###.###########.###.#####.#.#.#
        #.....#        A   C    #.#.#.#
        #######        S   P    #####.#
        #.#...#                 #......VT
        #.#.#.#                 #.#####
        #...#.#               YN....#.#
        #.###.#                 #####.#
      DI....#.#                 #.....#
        #####.#                 #.###.#
      ZZ......#               QG....#..AS
        ###.###                 #######
      JO..#.#.#                 #.....#
        #.#.#.#                 ###.#.#
        #...#..DI             BU....#..LF
        #####.#                 #.#####
      YN......#               VT..#....QG
        #.###.#                 #.###.#
        #.#...#                 #.....#
        ###.###    J L     J    #.#.###
        #.....#    O F     P    #.#...#
        #.###.#####.#.#####.#####.###.#
        #...#.#.#...#.....#.....#.#...#
        #.#####.###.###.#.#.#########.#
        #...#.#.....#...#.#.#.#.....#.#
        #.###.#####.###.###.#.#.#######
        #.#.........#...#.............#
        #########.###.###.#############
                 B   J   C
                 U   P   P
    `).toString(),
  )
}

export function part1(input: string) {
  const graph = parseMaze(input)
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

  const getOtherEndOfPortal = (node: Node<Portal>) => {
    if (!node.ent) {
      throw new Error('not a portal node')
    }

    const other = portalNodes.get(node.ent)?.find((n) => n !== node)
    if (!other) {
      throw new Error(`portal ${node.ent.label} can't be used`)
    }

    return other
  }

  type Task = { path: Node<Portal>[]; distance: number }

  const distanceCache = new Map()
  const queue: Task[] = [{ path: [start], distance: 0 }]

  while (queue.length) {
    const task = shift(queue)
    const pos = last(task.path)

    for (const [node, distance] of pos.edges) {
      if (task.path.includes(node)) {
        continue
      }

      let next: Task
      if (node !== end && node.ent) {
        next = {
          path: [...task.path, node, getOtherEndOfPortal(node)],
          distance: task.distance + distance + 1,
        }
      } else {
        next = {
          path: [...task.path, node],
          distance: task.distance + distance,
        }
      }

      const nextPos = last(next.path)
      if (distanceCache.get(nextPos) < next.distance) {
        continue
      }

      distanceCache.set(nextPos, next.distance)

      if (nextPos !== end) {
        queue.push(next)
      }
    }
  }

  console.log('the shortest path from AA to ZZ is', distanceCache.get(end))
}
