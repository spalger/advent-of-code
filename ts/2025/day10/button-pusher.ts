import { strictEqual } from 'assert'
import { getMax, getSum, toInt } from '../../common/number.ts'
import { dedent, toLines } from '../../common/string.ts'

type Spec = {
  lights: string
  buttons: number[][]
  joltage: number[]
}

function parse(input: string) {
  const pattern = /^\[([.#]+)\]((?: \(\d+(?:,\d+)*\))+) \{(\d+(?:,\d+)*)\}$/
  return toLines(input).map((line): Spec => {
    const match = line.match(pattern)
    if (!match) throw new Error(`Invalid line format: ${line}`)
    const lights = match[1]
    const buttons = match[2]
      .trim()
      .split(' ')
      .map((button) =>
        button
          .slice(1, -1)
          .split(',')
          .map(toInt)
          .sort((a, b) => a - b),
      )
    const joltage = match[3].split(',').map(toInt)
    return { lights, buttons, joltage }
  })
}

function pushButtonsToConfigureLights(spec: Spec) {
  type Machine = [
    lights: string,
    presses: number,
    lastPress: number[] | undefined,
  ]

  const seen = new Set<string>()
  const apply = (lights: string, button: number[]) =>
    button
      .reduce((bulbs, index) => {
        bulbs[index] = bulbs[index] === '.' ? '#' : '.'
        return bulbs
      }, lights.split(''))
      .join('')

  const queue: Machine[] = [
    [spec.lights.split('').fill('.').join(''), 0, undefined],
  ]

  while (queue.length > 0) {
    const [lights, presses, lastPress] = queue.shift()!
    for (const button of spec.buttons) {
      if (button === lastPress) {
        continue
      }

      const updated = apply(lights, button)
      if (updated === spec.lights) {
        return presses + 1
      }

      if (seen.has(updated)) {
        continue
      }

      seen.add(updated)
      queue.push([updated, presses + 1, button])
    }
  }

  throw new Error('No solution found')
}

function pushButtonsToConfigureJoltage(spec: Spec) {
  type Machine = [
    state: number[],
    presses: number,
    joltage: number,
    minPresses: number,
  ]

  const heap = new (class Heap {
    // options sorted by joltage ascending so that we focus on paths which reach 0 faster
    options: Machine[] = [
      [spec.joltage, 0, getSum(spec.joltage), getMax(spec.joltage)],
    ]

    push(option: Machine) {
      const gteMinPresses = this.options.findIndex(([, , , minPresses]) => {
        return option[3] >= minPresses
      })

      if (gteMinPresses === -1) {
        this.options.push(option)
        return
      }

      if (this.options[gteMinPresses][2] === option[2]) {
        if (option[1] < this.options[gteMinPresses][1]) {
          this.options.splice(gteMinPresses, 1, option)
        }
        return
      }
    }

    pop() {
      const option = this.options.shift()
      if (!option) throw new Error('Heap is empty')
      return option
    }
  })()

  function apply(button: number[], state: number[]) {
    const newState = state.slice()
    for (const index of button) {
      newState[index] -= 1
      if (newState[index] < 0) {
        return null // invalid move
      }
    }
    return newState
  }

  while (heap.options.length > 0) {
    const [state, presses] = heap.pop()

    for (const button of spec.buttons) {
      const updated = apply(button, state)
      if (!updated) {
        continue
      }

      const newJoltage = getSum(updated)
      if (newJoltage === 0) {
        return presses + 1
      }

      heap.push([updated, presses + 1, newJoltage, getMax(updated)])
    }
  }

  throw new Error('No solution found')
}

export function test() {
  const manual = parse(dedent`
    [.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
    [...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
    [.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}
  `)

  strictEqual(getSum(manual.map(pushButtonsToConfigureLights)), 7)
  strictEqual(getSum(manual.map(pushButtonsToConfigureJoltage)), 33)
}

export function part1(input: string) {
  console.log(
    'the minimal button pushes to start all machines is',
    getSum(parse(input).map(pushButtonsToConfigureLights)),
  )
}

export function part2(input: string) {
  console.log(
    'the minimal button pushes to start all machines is',
    getSum(parse(input).map(pushButtonsToConfigureJoltage)),
  )
}
