import { deepStrictEqual } from 'assert'

import { toLines, dedent } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'
import { repeat } from '../../common/array.ts'

class Deck {
  readonly size: number
  cards: number[]

  constructor(size: number) {
    this.size = size
    this.cards = repeat(this.size, (i) => i)
  }

  dealIntoNewStack() {
    this.cards.reverse()
  }

  cut(by: number) {
    if (by < 0) {
      by = this.size + by
    }

    const cut = this.cards.splice(0, by)
    this.cards = [...this.cards, ...cut]
  }

  dealWithIncrement(increment: number) {
    const newDeck = new Array<number>(this.size)
    let pos = 0
    for (const card of this.cards) {
      newDeck[pos] = card
      pos = (pos + increment) % this.size
    }
    this.cards = newDeck
  }

  shuffle(instructions: string) {
    for (const instruction of toLines(instructions)) {
      if (instruction.trim() === 'deal into new stack') {
        this.dealIntoNewStack()
        continue
      }

      if (instruction.startsWith('cut ')) {
        const n = toInt(instruction.split(' ')[1])
        this.cut(n)
        continue
      }

      if (instruction.startsWith('deal with increment ')) {
        const n = toInt(instruction.split(' ')[3])
        this.dealWithIncrement(n)
        continue
      }

      throw new Error(`unexpected instruction [${instruction}]`)
    }

    return this
  }
}

export function test() {
  deepStrictEqual(
    new Deck(10).shuffle(dedent`
      deal with increment 7
      deal into new stack
      deal into new stack
    `).cards,
    [0, 3, 6, 9, 2, 5, 8, 1, 4, 7],
  )

  deepStrictEqual(
    new Deck(10).shuffle(dedent`
      cut 6
      deal with increment 7
      deal into new stack
    `).cards,
    [3, 0, 7, 4, 1, 8, 5, 2, 9, 6],
  )

  deepStrictEqual(
    new Deck(10).shuffle(dedent`
      deal into new stack
      cut -2
      deal with increment 7
      cut 8
      cut -4
      deal with increment 7
      cut 3
      deal with increment 9
      deal with increment 3
      cut -1
    `).cards,
    [9, 2, 5, 8, 1, 4, 7, 0, 3, 6],
  )
}

export function part1(input: string) {
  const deck = new Deck(10007).shuffle(input)

  console.log(
    'after shuffling the position of card 2019 is',
    deck.cards.indexOf(2019),
  )
}
