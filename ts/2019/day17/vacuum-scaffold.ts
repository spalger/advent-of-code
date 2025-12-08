import { runIntCode, parseIntCode } from '../../common/intcode-computer.ts'
import { Point, p } from '../../common/point.ts'
import { toLines } from '../../common/string.ts'
import { shift } from '../../common/array.ts'

function parseMap(source: string) {
  const output = runIntCode(source, [])
  const map = output.map((code) => String.fromCharCode(code)).join('')

  let start
  let delta
  const scaffold = new Set<Point>()
  const lines = toLines(map)
  for (const [li, line] of lines.entries()) {
    const y = lines.length - li - 1
    for (const [x, char] of line.split('').entries()) {
      if (char === '#') {
        scaffold.add(p(x, y))
      }

      if (char === '^') {
        start = p(x, y)
        delta = p(0, 1)
      }

      if (char === '>') {
        start = p(x, y)
        delta = p(1, 0)
      }

      if (char === 'v') {
        start = p(x, y)
        delta = p(0, -1)
      }

      if (char === '<') {
        start = p(x, y)
        delta = p(-1, 0)
      }
    }
  }

  if (!start || !delta) {
    throw new Error('unable to find starting point/direction')
  }

  // include the start location as a scaffold location too
  scaffold.add(start)

  return { scaffold, map, start, delta }
}

type Path = Array<['L' | 'R', number]>
function findPathThroughScaffold(
  scaffold: Set<Point>,
  start: Point,
  startingDelta: Point,
) {
  const path: Path = []

  let prev = start
  let dir = startingDelta
  const seen = new Set<Point>([prev])

  if (!dir) {
    throw new Error('unable to find scaffold attached to start')
  }

  while (seen.size < scaffold.size) {
    const loc = prev.add(dir)

    if (scaffold.has(loc)) {
      path[path.length - 1][1] += 1
      seen.add(loc)
      prev = loc
      continue
    }

    // turn
    const left = dir.rotate(90)
    if (scaffold.has(prev.add(left))) {
      dir = left
      path.push(['L', 0])
    }

    const right = dir.rotate(-90)
    if (scaffold.has(prev.add(right))) {
      dir = right
      path.push(['R', 0])
    }
  }

  return path
}

type PathWithPatterns = Array<Sequence | ['L' | 'R', number]>

class Sequence {
  /**
   * Create a Pattern from a segment of the Path. If the segment
   * contains any other patterns or it's value as code is greater
   * than 20 characters long then it isn't a valid pattern and we
   * return undefined instead
   */
  static create(segment: PathWithPatterns) {
    const pairs: string[] = []
    for (const step of segment) {
      if (step instanceof Sequence) {
        return
      }
      pairs.push(step.join(','))
    }

    const size = pairs.join(',').length
    if (size <= 20) {
      return new Sequence(segment as Path)
    }
  }

  readonly segment: Path
  constructor(segment: Path) {
    this.segment = segment
  }

  replaceInPath(path: PathWithPatterns) {
    const replaced: PathWithPatterns = []
    for (let i = 0; i < path.length; i++) {
      if (this.matchAt(path, i)) {
        replaced.push(this)
        i += this.segment.length - 1
      } else {
        replaced.push(path[i])
      }
    }
    return replaced
  }

  private matchAt(path: PathWithPatterns, i: number) {
    for (let s = 0; s < this.segment.length; s++) {
      const step = path[i + s]
      if (
        !step ||
        step instanceof Sequence ||
        step[0] !== this.segment[s][0] ||
        step[1] !== this.segment[s][1]
      ) {
        return false
      }
    }
    return true
  }
}

function findSequencePattern(source: Path) {
  // max length of path made completely of patterns is 10

  const queue = [
    {
      path: source as PathWithPatterns,
      patternCount: 0,
    },
  ]

  while (queue.length) {
    const { path, patternCount } = shift(queue)
    const eligibleStart = path.findIndex((x) => !(x instanceof Sequence))

    for (let len = 1; ; len++) {
      const pattern = Sequence.create(
        path.slice(eligibleStart, eligibleStart + len),
      )

      if (!pattern) {
        break
      }

      const withoutSequence = pattern.replaceInPath(path)
      if (patternCount + 1 === 3) {
        if (
          withoutSequence.length <= 10 &&
          withoutSequence.every((x) => x instanceof Sequence)
        ) {
          return withoutSequence as Sequence[]
        }
      } else {
        queue.unshift({
          path: withoutSequence,
          patternCount: patternCount + 1,
        })
      }
    }
  }
}

export function part1(input: string) {
  const { map, scaffold } = parseMap(input)
  console.log(`map:\n${map}`)

  const intersections = Array.from(scaffold).filter(
    (p) =>
      scaffold.has(p.top()) &&
      scaffold.has(p.right()) &&
      scaffold.has(p.bottom()) &&
      scaffold.has(p.left()),
  )

  console.log(
    'sum of all allignment parameters is',
    intersections.reduce((acc, p) => acc + p.x * p.y, 0),
  )
}

export function part2(input: string) {
  const { scaffold, start, delta } = parseMap(input)
  const path = findPathThroughScaffold(scaffold, start, delta)

  const pattern = findSequencePattern(path)
  if (!pattern) {
    throw new Error('unable to find pattern in path')
  }

  const toCodes = (str: string) => str.split('').map((c) => c.charCodeAt(0))

  const code = parseIntCode(input)
  code.set(0n, 2n)

  const seqs = Array.from(new Set(pattern))
  const seqName = new Map(
    seqs.map((seq, i) => [seq, String.fromCharCode('A'.charCodeAt(0) + i)]),
  )
  const output = runIntCode(code, [
    ...toCodes(pattern.map((seq) => seqName.get(seq)).join(',') + '\n'),
    ...toCodes(seqs[0].segment.map((p) => p.join(',')).join(',') + '\n'),
    ...toCodes(seqs[1].segment.map((p) => p.join(',')).join(',') + '\n'),
    ...toCodes(seqs[2].segment.map((p) => p.join(',')).join(',') + '\n'),
    ...toCodes('n\n'),
  ])

  console.log('output')
  console.log(output.map((c) => String.fromCharCode(c)).join(''))

  console.log(
    'the robot collected',
    output[output.length - 1],
    'dust while running',
  )
}
