import { repeat } from '../../common/array.ts'
/**
 * a few key facts about the password:
 *
 *  - It is a six-digit number.
 *  - The value is within the range given in your puzzle input.
 *  - Two adjacent digits are the same (like 22 in 122345).
 *  - Going from left to right, the digits never decrease; they only ever increase or stay the same (like 111123 or 135679).
 *
 * the following are true:
 *
 *  - 111111 meets these criteria (double 11, never decreases).
 *  - 223450 does not meet these criteria (decreasing pair of digits 50).
 *  - 123789 does not meet these criteria (no double).
 *
 */

class PwState {
  readonly pw: number[]
  readonly max: ReadonlyArray<number>

  constructor(min: string, max: string) {
    // initialize password as the first number repeating
    this.pw = repeat(min.length, () => parseInt(min[0], 10))
    this.max = max.split('').map((c) => parseInt(c, 10))
  }

  incr() {
    // search from the right of the pw for a number that is not 9, then increment
    // it and set all the number to the right it to match since all number to the
    // right of a number must be greater than or equal to it
    for (let i = 5; i >= 0; i--) {
      if (this.pw[i] === 9) {
        continue
      }

      const n = this.pw[i] + 1
      for (let fi = i; fi < 6; fi++) {
        this.pw[fi] = n
      }
      break
    }

    // return true if the current password is less than the max password
    for (let i = 0; i < 6; i++) {
      if (this.pw[i] < this.max[i]) {
        return true
      }
      if (i === 5 && this.pw[i] === this.max[i]) {
        return true
      }
    }

    // we are beyond the max, stop iterating
    return false
  }

  isValid(exactPairsOnly = false) {
    let hasPair = false
    let pairNum = this.pw[0]
    let pairWidth = 1

    for (let i = 1; i < 6; i++) {
      if (!hasPair) {
        if (!exactPairsOnly) {
          // attempt to find adjacent numbers
          if (this.pw[i] === this.pw[i - 1]) {
            hasPair = true
          }
        } else {
          if (this.pw[i] === pairNum) {
            pairWidth++
          } else {
            if (pairWidth === 2) {
              hasPair = true
            } else {
              // start over with this character
              pairNum = this.pw[i]
              pairWidth = 1
            }
          }
        }
      }

      // if any number is less than the previous number the password is not valid
      if (this.pw[i] < this.pw[i - 1]) {
        return false
      }
    }

    return hasPair || pairWidth === 2
  }
}

export function part1() {
  const state = new PwState(`109165`, `576723`)
  let validPasswords = 0
  do {
    if (state.isValid()) {
      validPasswords += 1
    }
  } while (state.incr())

  console.log('the total number of valid passwords is', validPasswords)
}

export function part2() {
  const state = new PwState(`109165`, `576723`)
  let validPasswords = 0
  do {
    if (state.isValid(true)) {
      validPasswords += 1
    }
  } while (state.incr())

  console.log('the total number of valid passwords is', validPasswords)
}
