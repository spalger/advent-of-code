import { intCodeTick, State } from '../../common/intcode-computer.ts'
import { p, type Point } from '../../common/point.ts'
import { shift } from '../../common/array.ts'
import { type ElementType } from '../../common/ts.ts'

type Entity = '#' | '.' | 'O' | 'S'
type Room = Map<Point, Entity>
type Dir = ElementType<typeof dirs>

const dirs = [
  {
    // north
    input: 1n,
    delta: p(0, 1),
  },
  {
    // source
    input: 2n,
    delta: p(0, -1),
  },
  {
    // west
    input: 3n,
    delta: p(-1, 0),
  },
  {
    // east
    input: 4n,
    delta: p(1, 0),
  },
]

const resolveStep = (
  parentState: State,
  dir: Dir,
): { entity: Entity; state: State } => {
  const state = parentState.clone()
  state.input.push(dir.input)
  intCodeTick(state)
  const output = shift(state.outputLog)

  if (state.input.length || state.outputLog.length) {
    throw new Error('expected state input and output to be consumed completely')
  }

  if (output === 0n) {
    return {
      state,
      entity: '#',
    }
  }

  if (output === 1n) {
    return {
      state,
      entity: '.',
    }
  }

  if (output === 2n) {
    return {
      state,
      entity: 'O',
    }
  }

  throw new Error(`unexpected output from program [${output}]`)
}

function discoverRoom(code: string) {
  const start = p(0, 0)
  let lengthToO2 = 0
  let o2Sys
  const room: Room = new Map([[start, 'S']])
  const seen = new Set([start])

  // search the map by executing the program in every possible direction from the starting point, and spreading out
  const queue: [Point, State, number][] = [[start, State.create(code), 1]]

  while (queue.length) {
    const [start, state, depth] = shift(queue)

    for (const dir of dirs) {
      const target = start.add(dir.delta)
      if (seen.has(target)) {
        continue
      }
      seen.add(target)

      const res = resolveStep(state, dir)
      room.set(target, res.entity)
      if (res.entity !== '#') {
        if (res.entity === 'O') {
          lengthToO2 = depth
          o2Sys = target
        }

        queue.push([target, res.state, depth + 1])
      }
    }
  }

  if (!o2Sys) {
    throw new Error('o2Sys not found')
  }

  return { room, lengthToO2, o2Sys }
}

function findLongestPathFrom(room: Room, start: Point) {
  const queue: [Point, number][] = [[start, 0]]
  const seen = new Set()
  let maxDepth = 0
  while (queue.length) {
    const [point, depth] = shift(queue)
    maxDepth = depth

    for (const dir of dirs) {
      const neighbor = point.add(dir.delta)
      if (seen.has(neighbor)) {
        continue
      }
      seen.add(neighbor)

      if (room.get(neighbor) === '.' || room.get(neighbor) === 'S') {
        queue.push([neighbor, depth + 1])
      }
    }
  }
  return maxDepth
}

function drawMap(room: Room) {
  let minX = 0
  let maxX = 0
  let minY = 0
  let maxY = 0

  for (const point of room.keys()) {
    minX = Math.min(point.x, minX)
    maxX = Math.max(point.x, maxX)
    minY = Math.min(point.y, minY)
    maxY = Math.max(point.y, maxY)
  }

  for (let y = maxY; y >= minY; y--) {
    let line = ''
    for (let x = minX; x <= maxX; x++) {
      line += room.get(p(x, y)) ?? ' '
    }
    console.log(line)
  }
}

export function part1(input: string) {
  const { room, lengthToO2 } = discoverRoom(input)
  drawMap(room)
  console.log('the path from the start to the o2 system is', lengthToO2)
}

export function part2(input: string) {
  const { room, o2Sys } = discoverRoom(input)

  console.log(
    'after repairing the oxygen system it will take',
    findLongestPathFrom(room, o2Sys),
    'minutes for the whole area to fill with oxygen',
  )
}
