const Fs = require('fs')

/** @type {number[]} */
const adapters = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((n) => parseInt(n, 10))
  .sort((a, b) => a - b)

const jolts = [0, ...adapters, adapters[adapters.length - 1] + 3]

// the number of possibilities leading to the end from a specific index
/** @type {Map<number, number>} */
const cache = new Map()

function countPossibilities(fromI) {
  if (fromI + 1 === jolts.length) {
    return 1
  }

  if (cache.has(fromI)) {
    return cache.get(fromI)
  }

  let possibilities = 0
  for (
    let i = fromI + 1;
    i < jolts.length && jolts[i] - jolts[fromI] <= 3;
    i++
  ) {
    possibilities += countPossibilities(i)
  }

  cache.set(fromI, possibilities)
  return possibilities
}

console.log('unique adapter combinations', countPossibilities(0))
