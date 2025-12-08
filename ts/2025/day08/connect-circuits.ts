import { strictEqual } from 'assert'
import { toInt } from '../../common/number'
import { p3d, Point3d } from '../../common/point_3d'
import { dedent, toLines } from '../../common/string'

function parse(input: string) {
  return toLines(input).map((line) => {
    const [x, y, z] = line.split(',').map(toInt)
    return p3d(x, y, z)
  })
}

type Edge = [Point3d, Point3d] & { __edgeBrand: void }
const edgeCache = new Map<string, Edge>()
function getEdge(a: Point3d, b: Point3d) {
  const fresh = [a, b] as Edge
  const key = fresh
    .map((p) => p.toString())
    .sort()
    .join('->')

  const cached = edgeCache.get(key)
  if (cached) return cached

  edgeCache.set(key, fresh)
  return fresh
}

class Circuit {
  #points: Set<Point3d> = new Set()

  constructor(edge: Edge) {
    this.add(edge)
  }

  add(edge: Edge) {
    this.#points.add(edge[0])
    this.#points.add(edge[1])
  }

  has(point: Point3d) {
    return this.#points.has(point)
  }

  merge(other: Circuit) {
    for (const point of other.#points) {
      this.#points.add(point)
    }
  }

  get size() {
    return this.#points.size
  }
}

function connect(
  points: Point3d[],
  shouldStop: (i: number, circuits: Circuit[]) => boolean,
) {
  const distances = new Map<Edge, number>()
  for (const point of points) {
    for (const otherPoint of points) {
      if (point === otherPoint) continue

      const edge = getEdge(point, otherPoint)
      distances.set(edge, point.straightDist(otherPoint))
    }
  }

  const sorted = Array.from(distances.entries()).sort((a, b) => a[1] - b[1])
  const circuits: Circuit[] = []
  let i = 0
  for (; !shouldStop(i, circuits); i++) {
    const [edge] = sorted[i]
    const existingA = circuits.find((circuit) => circuit.has(edge[0]))
    const existingB = circuits.find((circuit) => circuit.has(edge[1]))

    if (existingA && existingA === existingB) {
      continue
    }

    if (existingA && existingB) {
      circuits.splice(circuits.indexOf(existingB), 1)
      existingA.add(edge)
      existingA.merge(existingB)
      continue
    }

    if (existingA) {
      existingA.add(edge)
      continue
    }

    if (existingB) {
      existingB.add(edge)
      continue
    }

    circuits.push(new Circuit(edge))
  }

  return { circuits, last: sorted[i - 1][0] }
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
    multiplyLargestCircuits(connect(points, (i) => i >= 10).circuits, 3),
    40,
  )

  const t2 = connect(
    points,
    (_, circuits) => circuits.length === 1 && circuits[0].size >= points.length,
  )
  strictEqual(t2.last[0].x * t2.last[1].x, 25272)
}

export function part1(input: string) {
  const { circuits } = connect(parse(input), (i) => i >= 1000)
  console.log(
    'the product of the length of the three largest circuits is',
    multiplyLargestCircuits(circuits, 3),
  )
}

export function part2(input: string) {
  const { last } = connect(
    parse(input),
    (_, circuits) => circuits.length === 1 && circuits[0].size >= 1000,
  )

  console.log(
    'the last connection made was between',
    last[0],
    'and',
    last[1],
    '(product = ',
    last[0].x * last[1].x,
    ')',
  )
}
