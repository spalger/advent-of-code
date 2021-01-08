import { runIntCode } from '../lib/intcode-computer'
import { last } from '../lib/array'

function runSpringscript(interpreter: string, prog: string[]): number | string {
  if (prog.length > 16) {
    throw new Error('maximum springscript program is 15 instructions long')
  }

  const output = runIntCode(
    interpreter,
    [...prog].reduce(
      (acc: number[], line) => [
        ...acc,
        ...line.split('').map((c) => c.charCodeAt(0)),
        '\n'.charCodeAt(0),
      ],
      [],
    ),
  )

  if (last(output) > 127) {
    return last(output)
  }

  return output.map((c) => String.fromCharCode(c)).join('')
}

export function part1(input: string) {
  const output = runSpringscript(input, [
    'NOT A T',
    'NOT B J',
    'OR T J',
    'NOT C T',
    'OR T J',
    'AND D J',
    'WALK',
  ])

  if (typeof output === 'number') {
    console.log('the robot identified', output, 'holes in the hull')
  } else {
    console.log(output)
  }
}

export function part2(input: string) {
  const output = runSpringscript(input, [
    'NOT A T',
    'NOT B J',
    'OR T J',
    'NOT C T',
    'OR T J',
    'AND D J',
    'OR J T',
    'AND E T',
    'OR H T',
    'AND T J',
    'RUN',
  ])

  if (typeof output === 'number') {
    console.log('the robot identified', output, 'holes in the hull')
  } else {
    console.log(output)
  }
}
