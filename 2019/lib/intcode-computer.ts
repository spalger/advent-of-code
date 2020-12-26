import { toInt } from '../lib/number'
import { shift } from '../lib/array'

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
type Op = {
  code: number
  paramCount: number
  modes: ParamModes
}

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
    paramCount,
    modes: paramModes,
  }

  opCache.set(n, op)

  return op
}

export function runIntCode(code: string, input: number[] = []) {
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
        // multiply the first two params and store the result in the third param
        set(op, 2, get(op, 0) * get(op, 1))
        break
      case 3:
        // read a value from the input
        set(op, 0, shift(input))
        break
      case 4:
        // output a value
        output.push(get(op, 0))
        break
      case 5:
        // jump to a point in the code if the value of the first param is not equal to 0
        if (get(op, 0) !== 0) {
          i = get(op, 1)
          continue main
        }
        break
      case 6:
        // jump to a point in the code if the value of the first param is 0
        if (get(op, 0) === 0) {
          i = get(op, 1)
          continue main
        }
        break
      case 7:
        // set the third param to 1 if the first param is less than the second param, otherwise set it to 0
        set(op, 2, get(op, 0) < get(op, 1) ? 1 : 0)
        break
      case 8:
        // set the third param to 1 if the first param is equal to the second param, otherwise set it to 0
        set(op, 2, get(op, 0) === get(op, 1) ? 1 : 0)
        break
      case 99:
        break main
    }

    i += op.paramCount + 1
  }

  return output
}
