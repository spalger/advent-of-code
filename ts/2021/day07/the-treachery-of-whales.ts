import { toInt } from '../../common/number'

type CostCalc = (from: number, to: number) => number

const fixedCost: CostCalc = (from, to) => Math.abs(from - to)
const growingCost: CostCalc = (from, to) => {
  const dist = fixedCost(from, to)
  return (dist * (dist + 1)) / 2
}

function findCheapestTrip(
  startPositions: number[],
  getCost: CostCalc = fixedCost,
) {
  const max = startPositions.reduce((acc, p) => Math.max(acc, p))
  const min = startPositions.reduce((acc, p) => Math.min(acc, p))
  const offset = min

  const map = new Array<number>(max - min + 1).fill(0)
  for (const pos of startPositions) {
    map[pos - offset] += 1
  }

  let cheapestTrip
  for (const [pos] of map.entries()) {
    const cost = map
      .map((count, otherPos) => count * getCost(pos, otherPos))
      .reduce((acc, fuel) => acc + fuel, 0)

    if (!cheapestTrip || cheapestTrip.cost > cost) {
      cheapestTrip = {
        cost,
        pos,
      }
    }
  }

  if (!cheapestTrip) {
    throw new Error('map is empty')
  }

  console.log(
    'align the craps at position',
    cheapestTrip.pos + offset,
    'for a cost of',
    cheapestTrip.cost,
  )
}

export function test() {
  const positions = `16,1,2,0,4,2,7,1,2,14`.split(',').map(toInt)
  findCheapestTrip(positions)
  findCheapestTrip(positions, growingCost)
}

export function part1(input: string) {
  const positions = input.split(',').map(toInt)
  findCheapestTrip(positions)
}

export function part2(input: string) {
  const positions = input.split(',').map(toInt)
  findCheapestTrip(positions, growingCost)
}
