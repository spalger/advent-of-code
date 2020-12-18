const Fs = require('fs')

/**
 * Hack the input, parse math problems into JSON
 * @param {string} problem
 */
function parse(problem) {
  return JSON.parse(
    `[${problem
      .replace(/(\+|\*)/g, '"$1"')
      .split('(')
      .join('[')
      .split(')')
      .join(']')
      .split(' ')
      .join(',')}]`,
  )
}

function evaluate(expression) {
  if (typeof expression === 'number') {
    return expression
  }

  return expression.reduce((acc, token, i, list) => {
    if (acc === null) {
      //initialize with the first value
      return evaluate(token)
    }

    if (token === '+') {
      return acc + evaluate(list[i + 1])
    }

    if (token === '*') {
      return acc * evaluate(list[i + 1])
    }

    return acc
  }, null)
}

const problems = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((problem) => parse(problem))

console.log(
  'the sum of the solutions of each problem is',
  problems.map(evaluate).reduce((acc, n) => acc + n),
)
