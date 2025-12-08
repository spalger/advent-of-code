import { deepStrictEqual } from 'assert'
import { toLines, dedent } from '../../common/string.ts'
import { binaryToInt } from '../../common/number.ts'

function getMostCommon(input: string[], i: number) {
  const half = input.length / 2
  const count = input.filter((l) => l[i] === '1').length
  return count === half ? null : count < half ? 0 : 1
}

function analyze(input: string[]) {
  const width = input[0].length
  const oneMostCommon = new Array(width)
  for (let i = 0; i < width; i++) {
    oneMostCommon[i] = getMostCommon(input, i) === 1
  }

  return {
    gamma: binaryToInt(oneMostCommon.map((x) => (x ? 1 : 0)).join('')),
    episilon: binaryToInt(oneMostCommon.map((x) => (x ? 0 : 1)).join('')),
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

  const oxygen = findOxygenGeneratorRating(input)
  console.log('oxy gen:', oxygen)

  const co2 = findCo2ScrubberRating(input)
  console.log('co2:', co2)
}

export function part1(input: string) {
  const rates = analyze(toLines(input))
  console.log('rates', rates)
  console.log('power consumption:', rates.episilon * rates.gamma)
}

function findOxygenGeneratorRating(input: string[]) {
  const width = input[0].length
  let options = input.slice(0)
  for (let i = 0; i < width; i++) {
    const x = `${getMostCommon(options, i) ?? 1}`
    options = options.filter((n) => n[i] === x)

    if (options.length === 1) {
      return binaryToInt(options[0])
    }

    if (options.length === 0) {
      throw new Error('all numbers excluded')
    }
  }

  throw new Error('unable to narrow down input to one number')
}

function findCo2ScrubberRating(input: string[]) {
  const width = input[0].length
  let options = input.slice(0)
  for (let i = 0; i < width; i++) {
    const x = `${getMostCommon(options, i) === 0 ? 1 : 0}`
    options = options.filter((n) => n[i] === x)

    if (options.length === 1) {
      return binaryToInt(options[0])
    }

    if (options.length === 0) {
      throw new Error('all numbers excluded')
    }
  }

  throw new Error('unable to narrow down input to one number')
}

export function part2(input: string) {
  const lines = toLines(input)
  const oxygen = findOxygenGeneratorRating(lines)
  const co2 = findCo2ScrubberRating(lines)

  console.log('oxygen:', oxygen)
  console.log('co2:', co2)
  console.log('life support rating:', oxygen * co2)
}
