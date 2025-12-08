import { strictEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'

type Connections = Map<string, string[]>

interface Path {
  takeNextStep(step: string): Path | undefined
  getCurrentStep(): string
}

class SimplePath implements Path {
  private readonly steps: string[]
  constructor(steps: string[]) {
    this.steps = steps
  }

  getCurrentStep() {
    return this.steps[this.steps.length - 1]
  }

  takeNextStep(step: string): SimplePath | undefined {
    // don't return to seen small caves (97 === a)
    if (
      step !== 'end' &&
      step.toLowerCase() === step &&
      this.steps.includes(step)
    ) {
      return undefined
    }

    return new SimplePath([...this.steps, step])
  }
}

class ComplexPath implements Path {
  private readonly steps: string[]
  private readonly smallRoomRevisited: boolean
  constructor(
    steps: string[],
    smallRoomRevisited: boolean = false,
  ) {
    this.steps = steps
    this.smallRoomRevisited = smallRoomRevisited
  }

  getCurrentStep(): string {
    return this.steps[this.steps.length - 1]
  }

  takeNextStep(step: string): ComplexPath | undefined {
    const isSeenSmallCave =
      step !== 'end' && step.toLowerCase() === step && this.steps.includes(step)

    if (isSeenSmallCave && this.smallRoomRevisited) {
      return undefined
    }

    return new ComplexPath(
      [...this.steps, step],
      isSeenSmallCave || this.smallRoomRevisited,
    )
  }
}

function countPaths(input: string, firstStep: Path) {
  // parse input to list of edges
  const edges: Array<[string, string]> = []
  for (const line of toLines(input)) {
    const [left, right] = line.split('-')
    edges.push([left, right])
  }

  // map out which nodes can be reached from which edges
  const connections: Connections = new Map()
  for (const [left, right] of edges) {
    const leftConnections = connections.get(left)
    if (leftConnections) {
      leftConnections.push(right)
    } else {
      connections.set(left, [right])
    }

    const rightConnections = connections.get(right)
    if (rightConnections) {
      rightConnections.push(left)
    } else {
      connections.set(right, [left])
    }
  }

  let paths = 0
  const queue = [firstStep]

  while (queue.length) {
    const path = queue.shift()!
    const node = path.getCurrentStep()

    if (node === 'end') {
      paths += 1
      continue
    }

    for (const step of connections.get(node) ?? []) {
      // don't return to the start
      if (step === 'start') {
        continue
      }

      const next = path.takeNextStep(step)
      if (next !== undefined) {
        queue.unshift(next)
      }
    }
  }

  console.log(paths, 'from start to end')
  return paths
}

export function test() {
  strictEqual(
    countPaths(
      dedent`
        start-A
        start-b
        A-c
        A-b
        b-d
        A-end
        b-end
      `,
      new SimplePath(['start']),
    ),
    10,
  )

  strictEqual(
    countPaths(
      dedent`
        dc-end
        HN-start
        start-kj
        dc-start
        dc-HN
        LN-dc
        HN-end
        kj-sa
        kj-HN
        kj-dc
      `,
      new SimplePath(['start']),
    ),
    19,
  )

  strictEqual(
    countPaths(
      dedent`
        fs-end
        he-DX
        fs-he
        start-DX
        pj-DX
        end-zg
        zg-sl
        zg-pj
        pj-he
        RW-he
        fs-DX
        pj-RW
        zg-RW
        start-pj
        he-WI
        zg-he
        pj-fs
        start-RW
      `,
      new SimplePath(['start']),
    ),
    226,
  )

  strictEqual(
    countPaths(
      dedent`
        start-A
        start-b
        A-c
        A-b
        b-d
        A-end
        b-end
      `,
      new ComplexPath(['start']),
    ),
    36,
  )

  strictEqual(
    countPaths(
      dedent`
        dc-end
        HN-start
        start-kj
        dc-start
        dc-HN
        LN-dc
        HN-end
        kj-sa
        kj-HN
        kj-dc
      `,
      new ComplexPath(['start']),
    ),
    103,
  )

  strictEqual(
    countPaths(
      dedent`
        fs-end
        he-DX
        fs-he
        start-DX
        pj-DX
        end-zg
        zg-sl
        zg-pj
        pj-he
        RW-he
        fs-DX
        pj-RW
        zg-RW
        start-pj
        he-WI
        zg-he
        pj-fs
        start-RW
      `,
      new ComplexPath(['start']),
    ),
    3509,
  )
}

export function part1(input: string) {
  strictEqual(countPaths(input, new SimplePath(['start'])), 5252)
}

export function part2(input: string) {
  strictEqual(countPaths(input, new ComplexPath(['start'])), 147784)
}
