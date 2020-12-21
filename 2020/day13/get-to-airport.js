export function run(input) {
  const departureTime = parseInt(input.split('\n')[0], 10)
  const schedule = input
    .split('\n')[1]
    .split(',')
    .map((t) => parseInt(t, 10))
    .filter((n) => !Number.isNaN(n))

  const firstAvailableBus = schedule
    .map((id) => ({
      id,
      nextDep: departureTime % id === 0 ? 0 : id - (departureTime % id),
    }))
    .reduce((acc, bus) => (bus.nextDep < acc.nextDep ? bus : acc))

  console.log(
    'the first bus to depart after my desired departure time is',
    firstAvailableBus.id,
    'which departs',
    firstAvailableBus.nextDep,
    'minutes after',
    departureTime,
    '( answer =',
    firstAvailableBus.id * firstAvailableBus.nextDep,
    ')',
  )
}
