import { deepStrictEqual } from 'assert'

import { repeat } from '../../common/array.ts'
import { toInt } from '../../common/number.ts'

const onesDigit = (n: number) => Math.abs(n % 10)

const getMultipliers = (width: number) => {
  const BASE_PATTERN = [0, 1, 0, -1]
  return repeat(width, (row) => {
    const repeated = BASE_PATTERN.reduce(
      (acc: number[], n) => [...acc, ...repeat(row + 1, () => n)],
      [],
    )

    return repeat(width + 1, (i) => repeated[i % repeated.length]).slice(1)
  })
}

const sumFrom = (
  arr: number[],
  start: number,
  fn: (n: number, i: number) => number,
) => {
  let sum = 0
  for (let i = start; i < arr.length; i++) {
    sum += fn(arr[i], i)
  }
  return sum
}

const parse = (input: string) => input.split('').map(toInt)

function fixTransmission(input: string, phases: number) {
  const multipliers = getMultipliers(input.length)
  for (let phase = 1, output = parse(input); ; phase++) {
    output = repeat(input.length, (row) =>
      onesDigit(sumFrom(output, row, (n, col) => n * multipliers[row][col])),
    )

    if (phase === phases) {
      return output.join('')
    }
  }
}

function findMessage(input: string, phases: number) {
  const offset = toInt(input.slice(0, 7))

  for (let phase = 1, output = parse(input); ; phase++) {
    const newOutput = new Array(output.length)
    let sum = 0
    for (let i = output.length - 1; i >= output.length / 2; i--) {
      sum += output[i]
      newOutput[i] = sum % 10
    }
    output = newOutput
    if (phase === phases) {
      return output.slice(offset, offset + 8).join('')
    }
  }
}

export function test() {
  deepStrictEqual(getMultipliers(8), [
    [1, 0, -1, 0, 1, 0, -1, 0],
    [0, 1, 1, 0, 0, -1, -1, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
  ])

  deepStrictEqual(fixTransmission(`12345678`, 4), `01029498`)

  deepStrictEqual(
    fixTransmission(`80871224585914546619083218645595`, 100).slice(0, 8),
    '24176176',
  )

  deepStrictEqual(
    fixTransmission(`19617804207202209144916044189917`, 100).slice(0, 8),
    '73745418',
  )

  deepStrictEqual(
    fixTransmission(`69317163492948606335995924319873`, 100).slice(0, 8),
    '52432133',
  )
}

export function part1(input: string) {
  console.log(
    'the first 8 digest of the fixed transmission after 100 phases of FFT are',
    fixTransmission(input.trim(), 100).slice(0, 8),
  )
}

export function part2(input: string) {
  console.log(
    'the message in the data is',
    findMessage(input.trim().repeat(10_000), 100),
  )
}
