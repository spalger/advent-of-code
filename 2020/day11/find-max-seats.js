class Seatmap {
  /**
   * @param {Array<Array<null|false|true>>} rows
   */
  constructor(rows) {
    this.changed = false
    this.rows = rows
  }

  *iterSeats() {
    for (const [row, seats] of this.rows.entries()) {
      for (const [i, occupied] of seats.entries()) {
        if (typeof occupied === 'boolean') {
          yield { row, i, occupied }
        }
      }
    }
  }

  isOutOfBounds(row, i) {
    return (
      row < 0 || i < 0 || row >= this.rows.length || i >= this.rows[0].length
    )
  }

  getOccupiedVisibility(seat, deltaRow, deltaSeat) {
    for (
      let vRow = seat.row + deltaRow, vSeat = seat.i + deltaSeat;
      !this.isOutOfBounds(vRow, vSeat);
      vRow += deltaRow, vSeat += deltaSeat
    ) {
      const seat = this.rows[vRow][vSeat]
      if (typeof seat === 'boolean') {
        return seat
      }
    }
    return false
  }

  countVisibleOccupied(seat) {
    let count = 0
    if (this.getOccupiedVisibility(seat, -1, -1)) count++
    if (this.getOccupiedVisibility(seat, -1, 0)) count++
    if (this.getOccupiedVisibility(seat, -1, 1)) count++
    if (this.getOccupiedVisibility(seat, 0, -1)) count++
    if (this.getOccupiedVisibility(seat, 0, 1)) count++
    if (this.getOccupiedVisibility(seat, 1, -1)) count++
    if (this.getOccupiedVisibility(seat, 1, 0)) count++
    if (this.getOccupiedVisibility(seat, 1, 1)) count++
    return count
  }

  toggle(seat) {
    this.changed = true
    this.rows[seat.row][seat.i] = !this.rows[seat.row][seat.i]
  }

  clone() {
    return new Seatmap(this.rows.map((row) => row.slice()))
  }

  countOccupiedSeats() {
    let count = 0
    for (const seat of this.iterSeats()) {
      if (seat.occupied) {
        count++
      }
    }
    return count
  }
}

export function run(input) {
  const emptySeatmap = new Seatmap(
    input
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => l.split('').map((c) => (c === 'L' ? false : null))),
  )

  for (let count = 1, seatmap = emptySeatmap; ; count++) {
    const newSeatmap = seatmap.clone()

    for (const seat of seatmap.iterSeats()) {
      if (!seat.occupied && seatmap.countVisibleOccupied(seat) === 0) {
        newSeatmap.toggle(seat)
      }
      if (seat.occupied && seatmap.countVisibleOccupied(seat) >= 5) {
        newSeatmap.toggle(seat)
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
      newSeatmap.countOccupiedSeats(),
      'occupied seats',
    )
    break
  }
}
