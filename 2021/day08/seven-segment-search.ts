import { strictEqual } from 'assert'
import { toLines, dedent } from '../../common/string'
import { toInt } from '../../common/number'

const readingCache = new Map<string, Reading>()
class Reading {
  static fromSegments(segmentsString: string) {
    const segments = segmentsString.split('').sort((a, b) => a.localeCompare(b))

    const key = segments.join('')
    const cached = readingCache.get(key)
    if (cached) {
      return cached
    }

    const reading = new Reading(segments)
    readingCache.set(key, reading)
    return reading
  }

  public readonly length: number
  constructor(public readonly segments: string[]) {
    this.length = this.segments.length
  }

  union(other: Reading) {
    const matches = []
    const shorty = this.length < other.length ? this : other

    for (const char of shorty.segments) {
      if (this.segments.includes(char) && other.segments.includes(char)) {
        matches.push(char)
      }
    }

    return matches
  }

  includes(other: Reading) {
    return this.union(other).length === other.length
  }
}

class Digit {
  public readonly length: number
  public readonly reading: Reading
  constructor(public readonly name: number, public readonly segments: string) {
    this.length = this.segments.length
    this.reading = Reading.fromSegments(this.segments)
  }
  isUnique() {
    return DIGITS.filter((d) => d.length === this.length).length === 1
  }
}

// fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg

const DIGITS = [
  new Digit(0, 'abcefg'), //
  new Digit(1, 'cf'), //
  new Digit(2, 'acdeg'), //
  new Digit(3, 'acdfg'),
  new Digit(4, 'bcdf'), //
  new Digit(5, 'abdfg'),
  new Digit(6, 'abdefg'), //
  new Digit(7, 'acf'), //
  new Digit(8, 'abcdefg'), //
  new Digit(9, 'abcdfg'), //
]

const UNIQ_LENGTH_DIGITS = DIGITS.filter((d) => d.isUnique())

function parse(input: string) {
  const [samplesStr, finalStr] = input.split(' | ')
  const samples = samplesStr.split(' ').map(Reading.fromSegments)
  const finals = finalStr.split(' ').map(Reading.fromSegments)
  return { samples, finals }
}

function findUniqueLengthNumberCount(input: string) {
  const LENGTHS = UNIQ_LENGTH_DIGITS.map((d) => d.length)

  let uniqLengthNumberCount = 0
  for (const line of toLines(input)) {
    const { finals } = parse(line)
    for (const final of finals) {
      if (LENGTHS.includes(final.length)) {
        uniqLengthNumberCount += 1
      }
    }
  }

  console.log(uniqLengthNumberCount, `uniq final readings`)
  return uniqLengthNumberCount
}

function discoverFinalNumber(samples: Reading[], finals: Reading[]) {
  const unresolvedReadings = new Set([...samples, ...finals])

  // remove an unresolved reading by testing all remaining unresolved readings with a function
  // then on the first match remove that reading from the unresolved set and return it. If no
  // readings match then an error is thrown
  const resolve = (test: (r: Reading) => boolean) => {
    for (const r of unresolvedReadings) {
      if (test(r)) {
        unresolvedReadings.delete(r)
        return r
      }
    }

    throw new Error(
      `unable to resolve to a reading with test: ${test.toString()}`,
    )
  }

  /**************
   * resolve readings for digits which have a unique length
   **************/
  const one = resolve((r) => r.length === 2)
  const four = resolve((r) => r.length === 4)
  const seven = resolve((r) => r.length === 3)
  const eight = resolve((r) => r.length === 7)

  /**************
   * resolve digits with length of 6 (0, 6, 9)
   *************/

  // readings for 9 have a length of 6 and include the entire reading of 4
  const nine = resolve((r) => r.length === 6 && r.includes(four))

  // 0 and 9 have both segments from 1, but 6 only has one of the two segments, so
  // find a reading with length 6 which has one both not the other segment
  const six = resolve((r) => r.length === 6 && r.union(one).length === 1)

  // zero is the only other reading with length 6
  const zero = resolve((r) => r.length === 6)

  /*************
   * all that is left is digits with length of 5
   *************/
  // two is the only reading which isn't totally included in the reading of 9
  const two = resolve((r) => !nine.includes(r))

  // the reading for three is one off 2
  const three = resolve((r) => r.union(two).length === 4)

  // 5 is the only digit left
  const five = resolve(() => true)

  if (unresolvedReadings.size) {
    throw new Error(
      `all numbers resolved but there are still unresolved readings: ${[
        ...unresolvedReadings,
      ]
        .map((r) => r.segments.join(''))
        .join(', ')}`,
    )
  }

  const readingToString = new Map<Reading, string>([
    [zero, '0'],
    [one, '1'],
    [two, '2'],
    [three, '3'],
    [four, '4'],
    [five, '5'],
    [six, '6'],
    [seven, '7'],
    [eight, '8'],
    [nine, '9'],
  ])

  return toInt(finals.map((r) => readingToString.get(r)).join(''))
}

function sumFinalReadings(input: string) {
  const sum = toLines(input)
    .map(parse)
    .reduce(
      (acc, { samples, finals }) => acc + discoverFinalNumber(samples, finals),
      0,
    )

  console.log('sum of final readings', sum)
  return sum
}

export function test() {
  const input = dedent`
    be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
    edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
    fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
    fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
    aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
    fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
    dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
    bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
    egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
    gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
  `

  strictEqual(findUniqueLengthNumberCount(input), 26)

  strictEqual(sumFinalReadings(input), 61229)
}

export function part1(input: string) {
  strictEqual(findUniqueLengthNumberCount(input), 349)
}

export function part2(input: string) {
  strictEqual(sumFinalReadings(input), 1070957)
}
