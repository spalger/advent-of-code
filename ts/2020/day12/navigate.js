export function run(input) {
  const directions = input
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      const [dir, ...amount] = l.split('')
      return { dir, amount: parseInt(amount.join(''), 10) }
    })

  const rotate = (x, y, deg) => {
    const radians = deg * (Math.PI / 180)
    return [
      Math.round(x * Math.cos(radians) - y * Math.sin(radians)),
      Math.round(x * Math.sin(radians) + y * Math.cos(radians)),
    ]
  }

  // position of the boat
  let x = 0
  let y = 0

  // position of the waypoint
  let waypointX = 10
  let waypointY = 1

  for (const { dir, amount } of directions) {
    switch (dir) {
      case 'N':
        waypointY += amount
        break
      case 'S':
        waypointY -= amount
        break
      case 'E':
        waypointX += amount
        break
      case 'W':
        waypointX -= amount
        break
      case 'L':
        ;[waypointX, waypointY] = rotate(waypointX, waypointY, amount)
        break
      case 'R':
        ;[waypointX, waypointY] = rotate(waypointX, waypointY, -amount)
        break
      case 'F':
        x += waypointX * amount
        y += waypointY * amount
        break
      default:
        throw new Error(`unexpected direction ${dir}`)
    }
  }

  console.log(
    `final position is (${x},${y}) with a waypoint location of (${waypointX}, ${waypointY}) degrees`,
  )
  console.log('manhattan distance traveled is', Math.abs(x) + Math.abs(y))
}
