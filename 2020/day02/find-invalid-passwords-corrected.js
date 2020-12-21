export function run(input) {
  const passwords = input
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      const match = l.match(/^(\d+)-(\d+) (\w): (.+)/)
      if (!match) {
        throw new Error(`line doesn't match expected pattern: [${l}]`)
      }

      const [, posA, posB, letter, password] = match
      const charA = password[posA - 1]
      const charB = password[posB - 1]
      const valid =
        (charA === letter && charB !== letter) ||
        (charB === letter && charA !== letter)

      return { password, posA, posB, letter, valid }
    })

  const valid = passwords.filter((p) => p.valid)

  console.log(valid.length, 'of', passwords.length, 'are valid')
}
