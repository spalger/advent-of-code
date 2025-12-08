import { deepStrictEqual } from 'assert'
import { dedent, toLines } from '../../common/string.ts'
import { PointMap } from '../../common/point_map.ts'
import { toInt } from '../../common/number.ts'
import { p } from '../../common/point.ts'

function parse(input: string) {
  return PointMap.fromGenerator(function* () {
    for (const line of toLines(input)) {
      const [start, ...queue] = line
        .split(' -> ')
        .map((pair) => pair.split(',') as [string, string])
        .map(([x, y]) => p(toInt(x), toInt(y)))

      let cursor = start
      for (const next of queue) {
        const diff = next.sub(cursor)
        const dir = p(
          diff.x ? diff.x / Math.abs(diff.x) : 0,
          diff.y ? diff.y / Math.abs(diff.y) : 0,
        )

        while (true) {
          yield [cursor, '#']
          if (cursor === next) {
            break
          }
          cursor = cursor.add(dir)
        }
      }
    }
  })
}

function printMap(map: PointMap<string>) {
  map.resetBounds()
  for (let y = map.minY; y <= map.maxY; y++) {
    let line = `${y} `
    for (let x = map.minX; x <= map.maxX; x++) {
      line += map.points.get(p(x, y)) ?? ' '
    }
    console.log(line)
  }

  const height = `${map.maxX}`.length
  for (let h = 0; h <= height; h++) {
    let line = `  `
    for (let x = map.minX; x <= map.maxX; x++) {
      line += `${x}`[h] ?? ' '
    }
    console.log(line)
  }
}

function dropSand(src: PointMap<string>, opts: { hasFloor?: boolean } = {}) {
  const entry = p(500, 0)
  const map = PointMap.fromIterable(src)
  const floorY = map.maxY + 2
  let atRest = 0
  dropSand: while (true) {
    let pos = entry
    findRestingPlace: while (true) {
      /**
       * find the resting place of this unit of sand
       * if it progresses beyond map.maxY then print
       * final map state and return number of units
       * that came to rest
       */
      if (!opts.hasFloor && pos.y >= map.maxY) {
        printMap(map)
        return atRest
      }

      if (opts.hasFloor && pos.y + 1 === floorY) {
        map.points.set(pos, 'o')
        atRest += 1
        continue dropSand
      }

      // in this problem y = 0 is the top, y = Inf is the bottom, so we invert top and bottom
      const down = pos.top()
      if (!map.points.has(down)) {
        pos = down
        continue findRestingPlace
      }

      const downLeft = pos.topLeft()
      if (!map.points.has(downLeft)) {
        pos = downLeft
        continue findRestingPlace
      }

      const downRight = pos.topRight()
      if (!map.points.has(downRight)) {
        pos = downRight
        continue findRestingPlace
      }

      atRest += 1
      map.points.set(pos, 'o')
      if (opts.hasFloor && pos === entry) {
        printMap(map)
        return atRest
      }

      continue dropSand
    }
  }
}

export function test() {
  const map = parse(dedent`
    498,4 -> 498,6 -> 496,6
    503,4 -> 502,4 -> 502,9 -> 494,9
  `)

  deepStrictEqual(dropSand(map), 24)
  deepStrictEqual(dropSand(map, { hasFloor: true }), 93)
}

export function part1(input: string) {
  console.log(
    'in this cave',
    dropSand(parse(input)),
    'units of sand can come to rest',
  )
}

export function part2(input: string) {
  console.log(
    'in this cave',
    dropSand(parse(input), { hasFloor: true }),
    'units of sand can come to rest when there is a floor',
  )
}
