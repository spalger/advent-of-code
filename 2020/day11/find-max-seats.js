const Fs = require('fs')

class Seatmap {
  /**
   * @param {Array<Array<null|false|true>>} rows
   */
  constructor(rows) {
    this.changed = false
    this.rows = rows
    this.rowWidth = rows[0].length
  }

  *iterSeat() {
    for (const [rowI, row] of this.rows.entries()) {
      for (const [seatI, occupied] of row.entries()) {
        if (typeof occupied === 'boolean') {
          yield { rowI, seatI, occupied }
        }
      }
    }
  }

  isOccupied(rowI, seatI) {
    return this.rows[rowI]?.[seatI] === true
  }

  getOccupiedNeighborCount(rowI, seatI) {
    let count = 0
    if (this.isOccupied(rowI - 1, seatI - 1)) count++
    if (this.isOccupied(rowI - 1, seatI)) count++
    if (this.isOccupied(rowI - 1, seatI + 1)) count++
    if (this.isOccupied(rowI, seatI - 1)) count++
    if (this.isOccupied(rowI, seatI + 1)) count++
    if (this.isOccupied(rowI + 1, seatI - 1)) count++
    if (this.isOccupied(rowI + 1, seatI)) count++
    if (this.isOccupied(rowI + 1, seatI + 1)) count++
    return count
  }

  toggle(rowI, seatI) {
    this.changed = true
    const current = this.rows[rowI]?.[seatI]
    if (typeof current === 'boolean') {
      this.rows[rowI][seatI] = !current
    } else {
      throw new RangeError(
        `row:${rowI} seat:${seatI} is not a valid seat position`,
      )
    }
  }

  clone() {
    return new Seatmap(this.rows.map((row) => row.slice()))
  }

  getOccupiedSeatCount() {
    let count = 0
    for (const { occupied } of this.iterSeat()) {
      if (occupied) {
        count++
      }
    }
    return count
  }
}

const emptySeatmap = new Seatmap(
  Fs.readFileSync('input.txt', 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => l.split('').map((c) => (c === 'L' ? false : null))),
)

for (let count = 1, seatmap = emptySeatmap; ; count++) {
  const newSeatmap = seatmap.clone()

  for (const { rowI, seatI, occupied } of seatmap.iterSeat()) {
    if (!occupied && seatmap.getOccupiedNeighborCount(rowI, seatI) === 0) {
      newSeatmap.toggle(rowI, seatI)
    }
    if (occupied && seatmap.getOccupiedNeighborCount(rowI, seatI) >= 4) {
      newSeatmap.toggle(rowI, seatI)
    }
  }

  if (newSeatmap.changed) {
    seatmap = newSeatmap
    continue
  }

  console.log(
    'seatmap stabilized after',
    count,
    'iterations with',
    newSeatmap.getOccupiedSeatCount(),
    'occupied seats',
  )
  break
}
