function parse(input: string) {
  return input
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => parseInt(l, 10))
}

export function part1(input: string) {
  const masses = parse(input)

  const requiredFuel = masses.reduce(
    (acc, mass) => acc + (Math.floor(mass / 3) - 2),
    0,
  )

  console.log(
    'required fuel to launch our',
    masses.length,
    'modules is',
    requiredFuel,
  )
}

export function part2(input: string) {
  const masses = parse(input)
  let requiredFuel = 0

  while (masses.length) {
    const mass = masses.shift()
    if (mass === undefined) break

    const fuel = Math.max(Math.floor(mass / 3) - 2, 0)
    requiredFuel += fuel
    if (fuel > 0) {
      masses.push(fuel)
    }
  }

  console.log(
    'required fuel to launch our rocket, including fuel to fly the fuel, is',
    requiredFuel,
  )
}
