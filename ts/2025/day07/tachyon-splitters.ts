import { strictEqual } from 'assert'
import { PointMap } from '../../common/point_map'
import { dedent } from '../../common/string'
import { p } from '../../common/point'
import { CountMap } from '../../common/count_map'
import { memoize } from '../../common/fn'
import { toInt } from '../../common/number'

type Row = Set<number> & { __rowBrand: true }
type State = CountMap<Row>

const row = memoize(
  (from: string) => new Set(from.split(',').map(toInt)) as Row,
)

function next(current: Row, replace: number, replaceWith: number) {
  const next = new Set(current)
  next.delete(replace)
  next.add(replaceWith)
  return row(
    Array.from(next)
      .sort((a, b) => a - b)
      .join(','),
  )
}

function simulateTachyons(input: string) {
  const map = PointMap.fromStringOf(input, ['^', '.', 'S'])
  const start = map.first((ent) => ent === 'S')

  let splits = 0
  let state: State = new CountMap([[row(`${start.x}`), 1]])

  for (let y = start.bottom().y; map.isInside(p(start.x, y)); y--) {
    const splitters = new Set(
      map.row(y).flatMap(([point, ent]) => (ent === '^' ? point.x : [])),
    )

    if (!splitters.size) {
      // no splits on this line, all timelines are unchanged
      continue
    }

    const nextState: typeof state = new CountMap()
    for (const [row, timelineCount] of state) {
      for (const x of row) {
        if (splitters.has(x)) {
          splits += 1
          nextState.add(next(row, x, x - 1), timelineCount)
          nextState.add(next(row, x, x + 1), timelineCount)
        } else {
          nextState.add(row, timelineCount)
        }
      }
    }

    state = nextState
  }

  return { splits, timelines: state.sum() }
}

export function test() {
  const input = dedent`
    .......S.......
    ...............
    .......^.......
    ...............
    ......^.^......
    ...............
    .....^.^.^.....
    ...............
    ....^.^...^....
    ...............
    ...^.^...^.^...
    ...............
    ..^...^.....^..
    ...............
    .^.^.^.^.^...^.
    ...............
  `

  strictEqual(simulateTachyons(input).splits, 21)
  strictEqual(simulateTachyons(input).timelines, 40)
}

export function part1(input: string) {
  console.log(
    `The tachyon beam splits`,
    simulateTachyons(input).splits,
    `times.`,
  )
}

export function part2(input: string) {
  console.log(
    `The tachyon beam produces`,
    simulateTachyons(input).timelines,
    `timelines.`,
  )
}
