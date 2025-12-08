import { deepStrictEqual } from 'assert'

import { p, Point } from '../../common/point.ts'
import { dedent } from '../../common/string.ts'
import { shift } from '../../common/array.ts'
import { MazeGraph, Node } from '../../common/maze_graph.ts'
import { PointMap } from '../../common/point_map.ts'

class Key {
  constructor(public readonly name: string, public readonly door: string) {}

  toString() {
    return this.name
  }
}

class Door {
  constructor(public readonly name: string) {}

  toString() {
    return this.name
  }
}

type Ent = Key | Door

function parseMap(input: string) {
  const starts = new Set<Point>()
  return {
    starts,
    map: PointMap.fromString(input).map((ent, point) => {
      if (ent === '#') {
        return '#'
      }

      if (ent === '@') {
        starts.add(point)
        return '.'
      }

      if (ent === '.') {
        return '.'
      }

      if (ent === ent.toLowerCase()) {
        return new Key(ent, ent.toUpperCase())
      }

      return new Door(ent)
    }),
  }
}

type Path = { nodes: Node<Ent>[]; distance: number }
function getShortestPath(
  from: Node<Ent>,
  to: Node<Ent>,
  unlockedDoorNames: string[],
): Path | null {
  let shortestPath = null

  const queue = [{ nodes: [from], distance: 0 }]

  while (queue.length) {
    const { nodes, distance } = shift(queue)

    if (shortestPath && distance > shortestPath.distance) {
      // ignore this path, we've already found a shorter one
      continue
    }

    const current = nodes[nodes.length - 1]
    for (const [next, stepSize] of current.edges) {
      if (nodes.includes(next)) {
        continue
      }

      if (next === to) {
        const path = {
          nodes: [...nodes, next],
          distance: distance + stepSize,
        }

        if (!shortestPath || shortestPath.distance > path.distance) {
          shortestPath = path
        }
      }

      if (
        next.ent instanceof Key &&
        !unlockedDoorNames.includes(next.ent.door)
      ) {
        continue
      }

      if (
        next.ent instanceof Door &&
        !unlockedDoorNames.includes(next.ent.name)
      ) {
        continue
      }

      queue.unshift({
        nodes: [...nodes, next],
        distance: distance + stepSize,
      })
    }
  }

  return shortestPath
}

export function findShortestPathThroughMaze(graph: string | MazeGraph<Ent>) {
  graph =
    graph instanceof MazeGraph ? graph : MazeGraph.fromPointMap(parseMap(graph))

  console.log(graph.toString())

  // index some useful info from the graph
  const allKeys: Key[] = []
  const keyNodes = new Map<Key, Node<Ent>>()
  const keyNodesByName = new Map<string, Node<Ent>>()
  const doorNodesByName = new Map<string, Node<Ent>>()
  for (const node of graph.nodes) {
    if (node.ent instanceof Key) {
      keyNodes.set(node.ent, node)
      keyNodesByName.set(node.ent.door, node)
      allKeys.push(node.ent)
    } else if (node.ent instanceof Door) {
      doorNodesByName.set(node.ent.name, node)
    }
  }

  let shortestDistance

  const partialDistanceCache = new Map<string, number>()
  type Task = {
    keyNames: string[]
    unlockedDoorNames: string[]
    nodes: Node<Ent>[]
    distance: number
  }
  const queue: Task[] = [
    {
      keyNames: [],
      unlockedDoorNames: [],
      nodes: [...graph.starts],
      distance: 0,
    },
  ]

  while (queue.length) {
    const task = shift(queue)

    const current = task.nodes.map((n) => n.ent?.name).join(',')
    const collected = task.keyNames.slice().sort().join(',')
    const cacheKey = `${current}|${collected}`

    const fastestToHere = partialDistanceCache.get(cacheKey)
    if (!fastestToHere || fastestToHere > task.distance) {
      partialDistanceCache.set(cacheKey, task.distance)
    } else {
      // another path got to this state faster
      continue
    }

    if (shortestDistance && task.distance >= shortestDistance) {
      // another path completed with a shorter distances
      continue
    }

    for (const node of task.nodes) {
      for (const nextKey of allKeys) {
        if (task.keyNames.includes(nextKey.name)) {
          // already picked up this key
          continue
        }

        const nextNode = keyNodes.get(nextKey)!
        const path = getShortestPath(node, nextNode, task.unlockedDoorNames)
        if (!path) {
          // can't reach key
          continue
        }

        const keyNames = [nextKey.name, ...task.keyNames]
        const unlockedDoorNames = [nextKey.door, ...task.unlockedDoorNames]
        const distance = task.distance + path.distance

        if (keyNames.length === allKeys.length) {
          if (!shortestDistance || shortestDistance > distance) {
            shortestDistance = distance
          }

          continue
        }

        queue.push({
          keyNames,
          unlockedDoorNames,
          distance,
          nodes: task.nodes.map((n) => (n === node ? nextNode : n)),
        })
      }
    }
  }

  return shortestDistance
}

export function test() {
  deepStrictEqual(
    findShortestPathThroughMaze(dedent`
      #########
      #b.A.@.a#
      #########
    `),
    8,
  )

  deepStrictEqual(
    findShortestPathThroughMaze(dedent`
      ########################
      #...............b.C.D.f#
      #.######################
      #.....@.a.B.c.d.A.e.F.g#
      ########################
    `),
    132,
  )

  deepStrictEqual(
    findShortestPathThroughMaze(dedent`
      #################
      #i.G..c...e..H.p#
      ########.########
      #j.A..b...f..D.o#
      ########@########
      #k.E..a...g..B.n#
      ########.########
      #l.F..d...h..C.m#
      #################
    `),
    136,
  )

  deepStrictEqual(
    findShortestPathThroughMaze(dedent`
      ########################
      #@..............ac.GI.b#
      ###d#e#f################
      ###A#B#C################
      ###g#h#i################
      ########################
    `),
    81,
  )
}

export function part1(input: string) {
  const graph = MazeGraph.fromPointMap(parseMap(input))

  console.log(
    'the shortest path through the maze is',
    findShortestPathThroughMaze(graph),
  )
}

export function part2(input: string) {
  const { starts, map } = parseMap(input)

  for (let y = 39; y <= 41; y++) {
    for (let x = 39; x <= 41; x++) {
      if ((x === 39 || x === 41) && (y === 39 || y === 41)) {
        starts.add(p(x, y))
      } else {
        map.points.set(p(x, y), '#')
        starts.delete(p(x, y))
      }
    }
  }

  const graph = MazeGraph.fromPointMap({
    starts,
    map,
  })

  console.log(
    'the shortest path for all four robots is',
    findShortestPathThroughMaze(graph),
  )
}
