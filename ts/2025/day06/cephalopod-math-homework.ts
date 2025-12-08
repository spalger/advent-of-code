import { strictEqual } from 'assert'
import { getSum, toInt } from '../../common/number.ts'
import { dedent, toLines } from '../../common/string.ts'

type Problem = {
  sign: '+' | '*'
  numbers: number[]
}

function parseSimpleNumbers(input: string): Problem[] {
  const lines = toLines(input)
  const signs = lines.pop()?.trim().split(/\s+/g)
  if (!signs) throw new Error('No signs line found')

  const numbers = lines.map((line) => line.trim().split(/\s+/g).map(toInt))
  return signs.map((sign, index): Problem => {
    if (sign !== '+' && sign !== '*') {
      throw new Error(`Invalid sign: ${sign}`)
    }

    return {
      sign,
      numbers: numbers.map((line) => line[index]),
    }
  })
}

function parseCephalopodNumbers(input: string): Problem[] {
  const lines = toLines(input)
  const signs = lines.pop()
  if (!signs) throw new Error('No signs line found')

  const sign = /[+*]/g
  let match
  const cols: [sign: string, index: number][] = []
  while ((match = sign.exec(signs))) {
    cols.push([match[0], match.index])
  }

  return cols.map(([sign, index], i): Problem => {
    const startOfNextCol =
      i + 1 < cols.length ? cols[i + 1][1] : lines[0].length + 1
    if (sign !== '+' && sign !== '*') {
      throw new Error(`Invalid sign: ${sign}`)
    }

    return {
      sign,
      numbers: Array.from({ length: startOfNextCol - index - 1 }).map((_, i) =>
        toInt(
          lines
            .map((line) => line[startOfNextCol - 2 - i])
            .join('')
            .trim(),
        ),
      ),
    }
  })
}

function solve({ numbers, sign }: Problem): number {
  switch (sign) {
    case '+':
      return getSum(numbers)
    case '*':
      return numbers.reduce((a, b) => a * b)
  }
}

export function test() {
  const worksheet = dedent`
    123 328  51 64 
     45 64  387 23 
      6 98  215 314
    *   +   *   +  
  `

  strictEqual(getSum(parseSimpleNumbers(worksheet).map(solve)), 4277556)

  const cephalopodProblems = parseCephalopodNumbers(worksheet)
  console.log(cephalopodProblems)
}

export function part1(input: string) {
  console.log(
    'the sum of all solutions is',
    getSum(parseSimpleNumbers(input).map(solve)),
  )
}

export function part2(input: string) {
  console.log(
    'the sum of all solutions is',
    getSum(parseCephalopodNumbers(input).map(solve)),
  )
}
