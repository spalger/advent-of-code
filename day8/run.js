const Fs = require('fs')
class Instruction {
  constructor(type, arg) {
    this.type = type
    this.arg = arg
  }
}

function run(instructions) {
  const seen = new Set()
  let acc = 0
  let i = 0

  while (i < instructions.length) {
    const inst = instructions[i]

    if (seen.has(inst)) {
      return {
        loop: true,
        acc,
      }
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

  return {
    loop: false,
    acc,
  }
}

/** @type {Instruction[]} */
const corruptInstructions = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    const [type, arg] = l.split(' ')
    return new Instruction(
      type,
      arg.startsWith('+') ? parseInt(arg.slice(1)) : parseInt(arg),
    )
  })

const possibleCorruptions = corruptInstructions
  .map((inst, i) =>
    inst.type === 'jmp' || inst.type === 'nop' ? i : undefined,
  )
  .filter((i) => i !== undefined)

for (const possibleCorruptionI of possibleCorruptions) {
  const inst = corruptInstructions[possibleCorruptionI]
  const result = run([
    ...corruptInstructions.slice(0, possibleCorruptionI),
    new Instruction(inst.type === 'jmp' ? 'nop' : 'jmp', inst.arg),
    ...corruptInstructions.slice(possibleCorruptionI + 1),
  ])

  if (!result.loop) {
    console.log(
      'replacing',
      inst,
      'at',
      possibleCorruptionI,
      'allowed the program to run and exit with acc',
      result.acc,
    )
    break
  }
}
