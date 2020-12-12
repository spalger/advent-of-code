const Fs = require('fs')

const directions = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    const [dir, ...amount] = l.split('')
    return { dir, amount: parseInt(amount.join(''), 10) }
  })

let x = 0
let y = 0
// start heading east
let heading = 90

for (const { dir, amount } of directions) {
  if (dir === 'N' || (dir === 'F' && heading === 0)) {
    y += amount
    continue
  }
  if (dir === 'S' || (dir === 'F' && heading === 180)) {
    y -= amount
    continue
  }
  if (dir === 'E' || (dir === 'F' && heading === 90)) {
    x -= amount
    continue
  }
  if (dir === 'W' || (dir === 'F' && heading === 270)) {
    x += amount
    continue
  }
  if (dir === 'L') {
    heading = (heading + (360 - (amount % 360))) % 360
    continue
  }
  if (dir === 'R') {
    heading = Math.abs(heading + amount) % 360
    continue
  }

  throw new Error(`unexpected direction ${dir}`)
}

console.log(`final position is (${x},${y}) heading ${heading} degrees`)
console.log('manhattan distance traveled is', Math.abs(x) + Math.abs(y))
