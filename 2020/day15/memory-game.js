const Assert = require('assert')

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

function check(startingNumbers, expect) {
  Assert.strictEqual(
    playGame(startingNumbers, 2020),
    expect,
    `${startingNumbers} should finish round 2020 with ${expect}`,
  )
}

check([1, 3, 2], 1)
check([2, 1, 3], 10)
check([1, 2, 3], 27)
check([2, 3, 1], 78)
check([3, 2, 1], 438)
check([3, 1, 2], 1836)

console.log(
  'the answer to part one is',
  playGame([0, 1, 5, 10, 3, 12, 19], 2020),
)

console.log(
  'the answer to part two is',
  playGame([0, 1, 5, 10, 3, 12, 19], 30000000),
)
