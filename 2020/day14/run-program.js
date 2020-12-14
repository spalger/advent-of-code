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

let mask
const memory = new Map()

const set = (addr, value) => {
  const queue = [addr]
  while (queue.length) {
    const a = queue.shift()
    if (a.includes('X')) {
      queue.push(a.replace('X', '1'), a.replace('X', '0'))
    } else {
      memory.set(a, value)
    }
  }
}

for (const line of input) {
  const [op, value] = line.split(' = ')
  if (op === 'mask') {
    mask = new Map()
    for (const [i, c] of value.split('').entries()) {
      if (c !== '0') {
        mask.set(i, c)
      }
    }
  } else {
    const [, addr] = op.split(/[[\]]/)
    set(toBin(parseInt(addr, 10), mask), parseInt(value, 10))
  }
}

console.log(
  'sum of values in memory after exection is',
  Array.from(memory.values()).reduce((acc, n) => acc + n),
)
