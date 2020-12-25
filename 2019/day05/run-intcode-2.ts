import { deepStrictEqual } from 'assert'

import { toInt } from '../lib/number'
import { shift, pop } from '../lib/array'

const paramCounts = new Map([
  [1, 3],
  [2, 3],
  [3, 1],
  [4, 1],
  [5, 2],
  [6, 2],
  [7, 3],
  [8, 3],
  [99, 0],
])

type ParamMode = 'immediate' | 'ref'
type ParamModes = Array<ParamMode>
type Op = { code: number; modes: ParamModes }
const opCache = new Map<number, Op>()

function parseOp(n: number) {
  const cached = opCache.get(n)
  if (cached !== undefined) {
    return cached
  }

  const call = `${n}`.split('')
  const opStr = call.splice(-2, 2).join('')
  const opCode = toInt(opStr)
  const paramCount = paramCounts.get(opCode)
  if (paramCount === undefined) {
    throw new Error(`unknown op code [${opStr}]`)
  }

  const definedModes = call.map(toInt)
  const paramModes: ParamModes = []
  for (let p = 0; p < paramCount; p++) {
    const mode = definedModes[definedModes.length - 1 - p] ?? 0
    paramModes.push(mode === 1 ? 'immediate' : 'ref')
  }

  const op: Op = {
    code: opCode,
    modes: paramModes,
  }

  opCache.set(n, op)

  return op
}

function runIntCode(code: string, input: number[]) {
  const mem = code.split(',').map(toInt)
  let i = 0

  const output = []

  const get = (op: Op, paramI: number) =>
    op.modes[paramI] === 'immediate'
      ? mem[i + 1 + paramI]
      : mem[mem[i + 1 + paramI]]

  const set = (op: Op, paramI: number, value: number) => {
    if (op.modes[paramI] === 'ref') {
      mem[mem[i + 1 + paramI]] = value
    } else {
      throw new Error('unable to write using param in immediate mode')
    }
  }

  main: while (true) {
    const op = parseOp(mem[i])

    switch (op.code) {
      case 1:
        // add the first two param values and store it in the memory slot defined by the third param
        set(op, 2, get(op, 0) + get(op, 1))
        break
      case 2:
        set(op, 2, get(op, 0) * get(op, 1))
        break
      case 3:
        set(op, 0, shift(input))
        break
      case 4:
        output.push(get(op, 0))
        break
      case 5:
        if (get(op, 0) !== 0) {
          i = get(op, 1)
          continue main
        }
        break
      case 6:
        if (get(op, 0) === 0) {
          i = get(op, 1)
          continue main
        }
        break
      case 7:
        set(op, 2, get(op, 0) < get(op, 1) ? 1 : 0)
        break
      case 8:
        set(op, 2, get(op, 0) === get(op, 1) ? 1 : 0)
        break
      case 99:
        break main
    }

    i += op.modes.length + 1
  }

  return output
}

export function test() {
  deepStrictEqual(parseOp(1002), {
    code: 2,
    modes: ['ref', 'immediate', 'ref'],
  })

  deepStrictEqual(parseOp(102), {
    code: 2,
    modes: ['immediate', 'ref', 'ref'],
  })

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
