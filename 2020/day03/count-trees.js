export function run(input) {
  const map = input
    .split('\n')
    .filter((l) => l.trim())
    .map((l) =>
      l
        .split('')
        .filter((c) => c.trim())
        .map((c) => (c === '#' ? 'tree' : undefined)),
    )
  const mapHeight = map.length
  const mapWidth = map[0].length

  class Position {
    x = 0
    y = 0

    isOnMap() {
      return this.y < mapHeight
    }

    isTree() {
      return map[this.y][this.x % mapWidth] === 'tree'
    }

    incr(slope) {
      this.x += slope.x
      this.y += slope.y
    }
  }

  const slopes = [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 5, y: 1 },
    { x: 7, y: 1 },
    { x: 1, y: 2 },
  ]

  const collisions = []

  for (const slope of slopes) {
    let treeCount = 0
    for (const pos = new Position(); pos.isOnMap(); pos.incr(slope)) {
      if (pos.isTree()) {
        treeCount += 1
      }
    }
    collisions.push(treeCount)
    console.log(
      'going right',
      slope.x,
      'and down',
      slope.y,
      'would lead to encountering',
      treeCount,
      'trees',
    )
  }

  console.log(
    'product of tree encounters is',
    collisions.reduce((acc, n) => acc * n),
  )
}
