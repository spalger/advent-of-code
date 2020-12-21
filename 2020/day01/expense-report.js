export function run(input) {
  const numbers = input
    .split('\n')
    .map((l) => parseInt(l.trim(), 10))
    .filter((n) => !Number.isNaN(n))

  for (const [ai, a] of numbers.entries()) {
    for (const [bi, b] of numbers.entries()) {
      for (const [ci, c] of numbers.entries()) {
        if (new Set([ai, bi, ci]).size !== 3) {
          continue
        }

        if (a + b + c === 2020) {
          console.log(
            'sum of',
            a,
            'and',
            b,
            'and',
            c,
            'is 2020 and they multiply to',
            a * b * c,
          )
          return
        }
      }
    }
  }

  console.log('none of the numbers in your expense report sum to 2020')
}
