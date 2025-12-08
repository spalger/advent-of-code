import { strictEqual } from 'assert'

import {
  parseIntCode,
  runBigIntCode,
  bigIntCodeGenerator,
  IntSource,
  InputReq,
  Output,
} from '../../common/intcode-computer'
import { iterCombinations } from '../../common/generator.ts'
import { repeat, shift } from '../../common/array.ts'

function determineOutputThrust(phases: number[], code: string | IntSource) {
  let output = 0n

  for (let i = 0; i < phases.length; i++) {
    ;[output] = runBigIntCode(code, [BigInt(phases[i]), output])
  }

  return output
}

function determineMaxOutput(code: string) {
  const source = parseIntCode(code)
  let max = 0n
  for (const phases of iterCombinations(0, 1, 2, 3, 4)) {
    const thrust = determineOutputThrust(phases, source)
    if (thrust > max) {
      max = thrust
    }
  }
  return max
}

function determineOutputThrustWithFeedbackLoop(
  phases: number[],
  code: string | IntSource,
) {
  const inputs = repeat(5, (i) =>
    i === 0 ? [BigInt(phases[i]), 0n] : [BigInt(phases[i])],
  )
  const thrusters = repeat(5, () => {
    const iter = bigIntCodeGenerator(code)

    // start the generator and make it await input
    if (!(iter.next().value instanceof InputReq)) {
      throw new Error(
        'unable to initialize generator so that it is waiting for input',
      )
    }

    return {
      iter,
      done: false,
    }
  })

  // iterate through the thrusters, wrapping around the list, until the last thruster is done
  for (
    let i = 0;
    !thrusters[thrusters.length - 1].done;
    i = (i + 1) % thrusters.length
  ) {
    const thruster = thrusters[i]
    const input = inputs[i]

    if (thruster.done) {
      throw new Error('thruster is done but was called again')
    }

    // the run loop expects the thruster to be awaiting input, passes in the
    // next input, and then runs the iter until it is waiting for input again
    // or completes
    while (input.length && !thruster.done) {
      let { value: res, done } = thruster.iter.next(shift(input))

      while (res instanceof Output) {
        // output from one thruster is written to the input of the next
        inputs[(i + 1) % thrusters.length].push(res.output)
        // tick the iter to get the expected InputReq or done state
        ;({ value: res, done } = thruster.iter.next())
      }

      if (res instanceof InputReq) {
        // thruster is awaiting input so restart the loop
        continue
      }

      if (done) {
        thruster.done = true
        continue
      }

      throw new Error('unexpected intcode computer state')
    }
  }

  if (inputs[0].length !== 1) {
    throw new Error('expected last thruster to write a final output')
  }

  return inputs[0][0]
}

function determineMaxOutputWithFeedbackLoop(code: string) {
  const source = parseIntCode(code)
  let max = 0n

  for (const phases of iterCombinations(5, 6, 7, 8, 9)) {
    const thrust = determineOutputThrustWithFeedbackLoop(phases, source)
    if (thrust > max) {
      max = thrust
    }
  }

  return max
}

export function test() {
  strictEqual(
    determineMaxOutput(`3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0`),
    43210n,
  )
  strictEqual(
    determineOutputThrust(
      [4, 3, 2, 1, 0],
      `3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0`,
    ),
    43210n,
  )

  strictEqual(
    determineMaxOutput(
      `3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0`,
    ),
    54321n,
  )
  strictEqual(
    determineOutputThrust(
      [0, 1, 2, 3, 4],
      `3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0`,
    ),
    54321n,
  )

  strictEqual(
    determineMaxOutput(
      `3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0`,
    ),
    65210n,
  )
  strictEqual(
    determineOutputThrust(
      [1, 0, 4, 3, 2],
      `3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0`,
    ),
    65210n,
  )

  strictEqual(
    determineOutputThrustWithFeedbackLoop(
      [9, 8, 7, 6, 5],
      `3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5`,
    ),
    139629729n,
  )

  strictEqual(
    determineMaxOutputWithFeedbackLoop(
      `3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5`,
    ),
    139629729n,
  )
}

export function part1(input: string) {
  console.log('the maximum output thrust is', determineMaxOutput(input))
}

export function part2(input: string) {
  console.log(
    'the maximum output thrust with a feedback loop installed is',
    determineMaxOutputWithFeedbackLoop(input),
  )
}
