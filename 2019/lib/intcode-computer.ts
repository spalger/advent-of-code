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
  [9, 1],
  [99, 0],
])

type ParamMode = 'immediate' | 'ref' | 'rel'
type ParamModes = Map<bigint, ParamMode>
type Op = {
  code: number
  paramCount: bigint
  modes: ParamModes
}
export type IntSource = Map<bigint, bigint>

const opCache = new Map<bigint, Op>()

function parseOp(n: bigint) {
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
  const paramModes: ParamModes = new Map()
  for (let p = 0; p < paramCount; p++) {
    const mode = definedModes[definedModes.length - 1 - p] ?? 0
    switch (mode) {
      case 1:
        paramModes.set(BigInt(p), 'immediate')
        break
      case 2:
        paramModes.set(BigInt(p), 'rel')
        break
      case 0:
        paramModes.set(BigInt(p), 'ref')
        break
      default:
        throw new Error(`invalid param mode [${mode}]`)
    }
  }

  const op: Op = {
    code: opCode,
    paramCount: BigInt(paramCount),
    modes: paramModes,
  }

  opCache.set(n, op)

  return op
}

export function parseIntCode(code: string) {
  return new Map(code.split(',').map((n, i) => [BigInt(i), BigInt(n)]))
}

export class InputReq {}

export class Output {
  constructor(public readonly output: bigint) {}
}

export function runBigIntCode(
  source: string | IntSource,
  input: bigint[] = [],
) {
  const output = []
  const gen = bigIntCodeGenerator(source)
  let nextInput
  while (true) {
    const result = nextInput === undefined ? gen.next() : gen.next(nextInput)
    nextInput = undefined

    if (result.value instanceof Output) {
      output.push(result.value.output)
    }

    if (result.value instanceof InputReq) {
      nextInput = shift(input)
    }

    if (result.done) {
      return output
    }
  }
}

export function runIntCode(source: string | IntSource, input: number[]) {
  return runBigIntCode(
    source,
    input.map((n) => BigInt(n)),
  ).map((n) => Number(n))
}

export function* bigIntCodeGenerator(source: string | IntSource) {
  const mem =
    typeof source === 'string' ? parseIntCode(source) : new Map(source)
  let i = 0n
  let relativeBase = 0n

  const get = (op: Op, paramI: bigint) => {
    switch (op.modes.get(paramI)) {
      case 'immediate':
        return mem.get(i + 1n + paramI) ?? 0n
      case 'ref':
        return mem.get(mem.get(i + 1n + paramI) ?? 0n) ?? 0n
      case 'rel':
        return mem.get(relativeBase + (mem.get(i + 1n + paramI) ?? 0n)) ?? 0n
      default:
        throw new Error(`unknown param mode`)
    }
  }

  const set = (op: Op, paramI: bigint, value: bigint) => {
    switch (op.modes.get(paramI)) {
      case 'immediate':
        throw new Error('unable to write using param in immediate mode')
      case 'ref':
        mem.set(mem.get(i + 1n + paramI) ?? 0n, value)
        break
      case 'rel':
        mem.set(relativeBase + (mem.get(i + 1n + paramI) ?? 0n), value)
        break
      default:
        throw new Error('unknown param mode')
    }
  }

  main: while (true) {
    const op = parseOp(mem.get(i) ?? 0n)

    switch (op.code) {
      case 1:
        // add the first two param values and store it in the memory slot defined by the third param
        set(op, 2n, get(op, 0n) + get(op, 1n))
        break
      case 2:
        // multiply the first two params and store the result in the third param
        set(op, 2n, get(op, 0n) * get(op, 1n))
        break
      case 3:
        // read a value from the input
        set(op, 0n, yield new InputReq())
        break
      case 4:
        // output a value
        yield new Output(get(op, 0n))
        break
      case 5:
        // jump to a point in the code if the value of the first param is not equal to 0
        if (get(op, 0n) !== 0n) {
          i = get(op, 1n)
          continue main
        }
        break
      case 6:
        // jump to a point in the code if the value of the first param is 0
        if (get(op, 0n) === 0n) {
          i = get(op, 1n)
          continue main
        }
        break
      case 7:
        // set the third param to 1 if the first param is less than the second param, otherwise set it to 0
        set(op, 2n, get(op, 0n) < get(op, 1n) ? 1n : 0n)
        break
      case 8:
        // set the third param to 1 if the first param is equal to the second param, otherwise set it to 0
        set(op, 2n, get(op, 0n) === get(op, 1n) ? 1n : 0n)
        break
      case 9:
        // adjust the relative base by the first param
        relativeBase += get(op, 0n)
        break
      case 99:
        break main
    }

    i += op.paramCount + 1n
  }
}
