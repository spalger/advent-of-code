import Assert from 'assert'

function playGame(startingNumbers, rounds) {
  const history = new Map()
  let lastNum = undefined
  let round = 0

  const sayNum = (num) => {
    const lastTwoRounds = history.get(num)
    history.set(num, lastTwoRounds ? [round, lastTwoRounds[0]] : [round])
    lastNum = num
  }

  for (; round < rounds; round++) {
    if (round < startingNumbers.length) {
      sayNum(startingNumbers[round])
    } else {
      const lastTwoRounds = history.get(lastNum)
      if (lastTwoRounds.length === 1) {
        sayNum(0)
      } else {
        sayNum(lastTwoRounds[0] - lastTwoRounds[1])
      }
    }
  }

  return lastNum
}

export function test() {
  const tests = [
    {
      startingNumbers: [1, 3, 2],
      rounds: 2020,
      expect: 1,
    },
    {
      startingNumbers: [2, 1, 3],
      rounds: 2020,
      expect: 10,
    },
    {
      startingNumbers: [1, 2, 3],
      rounds: 2020,
      expect: 27,
    },
    {
      startingNumbers: [2, 3, 1],
      rounds: 2020,
      expect: 78,
    },
    {
      startingNumbers: [3, 2, 1],
      rounds: 2020,
      expect: 438,
    },
    {
      startingNumbers: [3, 1, 2],
      rounds: 2020,
      expect: 1836,
    },
  ]

  for (const { startingNumbers, rounds, expect } of tests) {
    Assert.strictEqual(
      playGame(startingNumbers, rounds),
      expect,
      `${startingNumbers} should finish round ${rounds} with ${expect}`,
    )
  }
}

export function part1() {
  console.log('the answer is', playGame([0, 1, 5, 10, 3, 12, 19], 2020))
}

export function part2() {
  console.log('the answer is', playGame([0, 1, 5, 10, 3, 12, 19], 30000000))
}
