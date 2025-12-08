import chalk from 'chalk'
import stripAnsi from 'strip-ansi'

import { PointMap } from './point_map.ts'
import { type Point } from './point.ts'
import { shift, last } from './array.ts'

const colors = [
  chalk.cyan,
  chalk.magenta,
  chalk.green,
  chalk.yellow,
  chalk.blue,
]

const getColor = () => {
  const color = shift(colors)
  colors.push(color)
  return color
}

export type Node<Ent> = {
  readonly loc: Point
  readonly ent: Ent | null
  readonly edges: Map<Node<Ent>, number>
}

export class MazeGraph<Ent> {
  static fromPointMap<Ent>({
    map,
    baseMap,
    starts = new Set(),
  }: {
    // a map of ., #, and Ent values which will be used to define the graph of the maze
    map: PointMap<Ent | '.' | '#'>
    // an optional map from the source used for debugging/toString()
    baseMap?: PointMap<unknown>
    starts?: Set<Point>
  }) {
    const nodesByLoc = new Map<Point, Node<Ent>>()
    for (const [loc, ent] of map.points) {
      if (ent !== '#') {
        nodesByLoc.set(loc, {
          loc,
          ent: ent === '.' ? null : ent,
          edges: new Map<Node<Ent>, number>(),
        })
      }
    }

    const nodes = new Set(nodesByLoc.values())

    // populate edges
    for (const a of nodes) {
      for (const [neighbor] of map.neighbors(a.loc)) {
        const b = nodesByLoc.get(neighbor)
        if (b !== undefined) {
          a.edges.set(b, 1)
        }
      }
    }

    // find nodes which lead nowhere and prune them from the graph
    const deadEnds = new Set<Node<Ent>>()
    const isDeadEnd = (node: Node<Ent>) =>
      !starts.has(node.loc) && node.ent === null && node.edges.size <= 1

    for (const node of nodes) {
      if (isDeadEnd(node)) {
        deadEnds.add(node)
      }
    }

    for (const node of deadEnds) {
      nodes.delete(node)
      nodesByLoc.delete(node.loc)

      if (node.edges.size) {
        const [[neighbor]] = node.edges
        neighbor.edges.delete(node)

        if (isDeadEnd(neighbor)) {
          deadEnds.add(neighbor)
        }
      }
    }

    // find nodes without anything in them and two edges, remove them from the
    // graph and update the distance on their neighbors
    for (const node of nodes) {
      if (!starts.has(node.loc) && node.ent === null && node.edges.size === 2) {
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

    const startNodes = new Set(
      Array.from(starts).map((p) => {
        const node = nodesByLoc.get(p)
        if (!node) {
          throw new Error(`reducing the graph got rid of root at ${p} somehow`)
        }
        return node
      }),
    )

    return new MazeGraph<Ent>(startNodes, nodes, map, baseMap)
  }

  public readonly starts: Set<Node<Ent>>
  public readonly nodes: Set<Node<Ent>>
  public readonly map: PointMap<Ent | '#' | '.'>
  public readonly baseMap?: PointMap<unknown>
  private constructor(
    starts: Set<Node<Ent>>,
    nodes: Set<Node<Ent>>,
    map: PointMap<Ent | '#' | '.'>,
    baseMap?: PointMap<unknown>,
  ) {
    this.starts = starts
    this.nodes = nodes
    this.map = map
    this.baseMap = baseMap
  }

  toString() {
    const SPACE = '.'
    const START = chalk.magentaBright('@')
    const INTERSECTION = chalk.bold.cyanBright('+')
    const CONFLICT = chalk.bold.red('!')

    const getPath = (from: Node<Ent>, to: Node<Ent>) => {
      const paths = [[from.loc]]
      while (paths.length) {
        const path = shift(paths)

        for (const [neighbor, ent] of this.map.neighbors(last(path))) {
          if (path.includes(neighbor) || ent === '#') {
            continue
          }

          if (neighbor === to.loc) {
            return [...path, to.loc]
          }

          paths.unshift([...path, neighbor])
        }
      }
    }

    const map = new Map<Point, string>()

    // initialize the map with the ent values from the baseMap or map
    for (const [point, ent] of (this.baseMap ?? this.map).points) {
      map.set(point, chalk.gray(ent))
    }

    // overwrite the points which are reprensented in our graph
    for (const node of this.nodes) {
      if (node.ent) {
        map.set(node.loc, chalk.greenBright(node.ent))
      } else if (this.starts.has(node)) {
        map.set(node.loc, START)
      } else {
        map.set(node.loc, INTERSECTION)
      }

      // highlight the path from this node to its edges
      for (const edge of node.edges.keys()) {
        const path = getPath(node, edge)
        if (!path) {
          throw new Error(
            `unable to find path between node at ${node.loc} and edge at ${edge.loc}`,
          )
        }

        if (path.length > 2) {
          const color = getColor()

          // don't highlight the start and end of this path
          for (const point of path.slice(1, -1)) {
            map.set(
              point,
              // highlight conflicts if they are found
              map.has(point) && stripAnsi(map.get(point)!) !== SPACE
                ? CONFLICT
                : color(SPACE),
            )
          }
        }
      }
    }

    return PointMap.fromIterable(map).toString()
  }
}
