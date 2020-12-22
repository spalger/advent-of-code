import * as Assert from 'assert'

const parse = (input: string) => input.split(',').map((n) => parseInt(n, 10))

function runIntcode(prog: number[]) {
  for (let pos = 0; prog[pos] !== 99; pos += 4) {
    const op = prog[pos]
    const ai = prog[pos + 1]
    const bi = prog[pos + 2]
    const oi = prog[pos + 3]

    switch (op) {
      case 1:
        prog[oi] = prog[ai] + prog[bi]
        break
      case 2:
        prog[oi] = prog[ai] * prog[bi]
        break
      default:
        throw new Error(`${op} program alarm`)
    }
  }

  return prog[0]
}

export function test() {
  Assert.strictEqual(runIntcode(parse(`1,9,10,3,2,3,11,0,99,30,40,50`)), 3500)
}

export function part1(input: string) {
  const prog = parse(input)
  prog[1] = 12
  prog[2] = 2
  console.log(
    'value at position 0 in the modified program is',
    runIntcode(prog),
  )
}

function findAltNounAndVerb(
  sourceProg: number[],
  maxNoun: number,
  maxVerb: number,
  targetOutput: number,
) {
  for (let noun = 0; noun <= maxNoun; noun++) {
    for (let verb = 0; verb <= maxVerb; verb++) {
      const modProg = sourceProg.slice()
      modProg[1] = noun
      modProg[2] = verb
      const result = runIntcode(modProg)
      if (result === targetOutput) {
        return [noun, verb]
      }
    }
  }

  throw new Error(
    `unable to find alternate noun and verb that cause program to output ${targetOutput}`,
  )
}

export function part2(input: string) {
  const [noun, verb] = findAltNounAndVerb(parse(input), 99, 99, 19690720)

  console.log(
    'by changing the noun to',
    noun,
    'and the verb to',
    verb,
    'the program outputs',
    19690720,
  )

  console.log('100 * noun + verb is', 100 * noun + verb)
}
