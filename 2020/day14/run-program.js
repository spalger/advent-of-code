const Fs = require('fs')
const input = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())

const binWidth = 35

const toBin = (dec, mask) => {
  let bin = ''
  let q = dec

  for (let i = binWidth; i >= 0; i--) {
    bin = `${mask?.get(i) ?? (q > 0 ? q % 2 : '0')}${bin}`
    if (q > 0) {
      q = Math.floor(q / 2)
    }
  }

  return bin
}

const fromBin = (bin) => {
  return bin.split('').reduce((acc, c, i) => {
    if (c === '0') {
      return acc
    }

    return acc + Math.pow(2, binWidth - i)
  }, 0)
}

let mask
const memory = new Map()

for (const line of input) {
  const [op, value] = line.split(' = ')
  if (op === 'mask') {
    mask = new Map()
    for (const [i, c] of value.split('').entries()) {
      if (c !== 'X') {
        mask.set(i, c)
      }
    }
  } else {
    const [, addr] = op.split(/[[\]]/)
    memory.set(addr, toBin(parseInt(value, 10), mask))
  }
}

console.log(
  'sum of values in memory after exection is',
  Array.from(memory.values())
    .map(fromBin)
    .reduce((acc, n) => acc + n),
)
