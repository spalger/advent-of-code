export function run(input) {
  const buses = input
    .split('\n')[1]
    .trim()
    .split(',')
    .map((t, i) => {
      if (t === 'x') {
        return
      }

      return {
        i: BigInt(i),
        id: BigInt(t),
      }
    })
    .filter(Boolean)

  const time = chr(
    buses.map((b) => b.id),
    buses.map((b) => b.id - b.i),
  )

  console.log(
    'at',
    time,
    'bus',
    buses[0].id,
    'leaves the station and then every other bus departs in the subsequent minute',
  )

  // Extended GCD
  function egcd(a, b) {
    if (b === 0n) {
      return [1n, 0n]
    }

    const [s, t] = egcd(b, a % b)
    return [t, s - (a / b) * t]
  }

  // Calculate the inverse modulo
  function mod_inv(a, b) {
    const [x, y] = egcd(a, b)
    return a * x + b * y === 1n ? x : null
  }

  // Modified rem that handles converting negative results to positive
  function mod(a, m) {
    const x = a % m
    return x < 0n ? x + m : x
  }

  function calc_inverses(ns, ms) {
    const result = []
    for (const [i, n] of ns.entries()) {
      const mi = mod_inv(n, ms[i])
      if (mi === null) {
        return null
      }
      result.push(mi)
    }
    return result
  }

  function chr(mods, remainders) {
    // Multiply all the modulus values together
    const modpi = mods.reduce((acc, m) => acc * m)

    // Calculate Chinese Remainder Theorum Moduli based on how many times each mod value is divisable by the total.
    const crt_mods = mods.map((m) => modpi / m)

    const inv = calc_inverses(crt_mods, mods)

    if (inv === null) {
      return null
    }

    // Multiply the remainders by the inverses and then multiply by the CRT Moduli
    const sum = crt_mods.reduce(
      (acc, mod, i) => acc + mod * remainders[i] * inv[i],
      0n,
    )
    return mod(sum, modpi)
  }
}
