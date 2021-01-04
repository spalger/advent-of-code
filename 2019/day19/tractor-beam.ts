import { runIntCode } from '../lib/intcode-computer'

export function part1(input: string) {
  let affectedPoints = 0

  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      const [result] = runIntCode(input, [x, y])
      if (result === 1) {
        affectedPoints++
      }
    }
  }

  console.log(
    'the number of points affected by the tractor beam in the 50x50 test area is',
    affectedPoints,
  )
}
