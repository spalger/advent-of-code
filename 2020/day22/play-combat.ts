import dedent from 'dedent'

function parseDeck(chunk: string) {
  return chunk
    .split('\n')
    .filter((l) => l.trim())
    .slice(1)
    .map((l) => parseInt(l, 10))
}

function playCombat(player1Deck: number[], player2Deck: number[]) {
  const history = new Set<string>()

  while (player1Deck.length && player2Deck.length) {
    const snapshot = JSON.stringify([player1Deck, player2Deck])
    if (history.has(snapshot)) {
      // force player 1 win
      return [player1Deck, []]
    }
    history.add(snapshot)

    const card1 = player1Deck.shift()
    const card2 = player2Deck.shift()

    if (!card1 || !card2) {
      throw new Error('missing card')
    }

    if (player1Deck.length >= card1 && player2Deck.length >= card2) {
      const [player1SubDeck] = playCombat(
        player1Deck.slice(0, card1),
        player2Deck.slice(0, card2),
      )
      if (player1SubDeck.length) {
        player1Deck.push(card1, card2)
      } else {
        player2Deck.push(card2, card1)
      }
    } else if (card1 > card2) {
      player1Deck.push(card1, card2)
    } else {
      player2Deck.push(card2, card1)
    }
  }

  return [player1Deck, player2Deck]
}

export function test() {
  run(dedent`
    Player 1:
    9
    2
    6
    3
    1
    
    Player 2:
    5
    8
    4
    7
    10
  `)
}

export function run(input: string) {
  const [player1Chunk, player2Chunk] = input.split('\n\n')
  const [player1Deck, player2Deck] = playCombat(
    parseDeck(player1Chunk),
    parseDeck(player2Chunk),
  )

  console.log('player 1 final deck', player1Deck)
  console.log('player 2 final deck', player2Deck)

  const score = (player1Deck.length ? player1Deck : player2Deck)
    .slice()
    .reverse()
    .reduce((acc, card, i) => acc + (i + 1) * card, 0)

  console.log('player', player1Deck.length ? 1 : 2, 'won with', score)
}
