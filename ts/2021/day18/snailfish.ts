import { strictEqual } from 'assert'

import { dedent, toLines } from '../../common/string.ts'
import { toInt } from '../../common/number.ts'

type Num = Array<number | '[' | ']'>
type NumArray = Array<number | NumArray>

function parseNum(input: string) {
  let partialNum = ''
  const number: Num = []
  for (const char of input) {
    switch (char) {
      case '[':
        number.push(char)
        break
      case ']':
      case ',':
        if (partialNum) {
          number.push(toInt(partialNum))
          partialNum = ''
        }
        if (char === ']') {
          number.push(char)
        }
        break
      default:
        if (!/^\d$/.test(char)) {
          throw new Error(`unexpected char ${char}`)
        }
        partialNum += char
        break
    }
  }
  return number
}

function parse(input: string) {
  const numbers: Num[] = []

  for (const line of toLines(input)) {
    numbers.push(parseNum(line))
  }

  return numbers
}

function toArray(num: Num): NumArray {
  if (num[0] !== '[' || num[num.length - 1] !== ']') {
    throw new Error('invalid num, must start with [ and end with with ]')
  }
  const stack: NumArray[] = [[]]
  for (const dig of num.slice(1, -1)) {
    switch (dig) {
      case '[': {
        const inner: NumArray = []
        stack[0].push(inner)
        stack.unshift(inner)
        break
      }
      case ']':
        stack.shift()
        break
      default:
        stack[0].push(dig)
        break
    }
  }
  return stack[0]
}

function toString(num: Num) {
  return JSON.stringify(toArray(num))
}

function getRealNumber(num: Num, i: number) {
  const value = num[i]
  if (typeof value !== 'number') {
    throw new Error(
      `expected to find a real number at pos ${i} of ${toString(num)}`,
    )
  }
  return value
}

function findExplode(num: Num) {
  let depth = 0
  for (const [i, char] of num.entries()) {
    switch (char) {
      case '[':
        if (depth >= 4) {
          return i
        }
        depth += 1
        break
      case ']':
        depth -= 1
        break
    }
  }
}

function addToRealNumberLeft(n: Num, leftOfI: number, x: number) {
  for (let i = leftOfI - 1; i >= 0; i--) {
    if (typeof n[i] === 'number') {
      n[i] = getRealNumber(n, i) + x
      return
    }
  }
}

function addToRealNumberRight(n: Num, rightOfI: number, x: number) {
  for (let i = rightOfI + 1; i < n.length; i++) {
    if (typeof n[i] === 'number') {
      n[i] = getRealNumber(n, i) + x
      return
    }
  }
}

function findSplit(num: Num) {
  for (const [i, dig] of num.entries()) {
    if (typeof dig === 'number' && dig >= 10) {
      return i
    }
  }
}

function reduce(num: Num): Num {
  // we're going to mutate num, so copy it
  num = num.slice()

  while (true) {
    // If any pair is nested inside four pairs, the leftmost such pair explodes.
    const explodeI = findExplode(num)
    if (explodeI !== undefined) {
      // console.log('exploding', toString(num))
      const left = getRealNumber(num, explodeI + 1)
      const right = getRealNumber(num, explodeI + 2)

      addToRealNumberLeft(num, explodeI, left)
      addToRealNumberRight(num, explodeI + 3, right)

      // replace four elements, starting at explodeI, with the real number 0
      num.splice(explodeI, 4, 0)
      // start over
      continue
    }

    // If any regular number is 10 or greater, the leftmost such regular number splits.
    const splitI = findSplit(num)
    if (splitI !== undefined) {
      // console.log('splitting', toString(num))
      const n = getRealNumber(num, splitI)
      num.splice(splitI, 1, '[', Math.floor(n / 2), Math.ceil(n / 2), ']')
      continue
    }

    // no operations performed, stop the loop
    break
  }

  return num
}

function add(nums: Num[]) {
  return nums.reduce((acc, num) => {
    return reduce(['[', ...acc, ...num, ']'])
  })
}

function getMagnitudeOfArray(num: NumArray): number {
  const left = typeof num[0] === 'number' ? num[0] : getMagnitudeOfArray(num[0])
  const right =
    typeof num[1] === 'number' ? num[1] : getMagnitudeOfArray(num[1])
  return 3 * left + 2 * right
}

function getMagnitude(num: Num): number {
  const magnitude = getMagnitudeOfArray(toArray(num))
  console.log('magnitude of', toString(num), 'is', magnitude)
  return magnitude
}

function findLargestMagnitude(nums: Num[]) {
  let largest: undefined | { left: Num; right: Num; mag: number }
  let attempts = 0
  for (const a of nums) {
    for (const b of nums) {
      if (a === b) {
        continue
      }

      attempts += 1
      const magnitude = getMagnitudeOfArray(toArray(add([a, b])))
      if (!largest || magnitude > largest.mag) {
        largest = {
          left: a,
          right: b,
          mag: magnitude,
        }
      }
    }
  }

  if (!largest) {
    throw new Error('no largest was found')
  }

  console.log(
    'after',
    attempts,
    'attempts the largest magnitude is',
    largest.mag,
  )
  console.log('added:', toString(largest.left), 'and', toString(largest.right))
  return largest.mag
}

function testReduce(input: string) {
  const reduced = toString(reduce(parseNum(input)))
  console.log('reduced', reduced)
  return reduced
}

export function test() {
  strictEqual(testReduce(`[[[[[9,8],1],2],3],4]`), `[[[[0,9],2],3],4]`)
  strictEqual(testReduce(`[7,[6,[5,[4,[3,2]]]]]`), `[7,[6,[5,[7,0]]]]`)
  strictEqual(testReduce(`[[6,[5,[4,[3,2]]]],1]`), `[[6,[5,[7,0]]],3]`)
  strictEqual(
    testReduce(`[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]`),
    `[[3,[2,[8,0]]],[9,[5,[7,0]]]]`,
  )
  strictEqual(
    testReduce(`[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]`),
    `[[[[0,7],4],[[7,8],[6,0]]],[8,1]]`,
  )
  strictEqual(
    toString(
      add(
        parse(dedent`
          [[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
          [7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
          [[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
          [[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
          [7,[5,[[3,8],[1,4]]]]
          [[2,[2,2]],[8,[8,1]]]
          [2,9]
          [1,[[[9,3],9],[[9,0],[0,7]]]]
          [[[5,[7,4]],7],1]
          [[[[4,2],2],6],[8,7]]
        `),
      ),
    ),
    `[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]`,
  )
  strictEqual(
    findLargestMagnitude(
      parse(dedent`
        [[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
        [[[5,[2,8]],4],[5,[[9,9],0]]]
        [6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
        [[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
        [[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
        [[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
        [[[[5,4],[7,7]],8],[[8,3],8]]
        [[9,3],[[9,9],[6,[4,9]]]]
        [[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
        [[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]
      `),
    ),
    3993,
  )
}

export function part1(input: string) {
  const sum = add(parse(input))
  console.log('the reduced sum of all input numbers is', toString(sum))
  strictEqual(getMagnitude(sum), 4008)
}

export function part2(input: string) {
  strictEqual(findLargestMagnitude(parse(input)), 4667)
}
