import { deepStrictEqual } from 'assert'

import chalk from 'chalk'

import { dedent } from '../lib/string'
import { toInt } from '../lib/number'

function wrap(arr: number[], width: number) {
  if (arr.length % width !== 0) {
    throw new Error(
      `arr with length [${arr.length}] does not evenly wrap to width [${width}]`,
    )
  }

  const wrapped = []
  const rowCount = arr.length / width
  for (let i = 0; i < rowCount; i++) {
    const rowOffset = width * i
    wrapped.push(arr.slice(rowOffset, rowOffset + width))
  }
  return wrapped
}

function readImageLayers(width: number, height: number, imgData: string) {
  const pixels = imgData.trim().split('').map(toInt)
  return wrap(pixels, width * height).map((layer) => wrap(layer, width))
}

function renderImage(width: number, height: number, imgData: string) {
  const layers = readImageLayers(width, height, imgData)
  const composite: string[][] = []
  for (let y = 0; y < height; y++) {
    const row: string[] = []
    composite.push(row)

    for (let x = 0; x < width; x++) {
      const layer = layers.find((l) => l[y][x] !== 2)
      row.push(layer ? `${layer[y][x]}` : `2`)
    }
  }

  return composite.map((row) => row.join('')).join('\n')
}

export function test() {
  deepStrictEqual(readImageLayers(3, 2, `123456789012`), [
    [
      [1, 2, 3],
      [4, 5, 6],
    ],
    [
      [7, 8, 9],
      [0, 1, 2],
    ],
  ])

  deepStrictEqual(
    renderImage(2, 2, '0222112222120000'),
    dedent`
      01
      10
    `,
  )
}

export function part1(input: string) {
  const counts = readImageLayers(25, 6, input)
    .map((layer) => {
      const counts = new Map<number, number>()
      for (const n of layer.flat()) {
        counts.set(n, (counts.get(n) ?? 0) + 1)
      }
      return counts
    })
    .reduce((acc, counts) =>
      (counts.get(0) ?? 0) < (acc.get(0) ?? 0) ? counts : acc,
    )

  console.log(
    'layer with the fewest zeros has',
    counts.get(1),
    'ones and',
    counts.get(2),
    'twos. Product is',
    (counts.get(1) ?? 0) * (counts.get(2) ?? 0),
  )
}

export function part2(input: string) {
  console.log('the rendered image is:')
  console.log(
    renderImage(25, 6, input)
      .split('0')
      .join(chalk.black('█'))
      .split('1')
      .join(chalk.white('█')),
  )
}
