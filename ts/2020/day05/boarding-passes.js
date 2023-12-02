class Options {
  constructor(length) {
    this.options = ' '
      .repeat(length)
      .split('')
      .map((_, i) => i)
  }

  left() {
    this.options = this.options.slice(0, this.options.length / 2)
  }

  right() {
    this.options = this.options.slice(this.options.length / 2)
  }

  final() {
    if (this.options.length !== 1) {
      throw new Error(
        `failed to parse, remaining options: ${this.options.join(', ')}`,
      )
    }
    return this.options[0]
  }
}

const getId = (row, col) => row * 8 + col

export function run(input) {
  const boardingPasses = input
    .split('\n')
    .filter((l) => l.trim())
    .map((code) => {
      const rows = new Options(128)
      for (const char of code.slice(0, 7)) {
        if (char === 'F') {
          rows.left()
        } else {
          rows.right()
        }
      }

      const cols = new Options(8)
      for (const char of code.slice(7)) {
        if (char === 'L') {
          cols.left()
        } else {
          cols.right()
        }
      }

      const row = rows.final()
      const col = cols.final()
      const id = getId(row, col)
      return { id, row, col }
    })

  const passesById = new Map(boardingPasses.map((b) => [b.id, b]))

  rowLoop: for (let row = 1; row < 127; row++) {
    for (let col = 0; col < 8; col++) {
      const id = getId(row, col)
      if (
        !passesById.has(id) &&
        passesById.has(id + 1) &&
        passesById.has(id - 1)
      ) {
        console.log('my seat id is', id)
        break rowLoop
      }
    }
  }
}
