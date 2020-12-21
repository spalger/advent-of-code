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

export function run(inputs) {
  for (const { startingNumbers, rounds, expect } of inputs) {
    const lastNum = playGame(startingNumbers, rounds)

    if (expect === undefined) {
      console.log('the answer is', lastNum)
    } else {
      Assert.strictEqual(
        lastNum,
        expect,
        `${startingNumbers} should finish round ${rounds} with ${expect}`,
      )
    }
  }
}
