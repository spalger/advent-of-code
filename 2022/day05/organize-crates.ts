import { deepStrictEqual } from 'assert'
import { toLines } from '../../common/string'
import { toInt } from '../../common/number'

type Change = {
  count: number
  from: number
  to: number
}

const parseChanges = (rules: string) =>
  toLines(rules).map((rule): Change => {
    const match = rule.match(/^move (\d+) from (\d+) to (\d+)$/)
    if (!match) {
      throw new Error("rule line doesn't match pattern")
    }
    return {
      count: toInt(match[1]),
      from: toInt(match[2]),
      to: toInt(match[3]),
    }
  })

const parseInitialPositions = (init: string) => {
  const rows = init
    .split('\n')
    .slice(0, -1)
    .map((line) => {
      const row: Array<null | string> = []
      for (let i = 0; i < line.length; i++) {
        const value = line.slice(i, i + 3)
        if (value === '   ') {
          row.push(null)
        } else {
          row.push(value[1])
        }
        i = i + 3
      }
      return row
    })

  if (!rows.length) {
    throw new Error('unable to parse grid')
  }

  const width = rows[0].length
  if (rows.some((r) => r.length !== width)) {
    throw new Error(`expected every row to have a length of ${width}`)
  }

  const columns: string[][] = []
  for (let col = 0; col < width; col++) {
    const crates: string[] = []
    columns.push(crates)

    for (let row = 0; row < rows.length; row++) {
      const crate = rows[row][col]
      if (!crates.length) {
        if (crate !== null) {
          crates.push(crate)
        }
        continue
      }

      if (crate === null) {
        throw new Error(`empty spot in rows after first crate [${row}][${col}]`)
      }

      crates.push(crate)
    }
  }

  return columns
}
const parse = (map: string) => {
  const [initial, changes] = map.split('\n\n')
  return {
    columns: parseInitialPositions(initial),
    changes: parseChanges(changes),
  }
}

const apply = (initial: string[][], steps: Change[], oneByOne: boolean) => {
  const columns = initial.map((col) => Array.from(col))
  for (const change of steps) {
    const from = columns[change.from - 1]
    const to = columns[change.to - 1]
    const moved = from.splice(0, change.count)
    if (oneByOne) {
      moved.reverse()
    }
    to.unshift(...moved)
  }
  return columns
}

const hash = (columns: string[][]) => columns.map((c) => c[0]).join('')

export function test() {
  const pairs = parse(`    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3  

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2
  `)

  deepStrictEqual(hash(apply(pairs.columns, pairs.changes, true)), 'CMZ')
  deepStrictEqual(hash(apply(pairs.columns, pairs.changes, false)), 'MCD')
}

export function part1(input: string) {
  const { columns, changes } = parse(input)
  console.log(
    'after organizing, the top crates are',
    hash(apply(columns, changes, true)),
  )
}

export function part2(input: string) {
  const { columns, changes } = parse(input)
  console.log(
    'after organizing with 9001, the top crates are',
    hash(apply(columns, changes, false)),
  )
}
