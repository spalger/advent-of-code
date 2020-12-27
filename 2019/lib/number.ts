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
