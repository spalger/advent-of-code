export function bitsToInt(bits: number[]) {
  return binaryToInt(bits.join(''))
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
