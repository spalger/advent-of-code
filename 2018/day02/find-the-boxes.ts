import { dedent, toLines } from '../../common/string'

class BoxId {
  static parse(id: string) {
    const counts = new Map<string, number>()
    for (let i = 0; i < id.length; i++) {
      const char = id[i]
      const existing = counts.get(char)
      if (typeof existing === 'number') {
        counts.set(char, existing + 1)
      } else {
        counts.set(char, 1)
      }
    }

    let hasTwo = false
    let hasThree = false
    for (const [char, count] of counts) {
      if (count === 2) {
        hasTwo = true
      }
      if (count === 3) {
        hasThree = true
      }
      if (hasTwo && hasThree) {
        break
      }
    }

    return new BoxId(id, hasTwo, hasThree)
  }

  private readonly compareCache = new Map<BoxId, number>()
  constructor(
    public readonly id: string,
    public readonly hasTwo: boolean,
    public readonly hasThree: boolean,
  ) {}

  compare(other: BoxId) {
    const cached = this.compareCache.get(other) ?? other.compareCache.get(this)
    if (cached !== undefined) {
      return cached
    }

    let diffCount = 0
    for (let i = 0; i < this.id.length; i++) {
      if (this.id[i] !== other.id[i]) {
        diffCount += 1
      }
      if (diffCount > 1) {
        break
      }
    }
    this.compareCache.set(other, diffCount)
    return diffCount
  }
}

function simpleChecksum(boxIds: BoxId[]) {
  let hasTwo = 0
  let hasThree = 0
  for (const id of boxIds) {
    if (id.hasTwo) {
      hasTwo += 1
    }
    if (id.hasThree) {
      hasThree += 1
    }
  }
  console.log('box ids with two repeating chars', hasTwo)
  console.log('box ids with three repeating chars', hasThree)
  console.log('checksum is', hasTwo * hasThree)
}

function findOffByOneIds(boxIds: BoxId[]) {
  for (const [i, boxId] of boxIds.entries()) {
    for (const [i2, otherBoxId] of boxIds.entries()) {
      if (i === i2) {
        continue
      }

      if (boxId.compare(otherBoxId) === 1) {
        console.log('box1:', boxId.id)
        console.log('box2:', otherBoxId.id)

        let same = ''
        for (let c = 0; c < boxId.id.length; c++) {
          if (boxId.id[c] === otherBoxId.id[c]) {
            same += boxId.id[c]
          }
        }

        console.log('similar:', same)
        return
      }
    }
  }

  throw new Error('never found two boxIds with ids off by one char')
}

export function test() {
  simpleChecksum(
    toLines(dedent`
      abcdef
      bababc
      abbcde
      abcccd
      aabcdd
      abcdee
      ababab
    `).map(BoxId.parse),
  )

  findOffByOneIds(
    toLines(dedent`
      abcde
      fghij
      klmno
      pqrst
      fguij
      axcye
      wvxyz
    `).map(BoxId.parse),
  )
}

export function part1(input: string) {
  simpleChecksum(toLines(input).map(BoxId.parse))
}

export function part2(input: string) {
  findOffByOneIds(toLines(input).map(BoxId.parse))
}
