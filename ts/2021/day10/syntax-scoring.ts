import { deepStrictEqual, strictEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'

type OpenChar = '[' | '(' | '{' | '<'
type CloseChar = ']' | ')' | '}' | '>'
type Char = OpenChar | CloseChar

const corruptionScores = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
}

const autocompleteScores = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
}

function parseLine(
  line: string,
): { valid: false; char: CloseChar } | { valid: true; expect: CloseChar[] } {
  const expect: CloseChar[] = []
  for (const char of line.split('') as Char[]) {
    switch (char) {
      case '(':
        expect.unshift(')')
        break
      case '<':
        expect.unshift('>')
        break
      case '[':
        expect.unshift(']')
        break
      case '{':
        expect.unshift('}')
        break
      default:
        if (char === expect[0]) {
          expect.shift()
        } else {
          return {
            valid: false,
            char,
          }
        }
    }
  }

  return {
    valid: true,
    expect,
  }
}

function getMiddleScore(scores: number[]) {
  return [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)]
}

function score(input: string) {
  let corruptionScore = 0
  const lineAutocompleteScores: number[] = []

  for (const line of toLines(input)) {
    const result = parseLine(line)
    if (result.valid && result.expect.length) {
      const score = result.expect.reduce(
        (acc, c) => acc * 5 + autocompleteScores[c],
        0,
      )
      lineAutocompleteScores.push(score)
    }
    if (!result.valid) {
      corruptionScore += corruptionScores[result.char]
    }
  }

  console.log('corruption score:', corruptionScore)
  const autocompleteScore = getMiddleScore(lineAutocompleteScores)
  console.log('autocomplete score:', autocompleteScore)

  return { corruptionScore, autocompleteScore }
}

export function test() {
  const program = dedent`
    [({(<(())[]>[[{[]{<()<>>
    [(()[<>])]({[<{<<[]>>(
    {([(<{}[<>[]}>{[]{[(<()>
    (((({<>}<{<{<>}{[]{[]{}
    [[<[([]))<([[{}[[()]]]
    [{[{({}]{}}([{[{{{}}([]
    {<[[]]>}<{[{[{[]{()[[[]
    [<(<(<(<{}))><([]([]()
    <{([([[(<>()){}]>(<<{{
    <{([{{}}[<[[[<>{}]]]>[]]
  `

  deepStrictEqual(score(program), {
    corruptionScore: 26397,
    autocompleteScore: 288957,
  })
}

export function part1(input: string) {
  strictEqual(score(input).corruptionScore, 278475)
}

export function part2(input: string) {
  strictEqual(score(input).autocompleteScore, 3015539998)
}
