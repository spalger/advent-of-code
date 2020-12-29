import {
  runIntCode,
  parseIntCode,
  bigIntCodeGenerator,
  InputReq,
  Output,
} from '../lib/intcode-computer'
import { p, Point } from '../lib/point'
import { ElementType } from '../lib/ts'

const entityMap = [
  'empty',
  'wall',
  'block',
  'horizontal paddle',
  'ball',
] as const
type Entity = ElementType<typeof entityMap>

export function part1(input: string) {
  const output = runIntCode(input, [])
  const map = new Map<Point, Entity>()

  for (let i = 0; i < output.length; i += 3) {
    map.set(p(output[i], output[i + 1]), entityMap[output[i + 2]])
  }

  let blocks = 0
  for (const entity of map.values()) {
    if (entity === 'block') {
      blocks += 1
    }
  }

  console.log('there are', blocks, 'block')
}

export function part2(input: string) {
  const code = parseIntCode(input)
  code.set(0n, 2n)
  const prog = bigIntCodeGenerator(code)
  const blocks = new Set<Point>()
  let ball = p(0, 0)
  let paddle = p(0, 0)
  let score = 0
  let blockCount = 0

  const partialOutput: number[] = []

  let nextInput: number | undefined = undefined
  while (true) {
    const { value: res, done } =
      nextInput !== undefined ? prog.next(BigInt(nextInput)) : prog.next()
    nextInput = undefined

    if (done) {
      break
    }

    if (res instanceof InputReq) {
      if (paddle.x < ball.x) {
        nextInput = 1
      } else if (paddle.x > ball.x) {
        nextInput = -1
      } else {
        nextInput = 0
      }
    }

    if (res instanceof Output) {
      partialOutput.push(Number(res.output))
    }

    if (partialOutput.length === 3) {
      const [x, y, entId] = partialOutput
      partialOutput.length = 0

      if (x === -1 && y === 0) {
        score = entId
      } else {
        switch (entId) {
          case 0:
            blocks.delete(p(x, y))
            break
          case 1:
            // noop
            break
          case 2:
            blocks.add(p(x, y))
            blockCount++
            break
          case 3:
            paddle = p(x, y)
            break
          case 4:
            ball = p(x, y)
            break
        }
      }
    }
  }

  console.log(
    'the program exitted with',
    blocks.size,
    'of',
    blockCount,
    'blocks remaining and a score of',
    score,
  )
}
