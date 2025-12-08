import { strictEqual } from 'assert'

import { memoize } from '../../common/fn.ts'
import { factors, isOdd } from '../../common/number.ts'
import { getSum } from '../../common/big_int.ts'

const memoizedFactors = memoize(factors)

function parse(input: string): [bigint, bigint][] {
  return input
    .trim()
    .split(',')
    .map((range) => {
      const [left, right] = range.trim().split('-')
      return [BigInt(left), BigInt(right)]
    })
}

function getIdsWithTwoRepeatingTermsBetween(
  left: bigint,
  right: bigint,
): bigint[] {
  let start = left
  let startStr = String(start)

  // increase the left bound until it has an even number of digits. If that exceeds the right bound, return
  if (isOdd(startStr.length)) {
    start = BigInt('1' + '0'.repeat(startStr.length))
    startStr = String(start)
    if (start > right) {
      return []
    }
  }

  const invalidIds: bigint[] = []
  for (let n = BigInt(startStr.slice(0, startStr.length / 2)); ; n++) {
    const id = BigInt(String(n) + String(n))

    if (id < start) {
      continue
    }

    if (id <= right) {
      invalidIds.push(id)
    } else {
      break
    }
  }

  return invalidIds
}

function sumIdsWithTwoRepeatingTerms(ranges: [bigint, bigint][]): bigint {
  return getSum(
    ranges.flatMap(([left, right]) =>
      getIdsWithTwoRepeatingTermsBetween(left, right),
    ),
  )
}

function getIdsWithArbitraryRepeatingTermsBetween(
  left: bigint,
  right: bigint,
): bigint[] {
  const invalidIds: bigint[] = []
  for (let n = left; n <= right; n++) {
    const ns = String(n)
    check: for (const factor of memoizedFactors(ns.length)) {
      if (factor === ns.length) {
        continue
      }

      const repeated = ns.slice(0, factor).repeat(ns.length / factor)
      if (ns === repeated) {
        invalidIds.push(n)
        break check
      }
    }
  }

  return invalidIds
}

function sumIdsWithArbitraryRepeatingTerms(ranges: [bigint, bigint][]): bigint {
  return getSum(
    ranges.flatMap(([left, right]) =>
      getIdsWithArbitraryRepeatingTermsBetween(left, right),
    ),
  )
}

export function test() {
  const ids = parse(
    '11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124',
  )

  strictEqual(sumIdsWithTwoRepeatingTerms(ids), 1227775554n)
  strictEqual(sumIdsWithArbitraryRepeatingTerms(ids), 4174379265n)
}

export function part1(input: string) {
  console.log(
    'the sum of invalid product IDs is',
    sumIdsWithTwoRepeatingTerms(parse(input)).toString(),
  )
}

export function part2(input: string) {
  console.log(
    'the sum of invalid product IDs is',
    sumIdsWithArbitraryRepeatingTerms(parse(input)).toString(),
  )
}
