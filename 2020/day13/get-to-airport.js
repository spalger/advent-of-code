const Fs = require('fs')
const input = Fs.readFileSync('input.txt', 'utf-8').split('\n')
const departureTime = parseInt(input[0], 10)
const schedule = input[1]
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
