import { strictEqual } from 'assert'

import { toLines, dedent } from '../lib/string'

type Planets = Map<string, Planet>
class Planet {
  constructor(public readonly name: string) {}
  parent?: Planet

  _distanceToCom?: number
  getDistanceToCom(): number {
    if (this._distanceToCom === undefined) {
      this._distanceToCom = this.parent ? this.parent.getDistanceToCom() + 1 : 0
    }

    return this._distanceToCom
  }

  _transfersFromCom?: Planet[]
  getTransfersFromCom(): Planet[] {
    if (this._transfersFromCom !== undefined) {
      return this._transfersFromCom
    }

    return (this._transfersFromCom =
      this.parent && this.parent.name !== 'COM'
        ? [...this.parent.getTransfersFromCom(), this.parent]
        : [])
  }
}

function parseMap(map: string) {
  // map of planets by name, each planet points to their children/parents
  const planets: Planets = new Map()

  const getPlanet = (name: string) => {
    const existing = planets.get(name)
    if (existing) {
      return existing
    }

    const planet = new Planet(name)
    planets.set(name, planet)
    return planet
  }

  for (const line of toLines(map)) {
    const [parent, child] = line.split(')').map(getPlanet)
    child.parent = parent
  }

  return planets
}

function sumDistancesToCom(planets: Planets) {
  return Array.from(planets.values()).reduce(
    (acc, p) => acc + p.getDistanceToCom(),
    0,
  )
}

function getOrbitalTransfersPathToSanta(planets: Planets) {
  const transfersFromCom = planets.get('YOU')!.getTransfersFromCom()
  const toSantaFromCom = planets.get('SAN')!.getTransfersFromCom()

  let pivot
  for (let i = 0; i < transfersFromCom.length; i++) {
    if (transfersFromCom[i] !== toSantaFromCom[i]) {
      pivot = i - 1
      break
    }
  }

  if (pivot === undefined) {
    return []
  }

  return [
    ...transfersFromCom.slice(pivot, -1).reverse(),
    ...toSantaFromCom.slice(pivot + 1),
  ]
}

export function test() {
  strictEqual(
    sumDistancesToCom(
      parseMap(dedent`
        COM)B
        B)C
        C)D
        D)E
        E)F
        B)G
        G)H
        D)I
        E)J
        J)K
        K)L
      `),
    ),
    42,
  )

  strictEqual(
    getOrbitalTransfersPathToSanta(
      parseMap(dedent`
        COM)B
        B)C
        C)D
        D)E
        E)F
        B)G
        G)H
        D)I
        E)J
        J)K
        K)L
        K)YOU
        I)SAN
      `),
    ).length,
    4,
  )
}

export function part1(input: string) {
  console.log(
    'the total number of orbits in our map is',
    sumDistancesToCom(parseMap(input)),
  )
}

export function part2(input: string) {
  console.log(
    'it takes',
    getOrbitalTransfersPathToSanta(parseMap(input)).length,
    'transfers to get to santa',
  )
}
