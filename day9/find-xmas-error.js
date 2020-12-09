const Fs = require('fs')
const sequence = Fs.readFileSync('./input.txt', 'utf8')
  .split('\n')
  .filter((l) => l.trim())
  .map((n) => parseInt(n, 10))

const findSum = (sum, options) => {
  for (const a of options) {
    for (const b of options) {
      if (a !== b && a + b === sum) {
        return [a, b]
      }
    }
  }
}

const windowSize = 25
for (let i = windowSize + 1; i < sequence.length; i++) {
  const num = sequence[i]
  const window = sequence.slice(i - windowSize, i)
  const sum = findSum(num, window)
  if (!sum) {
    console.log(
      "first number which doesn't follow sequence is",
      num,
      'in row',
      i + 1,
    )
  }
}
