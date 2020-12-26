import { deepStrictEqual } from 'assert'

import { pop } from '../lib/array'
import { runIntCode } from '../lib/intcode-computer'

export function test() {
  deepStrictEqual(runIntCode(`1002,4,3,4,33`, []), [])

  // program determines if the input === 8
  deepStrictEqual(runIntCode('3,9,8,9,10,9,4,9,99,-1,8', [1]), [0])
  deepStrictEqual(runIntCode('3,9,8,9,10,9,4,9,99,-1,8', [8]), [1])
  deepStrictEqual(runIntCode('3,3,1108,-1,8,3,4,3,99', [1]), [0])
  deepStrictEqual(runIntCode('3,3,1108,-1,8,3,4,3,99', [8]), [1])

  // program determines if the input < 8
  deepStrictEqual(runIntCode('3,9,7,9,10,9,4,9,99,-1,8', [1]), [1])
  deepStrictEqual(runIntCode('3,9,7,9,10,9,4,9,99,-1,8', [7]), [1])
  deepStrictEqual(runIntCode('3,9,7,9,10,9,4,9,99,-1,8', [8]), [0])
  deepStrictEqual(runIntCode('3,9,7,9,10,9,4,9,99,-1,8', [9]), [0])
  deepStrictEqual(runIntCode('3,3,1107,-1,8,3,4,3,99', [1]), [1])
  deepStrictEqual(runIntCode('3,3,1107,-1,8,3,4,3,99', [7]), [1])
  deepStrictEqual(runIntCode('3,3,1107,-1,8,3,4,3,99', [8]), [0])
  deepStrictEqual(runIntCode('3,3,1107,-1,8,3,4,3,99', [9]), [0])

  // output 0 if the input was zero or 1 if the input was non-zero
  deepStrictEqual(runIntCode('3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9', [0]), [
    0,
  ])
  deepStrictEqual(runIntCode('3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9', [1]), [
    1,
  ])
  deepStrictEqual(runIntCode('3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9', [2]), [
    1,
  ])
  deepStrictEqual(runIntCode('3,3,1105,-1,9,1101,0,0,12,4,12,99,1', [0]), [0])
  deepStrictEqual(runIntCode('3,3,1105,-1,9,1101,0,0,12,4,12,99,1', [1]), [1])
  deepStrictEqual(runIntCode('3,3,1105,-1,9,1101,0,0,12,4,12,99,1', [2]), [1])

  // output 999 if the input value is below 8, output 1000 if the input value is equal to 8, or output 1001 if the input value is greater than 8
  const code = `3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99`
  deepStrictEqual(runIntCode(code, [7]), [999])
  deepStrictEqual(runIntCode(code, [8]), [1000])
  deepStrictEqual(runIntCode(code, [9]), [1001])
}

export function part1(input: string) {
  const output = runIntCode(input.trim(), [1])
  const diagnosticCode = pop(output)
  const otherOutputs = output.reduce((acc, c) => acc + c, 0)

  console.log(
    'the diagnostic code is',
    diagnosticCode,
    'and the sum of all',
    output.length,
    'other outputs is',
    otherOutputs,
  )
}

export function part2(input: string) {
  const output = runIntCode(input.trim(), [5])
  const diagnosticCode = pop(output)
  const otherOutputs = output.reduce((acc, c) => acc + c, 0)

  console.log(
    'the diagnostic code is',
    diagnosticCode,
    'and the sum of all',
    output.length,
    'other outputs is',
    otherOutputs,
  )
}
