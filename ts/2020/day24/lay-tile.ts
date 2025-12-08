import { strictEqual } from 'assert'
import { p, HexPoint } from './point.ts'
import { dedent } from '../../common//string.ts'

type Dir = 'e' | 'se' | 'sw' | 'w' | 'nw' | 'ne'

function layTiles(directions: string) {
  const flippedTiles = new Set<HexPoint>()
  const origin = p(0, 0)

  for (const line of directions.split('\n')) {
    if (!line) continue

    let pos = origin
    const chars = line.split('')
    while (chars.length) {
      let dir = `${chars.shift()}`
      if (dir === 's' || dir === 'n') {
        dir += chars.shift()
      }

      pos = pos[dir as Dir]()
    }

    if (flippedTiles.has(pos)) {
      flippedTiles.delete(pos)
    } else {
      flippedTiles.add(pos)
    }
  }

  return flippedTiles
}

function simulateFlippingDays(initTiles: Set<HexPoint>, days: number) {
  let tiles = new Set(initTiles)
  for (let i = 0; i < days; i++) {
    tiles = doTileFlippingCeremony(tiles)
  }
  return tiles
}

function doTileFlippingCeremony(tiles: Set<HexPoint>) {
  // count of flipped neighbors next to a non-flipped neighbor
  const flippedCount = new Map<HexPoint, number>()
  const newTiles = new Set(tiles)

  for (const tile of tiles) {
    let flippedNeighborCount = 0

    // iterate through the neighbors of this tile, count how many are
    // flipped and increment a counter for each non-flipped neighbor
    // to identify if it should be flipped later
    for (const neighbor of tile.neighbors()) {
      if (tiles.has(neighbor)) {
        flippedNeighborCount++
      } else {
        flippedCount.set(neighbor, (flippedCount.get(neighbor) ?? 0) + 1)
      }
    }

    if (flippedNeighborCount === 0 || flippedNeighborCount > 2) {
      newTiles.delete(tile)
    }
  }

  for (const [notFlipped, count] of flippedCount) {
    if (count === 2) {
      newTiles.add(notFlipped)
    }
  }

  return newTiles
}

export function test() {
  const flippedTiles = layTiles(dedent`
    sesenwnenenewseeswwswswwnenewsewsw
    neeenesenwnwwswnenewnwwsewnenwseswesw
    seswneswswsenwwnwse
    nwnwneseeswswnenewneswwnewseswneseene
    swweswneswnenwsewnwneneseenw
    eesenwseswswnenwswnwnwsewwnwsene
    sewnenenenesenwsewnenwwwse
    wenwwweseeeweswwwnwwe
    wsweesenenewnwwnwsenewsenwwsesesenwne
    neeswseenwwswnwswswnw
    nenwswwsewswnenenewsenwsenwnesesenew
    enewnwewneswsewnwswenweswnenwsenwsw
    sweneswneswneneenwnewenewwneswswnese
    swwesenesewenwneswnwwneseswwne
    enesenwswwswneneswsenwnewswseenwsese
    wnwnesenesenenwwnenwsewesewsesesew
    nenewswnwewswnenesenwnesewesw
    eneswnwswnwsenenwnwnwwseeswneewsenese
    neswnwewnwnwseenwseesewsenwsweewe
    wseweeenwnesenwwwswnew
  `)

  strictEqual(flippedTiles.size, 10)
  strictEqual(simulateFlippingDays(flippedTiles, 100).size, 2208)
}

export function part1(input: string) {
  const flippedTiles = layTiles(input)
  console.log(
    'after processing directions',
    flippedTiles.size,
    'tiles are black',
  )
}

export function part2(input: string) {
  const flippedTiles = simulateFlippingDays(layTiles(input), 100)
  console.log(
    'after 100 days of flipping ceremonies there are',
    flippedTiles.size,
    'black tiles',
  )
}
