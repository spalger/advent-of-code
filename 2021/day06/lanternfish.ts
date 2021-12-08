import { toInt } from '../../common/number'

function fishGame(startingAges: number[], days: number) {
  const fish = new Array(9).fill(0)

  for (const age of startingAges) {
    fish[age] += 1
  }

  for (let day = 0; day < days; day++) {
    const born = fish.shift()
    fish.push(born)
    fish[6] += born
  }

  return fish.reduce((acc, count) => acc + count, 0)
}

export function test() {
  const ages = '3,4,3,1,2'.split(',').map(toInt)
  console.log('after 80 days', fishGame(ages, 80), 'fish exist')
}

export function part1(input: string) {
  const ages = input.split(',').map(toInt)
  console.log('after 80 days', fishGame(ages, 80), 'fish exist')
}

export function part2(input: string) {
  const ages = input.split(',').map(toInt)
  console.log('after 256 days', fishGame(ages, 256), 'fish exist')
}
