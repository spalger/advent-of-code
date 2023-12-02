function* neighbors(location) {
  const [xStr, yStr, zStr, wStr] = location.split(',')
  const [x, y, z, w] = [+xStr, +yStr, +zStr, +wStr]

  for (let xd = -1; xd <= 1; xd++) {
    const nx = x + xd
    for (let yd = -1; yd <= 1; yd++) {
      const ny = y + yd
      for (let zd = -1; zd <= 1; zd++) {
        const nz = z + zd
        for (let wd = -1; wd <= 1; wd++) {
          const nw = w + wd

          if (x === nx && y === ny && z === nz && w === nw) {
            continue
          }

          yield `${nx},${ny},${nz},${nw}`
        }
      }
    }
  }
}

export function run(input) {
  let activeCubes = new Set(
    input
      .split('\n')
      .filter((l) => l.trim())
      .map((l, y) =>
        l.split('').map((c, x) => (c === '#' ? `${x},${y},0,0` : undefined)),
      )
      .reduce((acc, row) => acc.concat(row))
      .filter((loc) => loc !== undefined),
  )

  for (let cycle = 1; cycle <= 6; cycle++) {
    const nextActiveCubes = new Set(activeCubes)

    /**
     * the count of active neighbors around each inactive block that is next to an active block
     * @type {Map<string, number>}
     */
    const activeNeighborCount = new Map()

    for (const loc of activeCubes) {
      let activeCount = 0
      for (const nLoc of neighbors(loc)) {
        if (activeCubes.has(nLoc)) {
          activeCount += 1
        } else {
          activeNeighborCount.set(
            nLoc,
            (activeNeighborCount.get(nLoc) ?? 0) + 1,
          )
        }
      }

      if (activeCount < 2 || activeCount > 3) {
        nextActiveCubes.delete(loc)
      }
    }

    for (const [loc, count] of activeNeighborCount) {
      if (count === 3) {
        nextActiveCubes.add(loc)
      }
    }

    activeCubes = nextActiveCubes
  }

  console.log('after 6 cycles there are', activeCubes.size, 'active cubes')
}
