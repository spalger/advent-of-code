import { deepStrictEqual } from 'assert'

import { CountMap } from '../../common/count_map.ts'

type StartPositions = [number, number]
type PlayerState = { pos: number; score: number }
type PlayerStates = [PlayerState, PlayerState]
type Player = 0 | 1

const gsCache = new Map<string, GameState>()
class GameState {
  static start(positions: StartPositions) {
    return GameState.get(
      [
        // during play we use positions - 1 to make mod math more logical
        { pos: positions[0] - 1, score: 0 },
        { pos: positions[1] - 1, score: 0 },
      ],
      0,
    )
  }

  static get(p: PlayerStates, t: Player) {
    const key = `${t}:${p[0].pos}:${p[0].score}:${p[1].pos}:${p[1].score}`
    const cached = gsCache.get(key)
    if (cached) {
      return cached
    }

    const gs = new GameState(p, t)
    gsCache.set(key, gs)
    return gs
  }

  players: PlayerStates
  turn: Player
  constructor(players: PlayerStates, turn: Player) {
    this.players = players
    this.turn = turn
  }

  next(roll: number) {
    return GameState.get(
      [
        this.turn === 0 ? this.roll(this.turn, roll) : this.players[0],
        this.turn === 1 ? this.roll(this.turn, roll) : this.players[1],
      ],
      this.turn === 0 ? 1 : 0,
    )
  }

  private roll(player: Player, roll: number): PlayerState {
    const pos = (this.players[player].pos + roll) % 10
    const score = this.players[player].score + pos + 1
    return { pos, score }
  }

  score(player: 0 | 1) {
    return this.players[player].score
  }
}

function play(positions: [number, number]) {
  let rolls = 0

  let gs = GameState.start(positions)
  while (true) {
    const prev = gs
    gs = gs.next(++rolls + ++rolls + ++rolls)
    if (gs.score(prev.turn) >= 1000) {
      break
    }
  }

  const losingScore = Math.min(...gs.players.map((p) => p.score))
  const result = losingScore * rolls

  console.log('after', rolls, 'rolls the loser has', losingScore, 'points')
  console.log(losingScore, 'x', rolls, '=', result)

  return result
}

function simulateMultiverse(positions: StartPositions) {
  // a map of the possible rolls with three three-sided dice and
  // the number of times each combination would occur if all possible
  // rolls occurred
  const possibleRolls = new CountMap<number>()
  for (let a = 1; a <= 3; a++) {
    for (let b = 1; b <= 3; b++) {
      for (let c = 1; c <= 3; c++) {
        const roll = a + b + c
        possibleRolls.add(roll, 1)
      }
    }
  }

  const incompleteGames = new CountMap([[GameState.start(positions), 1]])
  const winsByPlayer = new CountMap<Player>()

  while (incompleteGames.size) {
    for (const [game, count] of incompleteGames.flush()) {
      // determine the next state based on every possible roll for the current player
      for (const [roll, rollCount] of possibleRolls.map) {
        const newCount = count * rollCount
        const newGame = game.next(roll)

        // if the player just won with that roll then the game is complete, count it as a win
        if (newGame.score(game.turn) >= 21) {
          winsByPlayer.add(game.turn, newCount)
        } else {
          incompleteGames.add(newGame, newCount)
        }
      }
    }
  }

  const [winner, loser] = [...winsByPlayer.map].sort((a, b) => b[1] - a[1])

  console.log('loser: player', loser[0], 'won', loser[1], 'games')
  console.log('winner: player', winner[0], 'won', winner[1], 'games')
  return [loser[1], winner[1]]
}

export function test() {
  deepStrictEqual(play([4, 8]), 739785)
  deepStrictEqual(
    simulateMultiverse([4, 8]),
    [341960390180808, 444356092776315],
  )
}

export function part1() {
  deepStrictEqual(play([10, 3]), 742257)
}
export function part2() {
  deepStrictEqual(simulateMultiverse([10, 3]), [49950658789496, 93726416205179])
}
