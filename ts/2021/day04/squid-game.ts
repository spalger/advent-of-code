import { dedent } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'

class SquidGame {
  static parse(input: string) {
    const [numberLine, , ...boardLines] = dedent(input).split('\n')

    const numbers = numberLine.split(',').map(toInt)
    const boards: Board[] = []
    const lineBuffer: string[] = []
    for (let line of boardLines) {
      line = line.trim()
      if (line === '') {
        boards.push(Board.parse(lineBuffer))
        lineBuffer.length = 0
      } else {
        lineBuffer.push(line)
      }
    }

    if (lineBuffer.length) {
      boards.push(Board.parse(lineBuffer))
    }

    return new SquidGame(numbers, boards)
  }

  private readonly numbers: number[]
  private readonly boards: Board[]
  constructor(numbers: number[], boards: Board[]) {
    this.numbers = numbers
    this.boards = boards
  }

  play() {
    for (const number of this.numbers) {
      for (const board of this.boards) {
        if (board.mark(number)) {
          if (board.hasWon()) {
            this.printWinner(board, number)
            return
          }
        }
      }
    }

    console.dir(this, { depth: 100, colors: true })
    throw new Error('no winner to the squid game')
  }

  private printWinner(board: Board, number: number) {
    const sumOfUnmarked = board.getSumOfUnmarked()

    console.log('number:', number)
    console.log('sum of unmarked:', sumOfUnmarked)
    console.log('winner score:', sumOfUnmarked * number)
  }

  playForLongest(): void {
    for (const [i, number] of this.numbers.entries()) {
      for (const board of this.boards) {
        if (board.mark(number)) {
          if (board.hasWon()) {
            if (this.boards.length > 1) {
              return new SquidGame(
                this.numbers.slice(i),
                this.boards.filter((b) => b !== board),
              ).playForLongest()
            }

            this.printWinner(board, number)
            return
          }
        }
      }
    }
  }
}

class Board {
  static parse(lines: string[]) {
    return new Board(lines.map((l) => l.split(/ +/).map(toInt)))
  }

  private readonly width: number
  private readonly height: number
  private readonly marks: boolean[][]
  private readonly map: number[][]

  constructor(input: number[][]) {
    this.map = input.slice()
    this.marks = new Array(input.length)
    this.height = this.map.length
    this.width = this.map[0].length

    for (let y = 0; y < this.height; y++) {
      this.marks[y] = new Array(this.width)
    }
  }

  mark(number: number) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.getValue(x, y) === number) {
          if (this.isMarked(x, y)) {
            break
          }

          this.marks[y][x] = true
          return true
        }
      }
    }

    return false
  }

  hasWon() {
    // check for top edge marks
    for (let x = 0; x < this.width; x++) {
      if (this.colMarked(x)) {
        return true
      }
    }

    // check the left edges
    for (let y = 0; y < this.height; y++) {
      if (this.rowMarked(y)) {
        return true
      }
    }
  }

  colMarked(x: number) {
    for (let y = 0; y < this.height; y++) {
      if (!this.isMarked(x, y)) {
        return false
      }
    }
    return true
  }

  rowMarked(y: number) {
    for (let x = 0; x < this.width; x++) {
      if (!this.isMarked(x, y)) {
        return false
      }
    }
    return true
  }

  getValue(x: number, y: number) {
    return this.map[y][x]
  }

  isMarked(x: number, y: number) {
    return !!this.marks[y][x]
  }

  getSumOfUnmarked() {
    let sum = 0
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        sum += this.isMarked(x, y) ? 0 : this.getValue(x, y)
      }
    }
    return sum
  }
}

export function test() {
  const input = dedent`
    7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

    22 13 17 11  0
    8  2 23  4 24
    21  9 14 16  7
    6 10  3 18  5
    1 12 20 15 19
    
    3 15  0  2 22
    9 18 13 17  5
    19  8  7 25 23
    20 11 10 24  4
    14 21 16 12  6
    
    14 21 17 24  4
    10 16 15  9 19
    18  8 23 26 20
    22 11 13  6  5
    2  0 12  3  7
  `

  SquidGame.parse(input).play()
  console.log('---')
  SquidGame.parse(input).playForLongest()
}

export function part1(input: string) {
  SquidGame.parse(input).play()
}

export function part2(input: string) {
  SquidGame.parse(input).playForLongest()
}
