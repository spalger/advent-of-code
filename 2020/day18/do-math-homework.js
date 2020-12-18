const Fs = require('fs')

/** @param {string} input */
function parse(input) {
  let i = 0
  const tokens = []
  for (; i < input.length; i++) {
    const char = input[i]
    if (char === ' ') {
      // ignore spaces
      continue
    }

    if (char === '+' || char === '*') {
      tokens.push(char)
      continue
    }

    if (char === '(') {
      // parse sub-expression
      const result = parse(input.slice(i + 1))
      i = i + result.consumed.length
      tokens.push(result.tokens)
      continue
    }

    if (char === ')') {
      // a closing parenthesis means this sub-expression is complete
      break
    }

    // attempt to parse char as number
    const num = parseInt(char, 10)
    if (!Number.isNaN(num)) {
      tokens.push(num)
      continue
    }

    throw new Error(`unexpected token "${char}" as position ${i} in "${input}"`)
  }

  return {
    consumed: input.slice(0, i + 1),
    tokens,
  }
}

function evaluateAddition(expression) {
  return expression.reduce((acc, token, i, list) => {
    if (token === '+') {
      return [
        ...acc.slice(0, -1),
        evaluate(acc[acc.length - 1]) + evaluate(list[i + 1]),
      ]
    }

    // skip tokens after +
    if (list[i - 1] === '+') {
      return acc
    }

    return [...acc, token]
  }, [])
}

function evaluate(expression) {
  if (typeof expression === 'number') {
    return expression
  }

  return evaluateAddition(expression).reduce((acc, token, i, list) => {
    if (acc === null) {
      //initialize with the first value
      return evaluate(token)
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
  .map((problem) => parse(problem).tokens)

console.log(
  'the sum of the solutions of each problem is',
  problems.map(evaluate).reduce((acc, n) => acc + n),
)
