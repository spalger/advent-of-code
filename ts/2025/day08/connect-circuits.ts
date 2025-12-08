import { strictEqual } from 'assert'
import { toInt } from '../../common/number.ts'
import { p3d, Point3d } from '../../common/point_3d.ts'
import { dedent, toLines } from '../../common/string.ts'

function parse(input: string) {
  return toLines(input).map((line) => {
    const [x, y, z] = line.split(',').map(toInt)
    return p3d(x, y, z)
  })
}

type Edge = [Point3d, Point3d, number] & { __edgeBrand: void }
const edgeCache = new Map<string, Edge>()
function getEdge(a: Point3d, b: Point3d): Edge {
  const key = [a.key, b.key].sort().join('->')

  const cached = edgeCache.get(key)
  if (cached) return cached

  const fresh = [a, b, a.straightDist(b)] as Edge
  edgeCache.set(key, fresh)
  return fresh
}

function add(circuit: Circuit, edge: Edge) {
  circuit.add(edge[0])
  circuit.add(edge[1])
  return circuit
}

type Circuit = Set<Point3d>
function connect(points: Point3d[], { first }: { first?: number } = {}) {
  const edges = new Set<Edge>()
  for (const point of points) {
    for (const otherPoint of points) {
      if (point === otherPoint) continue
      edges.add(getEdge(point, otherPoint))
    }
  }

  const sorted = Array.from(edges)
    .sort((a, b) => a[2] - b[2])
    .slice(0, first ?? edges.size)

  const circuits: Circuit[] = []
  let lastEdge: Edge | null = null
  for (const edge of sorted) {
    lastEdge = edge
    const existingA = circuits.find((circuit) => circuit.has(edge[0]))
    const existingB = circuits.find((circuit) => circuit.has(edge[1]))

    if (existingA && existingA === existingB) {
      // noop
    } else if (existingA && existingB) {
      circuits.splice(circuits.indexOf(existingB), 1)
      add(existingA, edge)
      for (const point of existingB) {
        existingA.add(point)
      }
    } else if (existingA) {
      add(existingA, edge)
    } else if (existingB) {
      add(existingB, edge)
    } else {
      circuits.push(add(new Set(), edge))
    }

    if (circuits.length === 1 && circuits[0].size === points.length) {
      break // all junctions have been connected into a single circuit
    }
  }

  if (!lastEdge) {
    throw new Error('no edges were connected')
  }

  return { circuits, last: lastEdge }
}

function multiplyLargestCircuits(circuits: Circuit[], count: number) {
  return circuits
    .sort((a, b) => b.size - a.size)
    .slice(0, count)
    .reduce((prod, circuit) => prod * circuit.size, 1)
}

export function test() {
  const points = parse(dedent`
    162,817,812
    57,618,57
    906,360,560
    592,479,940
    352,342,300
    466,668,158
    542,29,236
    431,825,988
    739,650,466
    52,470,668
    216,146,977
    819,987,18
    117,168,530
    805,96,715
    346,949,466
    970,615,88
    941,993,340
    862,61,35
    984,92,344
    425,690,689
  `)

  strictEqual(
    multiplyLargestCircuits(connect(points, { first: 10 }).circuits, 3),
    40,
  )

  const t2 = connect(points)
  strictEqual(t2.last[0].x * t2.last[1].x, 25272)
}

export function part1(input: string) {
  const { circuits } = connect(parse(input), { first: 1000 })
  console.log(
    'the product of the length of the three largest circuits is',
    multiplyLargestCircuits(circuits, 3),
  )
}

export function part2(input: string) {
  const { last } = connect(parse(input))

  console.log(
    'the last connection made was between',
    last[0],
    'and',
    last[1],
    'product =',
    last[0].x * last[1].x,
  )
}
