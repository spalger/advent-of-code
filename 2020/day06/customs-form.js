class Ballot {
  groupSize = 0
  yes = new Map()

  countOfAllYes() {
    let count = 0
    for (const yesCount of this.yes.values()) {
      if (yesCount === this.groupSize) {
        count += 1
      }
    }
    return count
  }
}

export function run(input) {
  const ballots = input.split('\n').reduce(
    (acc, l) => {
      if (!l.trim()) {
        return [new Ballot(), ...acc]
      }

      const ballotInProgress = acc[0]
      ballotInProgress.groupSize += 1
      for (const answer of l) {
        ballotInProgress.yes.set(
          answer,
          (ballotInProgress.yes.get(answer) ?? 0) + 1,
        )
      }
      return acc
    },
    [new Ballot()],
  )

  const sum = ballots.reduce((acc, b) => acc + b.countOfAllYes(), 0)

  console.log('the sum of all yes "yes" is', sum)
}
