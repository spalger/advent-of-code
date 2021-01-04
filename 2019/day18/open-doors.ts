import { deepStrictEqual } from 'assert'

import chalk from 'chalk'

import { p, Point } from '../lib/point'
import { toLines, dedent } from '../lib/string'
import { repeat, shift } from '../lib/array'

class Key {
  constructor(public readonly name: string, public readonly door: string) {}
}

class Door {
  constructor(public readonly name: string) {}
}

type Ent = '.' | Key | Door

type Node = {
  readonly loc: Point
  readonly ent: Key | Door | null
  readonly edges: Map<Node, number>
}

class Maze {
  static fromInput(input: string) {
    const map: Maze['map'] = new Map()
    const starts = new Set<Point>()

    const lines = toLines(input)
    for (const [li, line] of lines.entries()) {
      const y = lines.length - li - 1
      for (const [x, char] of line.split('').entries()) {
        const point = p(x, y)
        if (char === '#') {
          // ignore walls
        } else if (char === '@') {
          map.set(point, '.')
          starts.add(point)
        } else if (char === '.') {
          map.set(point, '.')
        } else if (char === char.toLowerCase()) {
          map.set(point, new Key(char, char.toUpperCase()))
        } else {
          map.set(point, new Door(char))
        }
      }
    }

    if (!starts.size) {
      throw new Error('never found a start')
    }

    let minX = Infinity
    let maxX = 0
    let minY = Infinity
    let maxY = 0
    for (const point of map.keys()) {
      minX = Math.min(point.x, minX)
      maxX = Math.max(point.x, maxX)
      minY = Math.min(point.y, minY)
      maxY = Math.max(point.y, maxY)
    }

    return new Maze(map, starts, minX, maxX, minY, maxY)
  }

  constructor(
    public readonly map: Map<Point, Ent>,
    public readonly starts: Set<Point>,
    public readonly minX: number,
    public readonly maxX: number,
    public readonly minY: number,
    public readonly maxY: number,
  ) {}

  neighbors(p: Point, exclude?: Set<Point>) {
    const neighbors: [Point, Exclude<Ent, '#'>][] = []

    if (p.y < this.maxY) {
      const top = p.top()
      if (!exclude || !exclude.has(top)) {
        const ent = this.map.get(top)
        if (ent) {
          neighbors.push([top, ent])
        }
      }
    }

    if (p.x < this.maxX) {
      const right = p.right()
      if (!exclude || !exclude.has(right)) {
        const ent = this.map.get(right)
        if (ent) {
          neighbors.push([right, ent])
        }
      }
    }

    if (p.y > this.minY) {
      const bottom = p.bottom()
      if (!exclude || !exclude.has(bottom)) {
        const ent = this.map.get(bottom)
        if (ent) {
          neighbors.push([bottom, ent])
        }
      }
    }

    if (p.x > this.minX) {
      const left = p.left()
      if (!exclude || !exclude.has(left)) {
        const ent = this.map.get(left)
        if (ent) {
          neighbors.push([left, ent])
        }
      }
    }

    return neighbors
  }
}

class Graph {
  static fromMaze(maze: Maze) {
    const nodesByLoc = new Map(
      Array.from(maze.map).map(([loc, ent]) => [
        loc,
        {
          loc,
          ent: ent === '.' ? null : ent,
          edges: new Map<Node, number>(),
        },
      ]),
    )

    const nodes = new Set(nodesByLoc.values())

    // populate edges
    for (const a of nodes) {
      for (const [neighbor] of maze.neighbors(a.loc)) {
        const b = nodesByLoc.get(neighbor)
        if (!b) {
          throw new Error(`missing node for ${b}`)
        }

        a.edges.set(b, 1)
      }
    }

    // find nodes which lead nowhere and prune them from the graph
    const deadEnds = new Set<Node>()
    const isDeadEnd = (node: Node) =>
      !maze.starts.has(node.loc) && node.ent === null && node.edges.size === 1
    for (const node of nodes) {
      if (isDeadEnd(node)) {
        deadEnds.add(node)
      }
    }
    for (const node of deadEnds) {
      const [[neighbor]] = node.edges
      neighbor.edges.delete(node)
      nodes.delete(node)
      nodesByLoc.delete(node.loc)

      if (isDeadEnd(neighbor)) {
        deadEnds.add(neighbor)
      }
    }

    // find nodes without anything in them and two edges, remove them from the
    // graph and update the distance on their neighbors
    for (const node of nodes) {
      if (
        !maze.starts.has(node.loc) &&
        node.ent === null &&
        node.edges.size === 2
      ) {
        const [[a, aDistance], [b, bDistance]] = node.edges

        const newDistance = aDistance + bDistance
        a.edges.delete(node)
        a.edges.set(b, newDistance)

        b.edges.delete(node)
        b.edges.set(a, newDistance)

        nodes.delete(node)
        nodesByLoc.delete(node.loc)
      }
    }

    const roots = new Set(
      Array.from(maze.starts)
        .map((p) => nodesByLoc.get(p))
        .filter((n): n is Node => !!n),
    )

    if (!roots.size) {
      throw new Error('reducing the graph got rid of the root somehow')
    }

    return new Graph(maze, roots, nodes)
  }

  constructor(
    public readonly maze: Maze,
    public readonly roots: Set<Node>,
    public readonly nodes: Set<Node>,
  ) {}

  toString() {
    const map = new Map<Point, string>()

    for (const node of this.nodes) {
      if (node.ent) {
        map.set(node.loc, chalk.green(node.ent?.name))
      } else if (this.roots.has(node)) {
        map.set(node.loc, chalk.white('@'))
      } else {
        map.set(node.loc, chalk.bold.cyan('+'))
      }

      highlightEdges: for (const edge of node.edges.keys()) {
        const paths = [[node.loc]]
        while (paths.length) {
          const path = shift(paths)

          for (const [neighbor] of this.maze.neighbors(path[path.length - 1])) {
            if (path.includes(neighbor)) {
              continue
            }

            if (neighbor === edge.loc) {
              for (const p of path.slice(1)) {
                map.set(
                  p,
                  map.get(p) && map.get(p) !== chalk.grey('.')
                    ? chalk.red('!')
                    : chalk.grey('.'),
                )
              }
              continue highlightEdges
            }

            paths.unshift([...path, neighbor])
          }
        }
      }
    }

    const lines = []
    for (let y = this.maze.maxY + 1; y >= this.maze.minY - 1; y--) {
      let line = ''

      if (y < 10) {
        line += ` ${y} `
      } else {
        line += `${y} `
      }

      for (let x = this.maze.minX - 1; x <= this.maze.maxX + 1; x++) {
        const point = p(x, y)
        if (map.has(point)) {
          line += map.get(point)!
        } else {
          line += '#'
        }
      }
      lines.push(line)
    }

    const xs = repeat(
      this.maze.maxX - this.maze.minX + 3,
      (i) => this.maze.minX - 1 + i,
    )

    lines.push(
      '   ' + xs.map((i) => (i < 10 ? i : Math.floor(i / 10))).join(''),
      '   ' + xs.map((i) => (i < 10 ? ' ' : i % 10)).join(''),
    )

    return lines.join('\n')
  }
}

type Path = { nodes: Node[]; distance: number }
function getShortestPath(
  from: Node,
  to: Node,
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

export function findShortestPathThroughMaze(input: string) {
  const graph = Graph.fromMaze(Maze.fromInput(input))
  console.log(graph.toString())

  if (graph.roots.size !== 1) {
    throw new Error(
      'findShortestPathThroughMaze() only supports mazes with a single starting point',
    )
  }

  // index some useful info from the graph
  const allKeys: Key[] = []
  const keyNodes = new Map<Key, Node>()
  const keyNodesByName = new Map<string, Node>()
  const doorNodesByName = new Map<string, Node>()
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
  const queue = [
    {
      keyNames: [] as string[],
      unlockedDoorNames: [] as string[],
      node: [...graph.roots][0],
      distance: 0,
    },
  ]

  while (queue.length) {
    const task = shift(queue)

    const [cur, ...otherKeys] = task.keyNames
    const cacheKey = `${cur}|${otherKeys.sort().join(',')}`

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

    for (const nextKey of allKeys) {
      if (task.keyNames.includes(nextKey.name)) {
        // already picked up this key
        continue
      }

      const nextNode = keyNodes.get(nextKey)!
      const path = getShortestPath(task.node, nextNode, task.unlockedDoorNames)
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
        node: nextNode,
      })
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
  console.log(
    'the shortest path through the maze is',
    findShortestPathThroughMaze(input),
  )
}
