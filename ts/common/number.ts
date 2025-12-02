export function bitsToInt(bits: number[]) {
  return binaryToInt(bits.join(''))
}

export function isOdd(n: number) {
  return n % 2 !== 0
}

function checkNum(n: number, input: string, expected: string) {
  if (Number.isNaN(n)) {
    throw new Error(`string [${input}] can't be parsed as a ${expected}`)
  }
  return n
}

export function binaryToInt(s: string) {
  return checkNum(parseInt(s, 2), s, 'binary')
}

export function toInt(s: string) {
  return checkNum(parseInt(s, 10), s, 'integer')
}

export function maybeToInt(s: string) {
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? undefined : n
}

const factorCache = new Map<number, number[]>()
/**
 * Produce a list of factors for n (the numbers which divide n evenly)
 */
export function factors(n: number): number[] {
  const cached = factorCache.get(n)
  if (cached) {
    return cached
  }

  const result: number[] = []
  const max = Math.sqrt(n)
  for (let i = 1; i <= max; i++) {
    if (n % i === 0) {
      result.push(i)

      const pair = n / i
      if (i !== pair) {
        result.push(pair)
      }
    }
  }

  factorCache.set(n, result)
  return result
}

/**
 * Find the greatest common factor bettwen a and b
 */
export function gcf(a: number, b: number) {
  a = Math.abs(a)
  b = Math.abs(b)

  if (b > a) {
    ;[a, b] = [b, a]
  }

  while (true) {
    a %= b
    if (a === 0) return b
    b %= a
    if (b === 0) return a
  }
}

/**
 * Find the greatest common divisor of a and b
 */
export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

/**
 * Find the least common multiple of a and b
 */
export function lcm(a: number, b: number) {
  return Math.abs(a * b) / gcd(a, b)
}

export const max = (a: number, b: number) => Math.max(a, b)
export const sum = (a: number, b: number) => a + b

/**
 * Get the max from a list of numbers
 */
export function getMax(numbers: number[]) {
  return numbers.reduce(max, -Infinity)
}

export function getSum(numbers: number[]) {
  return numbers.reduce(sum, 0)
}
