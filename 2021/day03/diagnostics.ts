import { deepStrictEqual } from 'assert'
import { toLines, dedent } from '../../common/string'

function parseBinary(string: string) {
  const num = parseInt(string, 2)
  if (isNaN(num)) {
    throw new Error(`string [${string}] is not valid binary`)
  }
  return num
}

function analyze(input: string[]) {
  const width = input[0].length

  let gamma = ''
  let epislon = ''

  for (let i = 0; i < width; i++) {
    let count1 = 0
    let count0 = 0
    for (const row of input) {
      if (row[i] === '1') {
        count1 += 1
      } else {
        count0 += 1
      }
    }

    if (count1 > count0) {
      gamma += '1'
      epislon += '0'
    } else {
      gamma += '0'
      epislon += '1'
    }
  }

  return {
    gamma: parseBinary(gamma),
    episilon: parseBinary(epislon),
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
