import { deepStrictEqual } from 'assert'
import { toLines, dedent } from '../../common/string'

function parseBinary(string: string) {
  const num = parseInt(string, 2)
  if (isNaN(num)) {
    throw new Error(`string [${string}] is not valid binary`)
  }
  return num
}

function findCommons(input: string[]) {
  const width = input[0].length
  const result = new Array(width)

  for (let i = 0; i < width; i++) {
    const count = input.filter((l) => l[i] === '1').length
    result[i] = count > input.length / 2
  }

  return result
}

function analyze(input: string[]) {
  const oneMostCommon = findCommons(input)

  return {
    gamma: parseBinary(oneMostCommon.map((x) => (x ? 1 : 0)).join('')),
    episilon: parseBinary(oneMostCommon.map((x) => (x ? 0 : 1)).join('')),
  }
}

export function test() {
  const input = toLines(dedent`
    00100
    11110
    10110
    10111
    10101
    01111
    00111
    11100
    10000
    11001
    00010
    01010
  `)

  deepStrictEqual(analyze(input), {
    gamma: 22,
    episilon: 9,
  })
}

export function part1(input: string) {
  const rates = analyze(toLines(input))
  console.log('rates', rates)
  console.log('power consumption:', rates.episilon * rates.gamma)
}
