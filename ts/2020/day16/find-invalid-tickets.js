class Rule {
  constructor(name, rangesChunk) {
    this.name = name
    this.ranges = rangesChunk.split(' or ').map((r) => {
      const [from, to] = r.trim().split('-')
      return { from: parseInt(from, 10), to: parseInt(to, 10) }
    })
  }

  match(n) {
    return this.ranges.some(({ from, to }) => n >= from && n <= to)
  }
}

class Ticket {
  constructor(ticketChunk) {
    this.numbers = ticketChunk
      .split(',')
      .map((n) => parseInt(n, 10))
      .filter((n) => !Number.isNaN(n))
  }
}

export function run(input) {
  const [rulesChunk, , nearbyTicketsChunk] = input.split('\n\n')
  const rules = rulesChunk
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      const [name, rangesChunk] = l.split(':')
      return new Rule(name, rangesChunk)
    })

  const nearbyTickets = nearbyTicketsChunk
    .split('\n')
    .filter((l) => l.trim())
    .slice(1)
    .map((l) => new Ticket(l))

  const invalidTickets = new Set()
  const invalidNumbers = []
  for (const ticket of nearbyTickets) {
    for (const n of ticket.numbers) {
      if (!rules.some((r) => r.match(n))) {
        invalidNumbers.push(n)
        invalidTickets.add(ticket)
      }
    }
  }

  console.log(
    invalidTickets.size,
    'of',
    nearbyTickets.length,
    'nearby tickets are invalid',
  )

  console.log(
    'the sum of all invalid numbers is',
    invalidNumbers.reduce((acc, n) => acc + n),
  )
}
