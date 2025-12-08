import { strictEqual, deepStrictEqual } from 'assert'

import { p, Point } from '../../common/point.ts'
import { toLines, dedent } from '../../common/string.ts'
import { shift } from '../../common/array.ts'

class AsteroidMap {
  constructor(
    public readonly asteroids: Set<Point>,
    public readonly width: number,
    public readonly height: number,
  ) {}

  isInBounds(p: Point) {
    return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height
  }

  isVisible(from: Point, to: Point) {
    // determine the slope to `from`
    const offset = from.slopeTo(to)

    // walk from this point to the first asteroid seen in the direction of offset
    let cursor = from
    while (true) {
      cursor = cursor.add(offset)
      if (!this.isInBounds(cursor)) {
        return false
      }

      if (this.asteroids.has(cursor)) {
        return cursor === to
      }
    }
  }

  getVisibleAsteroids(from: Point) {
    const visible = new Set<Point>()

    for (const point of this.asteroids) {
      if (point === from) {
        continue
      }

      // if the first point of "collision" is `from` then this point is visible
      if (this.isVisible(from, point)) {
        visible.add(point)
      }
    }

    return visible
  }
}

function parseMap(map: string) {
  const asteroids = new Set<Point>()
  let width = 0
  let height = 0

  for (const [y, line] of toLines(map).entries()) {
    height = y + 1
    for (const [x, char] of line.split('').entries()) {
      width = x + 1
      if (char === '#') {
        asteroids.add(p(x, y))
      }
    }
  }

  return new AsteroidMap(asteroids, width, height)
}

function findBestLocationForStation(map: AsteroidMap) {
  let bestPoint
  let bestVisibleCount

  for (const point of map.asteroids) {
    const visible = map.getVisibleAsteroids(point)
    if (!bestVisibleCount || visible.size > bestVisibleCount) {
      bestVisibleCount = visible.size
      bestPoint = point
    }
  }

  if (!bestPoint) {
    throw new Error('there is no best location for a station')
  }

  return bestPoint
}

function destroyAsteroids(map: AsteroidMap, max: number) {
  const station = findBestLocationForStation(map)

  const getDistanceInDegrees = (to: Point) => {
    let rotatedBy = 0
    while (to.x < station.x || to.y > station.y) {
      if (rotatedBy === 360) {
        throw new Error(
          'rotating this point did not place it to the bottom right of the station',
        )
      }

      rotatedBy += 90
      to = to.rotate(-90, station)
    }

    const opposite = to.x - station.x
    const adjacent = station.y - to.y
    const angle = Math.atan(opposite / adjacent) * (180 / Math.PI)
    return Math.round((rotatedBy + angle) * 100) / 100
  }

  const asteroidsGroupedByRadialDistance = new Map<number, Point[]>()
  for (const asteroid of map.asteroids) {
    if (asteroid === station) {
      continue
    }

    const dist = getDistanceInDegrees(asteroid)
    const group = asteroidsGroupedByRadialDistance.get(dist)
    if (group) {
      group.push(asteroid)
    } else {
      asteroidsGroupedByRadialDistance.set(dist, [asteroid])
    }
  }

  // list of asteroid groups that are lined up by their distance from the station
  // in degrees from the point directly above the station, then sorted in each
  // group by their manhattan distance to the station (asc)
  const queue = Array.from(asteroidsGroupedByRadialDistance.entries())
    .sort(([distA], [distB]) => distA - distB)
    .map(([dist, group]) => ({
      dist,
      asteroids: group.sort((a, b) => a.mdist(station) - b.mdist(station)),
    }))

  const destroyedLog = []
  while (queue.length) {
    const group = shift(queue)
    const asteroid = shift(group.asteroids)

    destroyedLog.push(asteroid)

    if (destroyedLog.length === max) {
      return destroyedLog
    }

    if (group.asteroids.length) {
      queue.push(group)
    }
  }

  throw new Error('there was never a 200th asteroid destroyed')
}

export function test() {
  deepStrictEqual(
    parseMap(dedent`
      .#..#
      .....
      #####
      ....#
      ...##
    `),
    new AsteroidMap(
      new Set([
        p(1, 0),
        p(4, 0),
        p(0, 2),
        p(1, 2),
        p(2, 2),
        p(3, 2),
        p(4, 2),
        p(4, 3),
        p(3, 4),
        p(4, 4),
      ]),
      5,
      5,
    ),
  )

  strictEqual(
    findBestLocationForStation(
      parseMap(dedent`
        ......#.#.
        #..#.#....
        ..#######.
        .#.#.###..
        .#..#.....
        ..#....#.#
        #..#....#.
        .##.#..###
        ##...#..#.
        .#....####
      `),
    ),
    p(5, 8),
  )

  strictEqual(
    findBestLocationForStation(
      parseMap(dedent`
        .#..##.###...#######
        ##.############..##.
        .#.######.########.#
        .###.#######.####.#.
        #####.##.#.##.###.##
        ..#####..#.#########
        ####################
        #.####....###.#.#.##
        ##.#################
        #####.##.###..####..
        ..######..##.#######
        ####.##.####...##..#
        .#####..#.######.###
        ##...#.##########...
        #.##########.#######
        .####.#.###.###.#.##
        ....##.##.###..#####
        .#.#.###########.###
        #.#.#.#####.####.###
        ###.##.####.##.#..##
      `),
    ),
    p(11, 13),
  )

  const log = destroyAsteroids(
    parseMap(dedent`
      .#..##.###...#######
      ##.############..##.
      .#.######.########.#
      .###.#######.####.#.
      #####.##.#.##.###.##
      ..#####..#.#########
      ####################
      #.####....###.#.#.##
      ##.#################
      #####.##.###..####..
      ..######..##.#######
      ####.##.####...##..#
      .#####..#.######.###
      ##...#.##########...
      #.##########.#######
      .####.#.###.###.#.##
      ....##.##.###..#####
      .#.#.###########.###
      #.#.#.#####.####.###
      ###.##.####.##.#..##
    `),
    200,
  )

  strictEqual(log[0], p(11, 12))
  strictEqual(log[1], p(12, 1))
  strictEqual(log[2], p(12, 2))
  strictEqual(log[9], p(12, 8))
  strictEqual(log[19], p(16, 0))
  strictEqual(log[49], p(16, 9))
  strictEqual(log[99], p(10, 16))
  strictEqual(log[199], p(8, 2))
}

export function part1(input: string) {
  const map = parseMap(input)
  const loc = findBestLocationForStation(map)

  console.log(
    'the best location for a monitoring station would be',
    loc.toString(),
    'with',
    map.getVisibleAsteroids(loc).size,
    'asteroids visible',
  )
}

export function part2(input: string) {
  const map = parseMap(input)
  const destruction = destroyAsteroids(map, 200)

  console.log(
    'the 200th asteroid destroyed is at',
    destruction.pop()?.toString(),
  )
}
