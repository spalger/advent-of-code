const Fs = require('fs')

/** @type {number[]} */
const adapters = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((n) => parseInt(n, 10))
  .sort((a, b) => a - b)

const allJolts = [0, ...adapters, adapters[adapters.length - 1] + 3]

// when two adapters/items have a difference in jolts of three then all possible
// paths must include those two adapters/items, so we can split the problem into multiple
// smaller problems by splitting the sorted list of jolts by sections which have a
// difference of three
const sections = []
for (let splitStart = 0; splitStart < allJolts.length; ) {
  for (let splitEnd = splitStart; splitEnd < allJolts.length; splitEnd++) {
    if (
      splitEnd + 1 === allJolts.length ||
      allJolts[splitEnd + 1] - allJolts[splitEnd] === 3
    ) {
      sections.push(allJolts.slice(splitStart, splitEnd + 1))
      splitStart = splitEnd + 1
      break
    }
  }
}

function countPaths(someJolts) {
  const steps = [0]
  let completedPaths = 0
  while (steps.length) {
    const step = steps.shift()
    if (step + 1 === someJolts.length) {
      completedPaths += 1
    } else {
      // add new steps for all subsequent jolt values which are less than three units greater
      for (
        let nextStep = step + 1;
        nextStep < someJolts.length &&
        someJolts[nextStep] - someJolts[step] <= 3;
        nextStep++
      ) {
        steps.push(nextStep)
      }
    }
  }
  return completedPaths
}

console.log(
  'unique adapter combinations',
  sections
    .map((section) => countPaths(section))
    .reduce((acc, pathCount) => acc * pathCount),
)
