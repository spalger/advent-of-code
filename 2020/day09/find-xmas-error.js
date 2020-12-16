const Fs = require('fs')

const windowSize = 25

/** @type {number[]} */
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

const findSequenceError = () => {
  for (let i = windowSize + 1; i < sequence.length; i++) {
    const num = sequence[i]
    const window = sequence.slice(i - windowSize, i)
    const sum = findSum(num, window)
    if (!sum) {
      return num
    }
  }
}

const sum = (nums) => nums.reduce((acc, n) => acc + n)
const min = (nums) => nums.reduce((acc, n) => Math.min(acc, n))
const max = (nums) => nums.reduce((acc, n) => Math.max(acc, n))

const findRange = (error) => {
  for (let startI = 0; startI < sequence.length; startI++) {
    for (let endI = startI + 1; endI < sequence.length; endI++) {
      const candidate = sequence.slice(startI, endI)
      const s = sum(candidate)
      if (s === error) {
        return candidate
      }
      if (s > error) {
        break
      }
    }
  }
}

const error = findSequenceError()
console.log('the sequence error is', error)
const weaknessRange = findRange(error)
console.log('the range of numbers adding up to the error is', weaknessRange)
console.log(
  'the sum of the extents is',
  min(weaknessRange) + max(weaknessRange),
)
