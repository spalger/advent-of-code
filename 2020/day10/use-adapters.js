const Fs = require('fs')

/** @type {number[]} */
const adapters = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((n) => parseInt(n, 10))
  .sort((a, b) => a - b)

// phone consumes 3 more jolts than the highest adapter
const phone = adapters[adapters.length - 1] + 3

/** @type {Map<number, number>} */
const diffCounts = new Map()
for (const [i, jolts] of [...adapters, phone].entries()) {
  const prev = i > 0 ? adapters[i - 1] : 0
  const diff = jolts - prev
  diffCounts.set(diff, (diffCounts.get(diff) ?? 0) + 1)
}

console.log('the count of jolt differences is', diffCounts)
console.log(
  'the number of 1 jolt differences * 3 jolt diffferences is',
  diffCounts.get(1) * diffCounts.get(3),
)
