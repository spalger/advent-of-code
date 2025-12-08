import { toInt } from './number.ts'
import { shift } from './array.ts'

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
  readonly output: bigint
  constructor(output: bigint) {
    this.output = output
  }
}

export function runBigIntCode(
  source: string | IntSource,
  input: bigint[] = [],
) {
  const state = State.create(source, input)

  const { mode } = intCodeTick(state)
  if (mode !== 'done') {
    throw new Error('unable to run intCode to completion')
  }

  return state.outputLog
}

export function runIntCode(source: string | IntSource, input: number[]) {
  return runBigIntCode(
    source,
    input.map((n) => BigInt(n)),
  ).map((n) => Number(n))
}

export class State {
  static create(source: string | IntSource, input?: bigint[]) {
    return new State(
      typeof source === 'string' ? parseIntCode(source) : new Map(source),
      input,
    )
  }

  private readonly mem: IntSource
  public readonly input: bigint[] = []
  private i = 0n
  public relativeBase = 0n
  public readonly outputLog: bigint[] = []
  private constructor(
    mem: IntSource,
    input: bigint[] = [],
    i = 0n,
    relativeBase = 0n,
    outputLog: bigint[] = [],
  ) {
    this.mem = mem
    this.input = input
    this.i = i
    this.relativeBase = relativeBase
    this.outputLog = outputLog
  }

  private _op: Op | undefined
  op() {
    if (this._op) {
      return this._op
    }

    return (this._op = parseOp(this.get(this.i)))
  }

  get(i: bigint) {
    return this.mem.get(i) ?? 0n
  }

  getP(paramI: bigint) {
    switch (this.op().modes.get(paramI)) {
      case 'immediate':
        return this.mem.get(this.i + 1n + paramI) ?? 0n
      case 'ref':
        return this.mem.get(this.mem.get(this.i + 1n + paramI) ?? 0n) ?? 0n
      case 'rel':
        return (
          this.mem.get(
            this.relativeBase + (this.mem.get(this.i + 1n + paramI) ?? 0n),
          ) ?? 0n
        )
      default:
        throw new Error(`unknown param mode`)
    }
  }

  setP(paramI: bigint, value: bigint) {
    switch (this.op().modes.get(paramI)) {
      case 'immediate':
        throw new Error('unable to write using param in immediate mode')
      case 'ref':
        this.mem.set(this.mem.get(this.i + 1n + paramI) ?? 0n, value)
        break
      case 'rel':
        this.mem.set(
          this.relativeBase + (this.mem.get(this.i + 1n + paramI) ?? 0n),
          value,
        )
        break
      default:
        throw new Error('unknown param mode')
    }
  }

  incrOp() {
    this.setI(this.i + this.op().paramCount + 1n)
  }

  setI(i: bigint) {
    if (i !== this.i) {
      this.i = i
      this._op = undefined
    }
  }

  clone() {
    return new State(
      new Map(this.mem),
      this.input.slice(),
      this.i,
      this.relativeBase,
      this.outputLog.slice(),
    )
  }
}

export function* bigIntCodeGenerator(source: string | IntSource) {
  const state = State.create(source)

  while (true) {
    const { mode } = intCodeTick(state, { pauseOnOutput: true })

    if (mode === 'input') {
      state.input.push(yield new InputReq())
    }

    if (mode === 'output') {
      yield new Output(shift(state.outputLog))
    }

    if (mode === 'done') {
      return
    }
  }
}

export function intCodeTick(
  state: State,
  options: { pauseOnOutput?: boolean } = {},
): { mode: 'done' | 'input' | 'output'; state: State } {
  while (true) {
    const { code } = state.op()

    if (code === 1) {
      // add the first two param values and store it in the memory slot defined by the third param
      state.setP(2n, state.getP(0n) + state.getP(1n))
      state.incrOp()
      continue
    }

    if (code === 2) {
      // multiply the first two params and store the result in the third param
      state.setP(2n, state.getP(0n) * state.getP(1n))
      state.incrOp()
      continue
    }

    if (code === 3) {
      if (!state.input.length) {
        // request input before continuing
        return { mode: 'input', state }
      }

      // read a value from the input and write it to the location referenced by the first param
      state.setP(0n, shift(state.input))
      state.incrOp()
      continue
    }

    if (code === 4) {
      state.outputLog.push(state.getP(0n))
      state.incrOp()
      if (options.pauseOnOutput) {
        return { mode: 'output', state }
      } else {
        continue
      }
    }

    if (code === 5) {
      // jump to a point in the code if the value of the first param is not equal to 0
      if (state.getP(0n) !== 0n) {
        state.setI(state.getP(1n))
      } else {
        state.incrOp()
      }

      continue
    }

    if (code === 6) {
      // jump to a point in the code if the value of the first param is 0
      if (state.getP(0n) === 0n) {
        state.setI(state.getP(1n))
      } else {
        state.incrOp()
      }

      continue
    }

    if (code === 7) {
      // set the third param to 1 if the first param is less than the second param, otherwise set it to 0
      state.setP(2n, state.getP(0n) < state.getP(1n) ? 1n : 0n)
      state.incrOp()
      continue
    }

    if (code === 8) {
      // set the third param to 1 if the first param is equal to the second param, otherwise set it to 0
      state.setP(2n, state.getP(0n) === state.getP(1n) ? 1n : 0n)
      state.incrOp()
      continue
    }

    if (code === 9) {
      // adjust the relative base by the first param
      state.relativeBase += state.getP(0n)
      state.incrOp()
      continue
    }

    if (code === 99) {
      return { mode: 'done', state }
    }
  }
}
