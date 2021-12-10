import { strictEqual } from 'assert'
import { dedent, toLines } from '../../common/string'

type Char = '[' | ']' | '(' | ')' | '{' | '}' | '<' | '>'

const scores = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
}

function scoreCorruption(input: string) {
  let score = 0
  parseLine: for (const [lineI, line] of toLines(input).entries()) {
    const expect: Char[] = []
    for (const [i, char] of (line.split('') as Char[]).entries()) {
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
            console.log('line', lineI, 'corrupted with', char, 'at pos', i)
            score += scores[char]
            continue parseLine
          }
      }
    }
  }

  console.log('corruption score:', score)
  return score
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

  strictEqual(scoreCorruption(program), 26397)
}

export function part1(input: string) {
  strictEqual(scoreCorruption(input), 278475)
}
