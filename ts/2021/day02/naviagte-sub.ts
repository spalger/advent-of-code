import { deepStrictEqual } from 'assert'
import { dedent, toLines } from '../../common/string'
import { toInt } from '../../common/number'

type Routine = Array<{
  direction: 'up' | 'down' | 'forward'
  steps: number
}>

function parseRoutine(input: string): Routine {
  return toLines(input).map((line) => {
    const [direction, steps] = line.split(' ')

    if (direction !== 'up' && direction !== 'down' && direction !== 'forward') {
      throw new Error('invalid direction')
    }

    return { direction, steps: toInt(steps) }
  })
}

function runRoutine(routine: Routine) {
  let horizontal = 0
  let depth = 0

  for (const { direction, steps } of routine) {
    switch (direction) {
      case 'up':
        depth -= steps
        break
      case 'down':
        depth += steps
        break
      case 'forward':
        horizontal += steps
        break
    }
  }

  return { horizontal, depth }
}

function runRoutineWithAim(routine: Routine) {
  let horizontal = 0
  let depth = 0
  let aim = 0

  for (const { direction, steps } of routine) {
    switch (direction) {
      case 'up':
        aim -= steps
        break
      case 'down':
        aim += steps
        break
      case 'forward':
        horizontal += steps
        depth += steps * aim
        break
    }
  }

  return { aim, horizontal, depth }
}

export function test() {
  const routine = parseRoutine(dedent`
    forward 5
    down 5
    forward 8
    up 3
    down 8
    forward 2
  `)

  deepStrictEqual(runRoutine(routine), {
    horizontal: 15,
    depth: 10,
  })

  deepStrictEqual(runRoutineWithAim(routine), {
    horizontal: 15,
    depth: 60,
    aim: 10,
  })
}

export function part1(input: string) {
  const pos = runRoutine(parseRoutine(input))
  console.log('final position, horizontal', pos.horizontal, 'depth', pos.depth)
  console.log('point is', pos.horizontal * pos.depth)
}

export function part2(input: string) {
  const { depth, horizontal, aim } = runRoutineWithAim(parseRoutine(input))
  console.log('final position, h', horizontal, 'd', depth, 'a', aim)
  console.log('point is', horizontal * depth)
}
