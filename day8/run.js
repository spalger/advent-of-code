const Fs = require('fs')

class Instruction {
  constructor(type, arg) {
    this.type = type
    this.arg = arg
  }
}

const instructions = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    const [type, arg] = l.split(' ')
    return new Instruction(
      type,
      arg.startsWith('+') ? parseInt(arg.slice(1)) : parseInt(arg),
    )
  })

const seen = new Set()
let acc = 0
let i = 0

while (true) {
  const inst = instructions[i]

  if (seen.has(inst)) {
    console.log('acc when first instruction was re-executed was', acc)
    break
  } else {
    seen.add(inst)
  }

  switch (inst.type) {
    case 'acc':
      acc += inst.arg
      i++
      break
    case 'nop':
      i++
      break
    case 'jmp':
      i += inst.arg
      break
  }
}
