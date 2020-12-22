function parseDeck(chunk) {
  return chunk
    .split('\n')
    .filter((l) => l.trim())
    .slice(1)
    .map((l) => parseInt(l, 10))
}

export function run(input: string) {
  const [player1Chunk, player2Chunk] = input.split('\n\n')

  const player1Deck = parseDeck(player1Chunk)
  const player2Deck = parseDeck(player2Chunk)

  while (player1Deck.length && player2Deck.length) {
    const card1 = player1Deck.shift()!
    const card2 = player2Deck.shift()!

    if (card1 > card2) {
      player1Deck.push(card1, card2)
    } else {
      player2Deck.push(card2, card1)
    }
  }

  console.log('player 1 final deck', player1Deck)
  console.log('player 2 final deck', player2Deck)

  const score = (player1Deck.length ? player1Deck : player2Deck)
    .slice()
    .reverse()
    .reduce((acc, card, i) => acc + (i + 1) * card, 0)

  console.log('player', player1Deck.length ? 1 : 2, 'won with', score)
}
