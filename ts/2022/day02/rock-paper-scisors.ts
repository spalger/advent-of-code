import { strictEqual } from 'assert'

import { dedent, toLines } from '../../common/string.ts'

const ROCK = Symbol('rock')
const PAPER = Symbol('paper')
const SCISSORS = Symbol('scissors')

type Play = typeof ROCK | typeof PAPER | typeof SCISSORS

const BEATS: Record<Play, Play> = {
  [ROCK]: SCISSORS,
  [PAPER]: ROCK,
  [SCISSORS]: PAPER,
}
const LOOSES_TO: Record<Play, Play> = {
  [SCISSORS]: ROCK,
  [ROCK]: PAPER,
  [PAPER]: SCISSORS,
}
const SCORE_PLAY = {
  [ROCK]: 1,
  [PAPER]: 2,
  [SCISSORS]: 3,
}
const SCORE_OUTCOME = {
  lost: 0,
  draw: 3,
  won: 6,
}
type Outcome = keyof typeof SCORE_OUTCOME

function toPlay(glyph: string) {
  switch (glyph) {
    case 'A':
    case 'X':
      return ROCK
    case 'B':
    case 'Y':
      return PAPER
    case 'C':
    case 'Z':
      return SCISSORS
    default:
      throw new Error(`invalid glyph played ${glyph}`)
  }
}

function toOutcome(glyph: string): Outcome {
  switch (glyph) {
    case 'X':
      return 'lost'
    case 'Y':
      return 'draw'
    case 'Z':
      return 'won'
    default:
      throw new Error(`invalid outcome glyph ${glyph}`)
  }
}

const parse1 = (list: string) =>
  toLines(list).map((line): [Play, Play] => {
    const [a, b] = line.split(' ')
    return [toPlay(a), toPlay(b)]
  })

const parse2 = (list: string) =>
  toLines(list).map((line): [Play, Outcome] => {
    const [a, b] = line.split(' ')
    return [toPlay(a), toOutcome(b)]
  })

function score1(rounds: Array<[Play, Play]>) {
  let score = 0
  for (const [them, me] of rounds) {
    score += SCORE_PLAY[me]
    if (me === them) {
      score += SCORE_OUTCOME.draw
    } else if (BEATS[me] === them) {
      score += SCORE_OUTCOME.won
    } else {
      score += SCORE_OUTCOME.lost
    }
  }
  return score
}

function score2(rounds: Array<[Play, Outcome]>) {
  let score = 0
  for (const [them, outcome] of rounds) {
    score += SCORE_OUTCOME[outcome]
    if (outcome === 'draw') {
      score += SCORE_PLAY[them]
    } else if (outcome === 'lost') {
      score += SCORE_PLAY[BEATS[them]]
    } else {
      score += SCORE_PLAY[LOOSES_TO[them]]
    }
  }
  return score
}

export function test() {
  const rounds = dedent`
    A Y
    B X
    C Z  
  `

  strictEqual(score1(parse1(rounds)), 15)
  strictEqual(score2(parse2(rounds)), 12)
}

export function part1(input: string) {
  console.log('my score at the end of all rounds is', score1(parse1(input)))
}

export function part2(input: string) {
  console.log('my score at the end of all rounds is', score2(parse2(input)))
}
