const Fs = require('fs')
const { performance } = require('perf_hooks')

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

function resolveAddition(expression) {
  return expression.reduce((acc, token, i, list) => {
    if (token === '+') {
      acc.push(evaluate(acc.pop()) + evaluate(list[i + 1]))
      return acc
    }

    // skip tokens after +
    if (list[i - 1] === '+') {
      return acc
    }

    acc.push(token)
    return acc
  }, [])
}

function evaluate(expression) {
  if (typeof expression === 'number') {
    return expression
  }

  return resolveAddition(expression).reduce(
    (acc, token) => (token === '*' ? acc : acc * evaluate(token)),
    1,
  )
}

const problems = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((problem) => parse(problem).tokens)

const start = performance.now()
const solutions = problems.map(evaluate)
const end = performance.now()

console.log(
  'the sum of the solutions of each problem is',
  solutions.reduce((acc, n) => acc + n),
  `(took ${(end - start).toFixed(3)} ms)`,
)
