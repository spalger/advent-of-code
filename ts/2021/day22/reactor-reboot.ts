import { strictEqual } from 'assert'

import { dedent, toLines } from '../../common/string'
import { toInt } from '../../common/number'
import { Point3d } from '../../common/point_3d'

const INSTRUCTION_RE =
  /^(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)$/

class Cuboid {
  static validate(min: Point3d, max: Point3d) {
    return min.x < max.x && min.y < max.y && min.z < max.z
  }

  public readonly volume: number
  constructor(public readonly min: Point3d, public readonly max: Point3d) {
    if (!Cuboid.validate(min, max)) {
      throw new Error(`min or max for cuboid is invalid min=${min} max=${max}`)
    }

    const diff = this.max.subtract(this.min)
    this.volume = Math.abs(diff.x) * Math.abs(diff.y) * Math.abs(diff.z)
  }

  intersect(other: Cuboid) {
    const min = Point3d.max(this.min, other.min)
    const max = Point3d.min(this.max, other.max)
    if (Cuboid.validate(min, max)) {
      return new Cuboid(min, max)
    }
  }
}

const INIT_ZONE = new Cuboid(
  new Point3d(-50, -50, -50),
  new Point3d(51, 51, 51),
)

class ReactorState {
  static parse(input: string) {
    return toLines(input).map((line) => {
      const match = line.match(INSTRUCTION_RE)
      if (!match) {
        throw new Error(
          `input line "${line}" doesn't match format ${INSTRUCTION_RE.source}`,
        )
      }

      return new ReactorState(
        match[1] === 'on',
        new Cuboid(
          new Point3d(toInt(match[2]), toInt(match[4]), toInt(match[6])),
          new Point3d(
            toInt(match[3]) + 1,
            toInt(match[5]) + 1,
            toInt(match[7]) + 1,
          ),
        ),
      )
    })
  }

  static parseAndRun(input: string, bounds?: Cuboid) {
    const newStates = ReactorState.parse(input)
    const prevStates: ReactorState[] = []
    let numberOn = 0

    const pushState = (state: ReactorState) => {
      numberOn += state.on ? state.cuboid.volume : -state.cuboid.volume
      prevStates.push(state)
    }

    for (const step of newStates) {
      const newState = bounds ? step.reduce(bounds) : step

      if (!newState) {
        continue
      }

      // cache the length because we're going to be pushing into this list
      // and we don't want to iterate over the new items
      for (const state of prevStates.slice()) {
        const intersection = state.cuboid.intersect(newState.cuboid)
        if (!intersection) {
          continue
        }

        pushState(new ReactorState(!state.on, intersection))
      }

      if (newState.on) {
        pushState(newState)
      }
    }

    console.log('after rebooting', numberOn, 'cubes are on')
    return numberOn
  }

  constructor(public on: boolean, public cuboid: Cuboid) {}
  reduce(other: Cuboid) {
    const intersection = this.cuboid.intersect(other)
    if (!intersection) {
      return
    }
    return new ReactorState(this.on, intersection)
  }
}

export function test(input: string) {
  strictEqual(
    ReactorState.parseAndRun(dedent`
      on x=10..12,y=10..12,z=10..12
      on x=11..13,y=11..13,z=11..13
      off x=9..11,y=9..11,z=9..11
      on x=10..10,y=10..10,z=10..10
    `),
    39,
  )

  const [input1, input2] = input.split('---')

  strictEqual(ReactorState.parseAndRun(input1, INIT_ZONE), 590784)
  strictEqual(ReactorState.parseAndRun(input2), 2758514936282235)
}

export function part1(input: string) {
  strictEqual(ReactorState.parseAndRun(input, INIT_ZONE), 556501)
}

export function part2(input: string) {
  strictEqual(ReactorState.parseAndRun(input), 1217140271559773)
}
