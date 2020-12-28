import chalk from 'chalk'

import { bigIntCodeGenerator, InputReq, Output } from '../lib/intcode-computer'
import { p, Point } from '../lib/point'

function paintHull(code: string, startOnWhite = false) {
  let pos = p(0, 0)
  let dir = p(0, 1)
  const panels = new Map<Point, bigint>()
  if (startOnWhite) {
    panels.set(pos, 1n)
  }
  const prog = bigIntCodeGenerator(code)

  while (true) {
    const { value: res, done } = prog.next(panels.get(pos) ?? 0n)

    if (done) {
      return panels
    }

    if (res instanceof InputReq) {
      continue
    }

    if (res instanceof Output) {
      panels.set(pos, res.output)

      const turnRes = prog.next().value
      if (turnRes instanceof Output) {
        dir = dir.rotate(turnRes.output === 0n ? 90 : -90)
        pos = pos.add(dir)
      } else {
        throw new Error('expected turn output after paint output')
      }
    }
  }
}

export function part1(input: string) {
  const panels = paintHull(input)
  console.log(
    'after running the paint program',
    panels.size,
    'panels were painted',
  )
}

export function part2(input: string) {
  const panels = paintHull(input, true)

  let maxX = 0
  let maxY = 0
  let minX = 0
  let minY = 0
  for (const point of panels.keys()) {
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
  }

  let rendered = ''
  for (let y = maxY; y >= minY; y--) {
    for (let x = minX; x <= maxX; x++) {
      rendered +=
        panels.get(p(x, y)) === 1n ? chalk.white('█') : chalk.black('█')
    }
    rendered += '\n'
  }

  console.log('the painting bot painted:')
  console.log(rendered)
}
