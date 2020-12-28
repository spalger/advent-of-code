export function toInt(s: string) {
  return parseInt(s, 10)
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
