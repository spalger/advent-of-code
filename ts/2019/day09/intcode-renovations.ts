import { deepStrictEqual } from 'assert'

import { runBigIntCode } from '../../common/intcode-computer.ts'

export function test() {
  deepStrictEqual(
    runBigIntCode(`109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99`),
    [
      109n,
      1n,
      204n,
      -1n,
      1001n,
      100n,
      1n,
      100n,
      1008n,
      100n,
      16n,
      101n,
      1006n,
      101n,
      0n,
      99n,
    ],
  )

  deepStrictEqual(runBigIntCode('1102,34915192,34915192,7,4,7,99,0'), [
    1219070632396864n,
  ])

  deepStrictEqual(runBigIntCode(`104,1125899906842624,99`), [1125899906842624n])
}

export function part1(input: string) {
  const output = runBigIntCode(input, [1n])

  if (output.length !== 1) {
    throw new Error(`intcode did not produce one output [${output.join(',')}]`)
  }

  console.log('the BOOST code produced is', output[0])
}

export function part2(input: string) {
  const output = runBigIntCode(input, [2n])

  if (output.length !== 1) {
    throw new Error(`intcode did not produce one output [${output.join(',')}]`)
  }

  console.log('the coordinates of the distress signal are', output[0])
}
