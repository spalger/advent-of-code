import { strictEqual, deepStrictEqual } from 'assert'

import { toLines } from '../../common/string.ts'
import { toInt, lcm } from '../../common/number.ts'
import { ElementType } from '../../common/ts.ts'

const dirs = ['x', 'y', 'z'] as const
type Dir = ElementType<typeof dirs>
const COORD_RE = /^<\s*x=\s*(-?\d+),\s*y=\s*(-?\d+),\s*z=\s*(-?\d+)\s*>$/

const parseMoons = (input: string) =>
  toLines(input).map((coord) => {
    const [, x, y, z] = coord.match(COORD_RE)!
    return new Moon(new P3d(toInt(x), toInt(y), toInt(z)))
  })

const sum = <T>(arr: readonly T[], fn: (i: T) => number): number =>
  arr.reduce((acc, i) => acc + fn(i), 0)

class P3d {
  constructor(public x: number, public y: number, public z: number) {}

  add(other: P3d) {
    this.x += other.x
    this.y += other.y
    this.z += other.z
  }

  clone() {
    return new P3d(this.x, this.y, this.z)
  }
}

class Moon {
  constructor(
    readonly position: P3d,
    readonly velocity: P3d = new P3d(0, 0, 0),
  ) {}

  getEnergy() {
    return (
      sum(dirs, (d) => Math.abs(this.position[d])) *
      sum(dirs, (d) => Math.abs(this.velocity[d]))
    )
  }
}

function tick(moons: Moon[]) {
  for (const [i, moon] of moons.entries()) {
    for (const otherMoon of moons.slice(i + 1)) {
      for (const dir of dirs) {
        if (moon.position[dir] > otherMoon.position[dir]) {
          moon.velocity[dir] -= 1
          otherMoon.velocity[dir] += 1
        }
        if (moon.position[dir] < otherMoon.position[dir]) {
          moon.velocity[dir] += 1
          otherMoon.velocity[dir] -= 1
        }
      }
    }
  }

  for (const moon of moons) {
    moon.position.add(moon.velocity)
  }
}

function simulateMoons(moons: Moon[], steps: number) {
  for (let i = 0; i < steps; i++) {
    tick(moons)
  }

  return moons
}

function findCycleLength(moons: Moon[]) {
  const cycles = new Map<Dir, number>()
  const initial = moons.map((m) => m.position.clone())

  for (let cycle = 1; cycles.size < 3; cycle++) {
    tick(moons)

    for (const dir of dirs) {
      if (cycles.has(dir)) {
        continue
      }

      const match = moons.every(
        (m, i) => m.velocity[dir] === 0 && m.position[dir] === initial[i][dir],
      )

      if (match) {
        cycles.set(dir, cycle)
      }
    }
  }

  return Array.from(cycles.values()).reduce(lcm)
}

export function test() {
  deepStrictEqual(
    simulateMoons(
      [
        new Moon(new P3d(-1, 0, 2)),
        new Moon(new P3d(2, -10, -7)),
        new Moon(new P3d(4, -8, 8)),
        new Moon(new P3d(3, 5, -1)),
      ],
      10,
    ),
    [
      new Moon(new P3d(2, 1, -3), new P3d(-3, -2, 1)),
      new Moon(new P3d(1, -8, 0), new P3d(-1, 1, 3)),
      new Moon(new P3d(3, -6, 1), new P3d(3, 2, -3)),
      new Moon(new P3d(2, 0, 4), new P3d(1, -1, -1)),
    ],
  )

  strictEqual(
    sum(
      simulateMoons(
        [
          new Moon(new P3d(-8, -10, 0)),
          new Moon(new P3d(5, 5, 10)),
          new Moon(new P3d(2, -7, 3)),
          new Moon(new P3d(9, -8, -3)),
        ],
        100,
      ),
      (moon) => moon.getEnergy(),
    ),
    1940,
  )
}

export function part1(input: string) {
  const moons = parseMoons(input)
  simulateMoons(moons, 1000)
  const energy = sum(moons, (m) => m.getEnergy())

  console.log('the total energy in the system after 1000 rounds is', energy)
}

export function part2(input: string) {
  const moons = parseMoons(input)
  console.log('the moons repeat a cycle every', findCycleLength(moons), 'ticks')
}
