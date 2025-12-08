import { strictEqual } from 'assert'

import { dedent, toLines } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'

function getDepth(measurements: number[]) {
  let depth = 0
  let prev = measurements[0]
  for (const measurement of measurements.slice(1)) {
    if (prev < measurement) {
      depth += 1
    }
    prev = measurement
  }

  return depth
}

function smoothMeasurements(measurements: number[]) {
  const smooth: number[] = []
  for (let i = 0; i < measurements.length - 2; i++) {
    smooth.push(measurements[i] + measurements[i + 1] + measurements[i + 2])
  }
  return smooth
}

export function test() {
  const measurements = toLines(dedent`
    199
    200
    208
    210
    200
    207
    240
    269
    260
    263
  `).map(toInt)

  strictEqual(getDepth(measurements), 7)
  strictEqual(getDepth(smoothMeasurements(measurements)), 5)
}

export function part1(input: string) {
  console.log('depth is', getDepth(toLines(input).map(toInt)))
}

export function part2(input: string) {
  console.log(
    'depth based on smoothed measurements is',
    getDepth(smoothMeasurements(toLines(input).map(toInt))),
  )
}
