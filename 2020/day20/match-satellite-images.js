const Fs = require('fs')
const { p } = require('./point')

class Image {
  static fromInput(imageData) {
    const [title, ...pixelRows] = imageData.trim().split('\n')
    const id = parseInt(title.split(' ')[1], 10)
    const pixels = pixelRows.map((row) => row.split(''))
    return new Image(id, pixels)
  }

  /**
   * @param {number} id
   * @param {Array<string[]>} pixels
   */
  constructor(id, pixels) {
    this.id = id
    this.pixels = pixels
    this.top = this.pixels[0].join('')
    this.right = this.pixels.map((r) => r[r.length - 1]).join('')
    this.bottom = this.pixels[this.pixels.length - 1].join('')
    this.left = this.pixels.map((r) => r[0]).join('')
  }

  _rotate() {
    const max = this.pixels.length - 1
    return new Image(
      this.id,
      this.pixels.map((r, y) => r.map((_, x) => this.pixels[max - x][y])),
    )
  }

  orientations() {
    if (this._orientations) {
      return this._orientations
    }

    // 0, 90, 180, 270 degrees
    this._orientations = [this]
    while (this._orientations.length < 4) {
      this._orientations.push(
        this._orientations[this._orientations.length - 1]._rotate(),
      )
    }

    // top <-> bottom
    this._orientations.push(new Image(this.id, this.pixels.slice().reverse()))

    // left <-> right
    this._orientations.push(
      new Image(
        this.id,
        this.pixels.map((r) => r.slice().reverse()),
      ),
    )

    return this._orientations
  }

  toString() {
    return this.pixels.map((r) => r.join('')).join('\n')
  }
}

const images = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n\n')
  .filter((i) => i.trim())
  .map((d) => Image.fromInput(d))

const width = Math.sqrt(images.length)

if (width !== parseInt(width)) {
  throw new Error(`image size of ${width} is not valid`)
}

let maxArrangement = 0

const arrangeImages = () => {
  const tasks = [
    {
      unmatched: images,
      arrangement: new Map(),
    },
  ]

  while (tasks.length) {
    // attempt to place an unmatched image in the next space in the
    // arrangement, starting from 0,0 and progressing to the right until
    // we reach the end of the row, then moving to 0,1, and so on

    const { unmatched, arrangement } = tasks.shift()
    maxArrangement = Math.max(maxArrangement, arrangement.size)
    const point = p(
      arrangement.size % width,
      Math.floor(arrangement.size / width),
    )
    const left = point.x > 0 ? arrangement.get(point.left()) : null
    const above = point.y > 0 ? arrangement.get(point.above()) : null

    for (let i = 0; i < unmatched.length; i++) {
      for (const img of unmatched[i].orientations()) {
        if (left && img.left !== left.right) {
          continue
        }
        if (above && img.top !== above.bottom) {
          continue
        }

        const newArragement = new Map(arrangement)
        newArragement.set(point, img)

        if (newArragement.size === images.length) {
          return newArragement
        }

        tasks.unshift({
          unmatched: [...unmatched.slice(0, i), ...unmatched.slice(i + 1)],
          arrangement: newArragement,
        })
      }
    }
  }
}

const arrangement = arrangeImages()
console.log(`arrangement:\n${arrangement}`)
console.log('max arrangement size =', maxArrangement)

if (arrangement) {
  const corners = [
    arrangement.get(p(0, 0)).id,
    arrangement.get(p(width - 1, 0)).id,
    arrangement.get(p(width - 1, width - 1)).id,
    arrangement.get(p(0, width - 1)).id,
  ]

  console.log(
    'product of the corners is',
    corners.reduce((acc, id) => acc * id),
  )
}
