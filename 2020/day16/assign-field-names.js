const Fs = require('fs')
const input = Fs.readFileSync('input.txt', 'utf-8')

class Rule {
  constructor(name, rangesChunk) {
    /** @type {string} */
    this.name = name
    /** @type {Array<{ from: number, to: number }>} */
    this.ranges = rangesChunk.split(' or ').map((r) => {
      const [from, to] = r.trim().split('-')
      return { from: parseInt(from, 10), to: parseInt(to, 10) }
    })
  }

  match(n) {
    return this.ranges.some(({ from, to }) => n >= from && n <= to)
  }
}

const [rulesChunk, myTicketChunk, nearbyTicketsChunk] = input.split('\n\n')
const rules = rulesChunk
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    const [name, rangesChunk] = l.split(':')
    return new Rule(name, rangesChunk)
  })

class Ticket {
  constructor(ticketChunk) {
    /** @type {number[]} */
    this.numbers = ticketChunk
      .split(',')
      .map((n) => parseInt(n, 10))
      .filter((n) => !Number.isNaN(n))
  }
}

const myTicket = new Ticket(myTicketChunk.split('\n')[1])

const tickets = [
  myTicket,
  ...nearbyTicketsChunk
    .split('\n')
    .filter((l) => l.trim())
    .slice(1)
    .map((l) => new Ticket(l))
    .filter((t) => t.numbers.every((n) => rules.some((r) => r.match(n)))),
]

/** @type {Map<number, Rule>} */
const assignedRules = new Map()

/** @type {Map<number, Set<Rule>>} */
const unassignedCols = new Map(
  myTicket.numbers.map((_, i) => [i, new Set(rules)]),
)

const assignRule = (col, rule) => {
  assignedRules.set(col, rule)
  unassignedCols.delete(col)
  for (const [i, options] of unassignedCols) {
    options.delete(rule)
    if (options.size === 1) {
      assignRule(i, [...options][0])
    }
  }
}

for (const ticket of tickets) {
  for (const [i, possibleRules] of unassignedCols) {
    for (const rule of possibleRules) {
      if (!rule.match(ticket.numbers[i])) {
        possibleRules.delete(rule)
      }

      if (possibleRules.size === 1) {
        assignRule(i, [...possibleRules][0])
      }
    }
  }

  if (unassignedCols.size === 0) {
    break
  }
}

console.log(
  'the product of all departure* fields on my ticket is',
  Array.from(assignedRules)
    .map(([col, rule]) =>
      rule.name.startsWith('departure') ? myTicket.numbers[col] : null,
    )
    .filter((n) => n !== null)
    .reduce((acc, n) => acc * n),
)
