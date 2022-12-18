import { deepStrictEqual } from 'assert'
import { toLines } from '../../common/string'
import { shift } from '../../common/array'

type Packet = Array<number | Packet>
type Pairs = [Packet, Packet][]

function parse(input: string) {
  const pairs: Pairs = []
  const lines = toLines(input)
  while (lines.length) {
    const a = shift(lines)
    const b = shift(lines)
    pairs.push([JSON.parse(a), JSON.parse(b)])
  }
  return pairs
}

enum Result {
  VALID,
  INVALID,
  CONT,
}

function compare(left: number | Packet, right: number | Packet): Result {
  if (typeof left === 'number' && typeof right === 'number') {
    return left === right
      ? Result.CONT
      : left < right
      ? Result.VALID
      : Result.INVALID
  }

  if (!Array.isArray(left)) {
    return compare([left], right)
  }

  if (!Array.isArray(right)) {
    return compare(left, [right])
  }

  const sameLen = left.length === right.length ? left.length : undefined

  for (let i = 0; ; i++) {
    if (i === sameLen) {
      return Result.CONT
    }

    const l = left[i]
    const r = right[i]
    if (l === undefined) {
      return Result.VALID
    }

    if (r === undefined) {
      return Result.INVALID
    }

    const sub = compare(l, r)
    if (sub !== Result.CONT) {
      return sub
    }
  }
}

function validate(pairs: Pairs) {
  return pairs.reduce(
    (acc, [left, right], i) =>
      acc + (compare(left, right) === Result.VALID ? i + 1 : 0),
    0,
  )
}

function match(a: Packet, b: Packet): boolean {
  return (
    a.length === b.length &&
    a.every((xa, i) => {
      const xb = b[i]
      return Array.isArray(xa) && Array.isArray(xb) ? match(xa, xb) : xa === xb
    })
  )
}

export function findDecoderKey(input: Packet[]) {
  const div1 = [[2]]
  const div2 = [[6]]
  const sorted = [...input, div1, div2].sort((a, b) => {
    switch (compare(a, b)) {
      case Result.VALID:
        return -1
      case Result.CONT:
        return 0
      case Result.INVALID:
        return 1
    }
  })

  return (
    (sorted.findIndex((p) => match(p, div1)) + 1) *
    (sorted.findIndex((p) => match(p, div2)) + 1)
  )
}

export function test(input: string) {
  deepStrictEqual(validate(parse(input)), 13)
  deepStrictEqual(findDecoderKey(parse(input).flat()), 140)
}

export function part1(input: string) {
  console.log(
    'the sum of the indexes of the messages in valid order is',
    validate(parse(input)),
  )
}

export function part2(input: string) {
  console.log(
    'the decoder key for this message is',
    findDecoderKey(parse(input).flat()),
  )
}
