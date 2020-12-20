const Fs = require('fs')
const { p } = require('./point')

const getCompareEdges = (aPoint, bPoint) => {
  if (aPoint === bPoint.left()) {
    return ['right', 'left']
  }
  if (aPoint === bPoint.right()) {
    return ['left', 'right']
  }
  if (aPoint === bPoint.above()) {
    return ['bottom', 'top']
  }
  if (aPoint === bPoint.below()) {
    return ['top', 'bottom']
  }
  throw new Error('aPoint and bPoint are not neighbors')
}

class Composite {
  /**
   * @param {number} size
   * @param {Map<Point,Image>} contents
   */
  constructor(size, contents) {
    this.size = size
    this.contents = contents
  }

  isFilled() {
    return this.contents.size === this.size * this.size
  }

  getFillablePoint() {
    if (!this.contents.size) {
      return p(0, 0)
    }

    for (const point of this.contents.keys()) {
      for (const nPoint of point.neighbors(this.size - 1)) {
        if (!this.contents.has(nPoint)) {
          return nPoint
        }
      }
    }
  }

  /**
   * @param {Image} image
   * @param {Point} point
   */
  fillPoint(image, point) {
    for (const nPoint of point.neighbors(this.size - 1)) {
      const nImage = this.contents.get(nPoint)
      if (!nImage) {
        continue
      }

      const [edge, nEdge] = getCompareEdges(point, nPoint)
      if (image.edges.get(edge) !== nImage.edges.get(nEdge)) {
        // this image can not be placed at this point because it
        // conflicts with the existing contents of the composite
        return
      }
    }

    const newContents = new Map(this.contents)
    newContents.set(point, image)
    return new Composite(this.size, newContents)
  }

  toString() {
    let str = ''
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const img = this.contents.get(p(x, y))
        str += img ? ` ${img.id} ` : `  --  `
      }

      str += '\n'
    }
    return str
  }
}

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
    this.edges = new Map([
      ['top', this.pixels[0].join('')],
      ['right', this.pixels.map((r) => r[r.length - 1]).join('')],
      ['bottom', this.pixels[this.pixels.length - 1].join('')],
      ['left', this.pixels.map((r) => r[0]).join('')],
    ])
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
  .map((d) => Image.fromInput(d))

const compositeSize = Math.sqrt(images.length)

if (compositeSize !== parseInt(compositeSize)) {
  throw new Error(`image size of ${compositeSize} is not valid`)
}

const compositeImages = () => {
  const tasks = [
    {
      unmatched: images,
      composite: new Composite(compositeSize, new Map()),
    },
  ]

  while (tasks.length) {
    // attempt to place an unmatched image in a "fillable" space in the
    // composite image, prioritizing spaces next to images so that we
    // can validate compatibility between images. Successfully filling
    // a point in the composite creates a new composite with the image
    // in place. The new composite is placed at the top of the queue
    // to be worked on next

    const { unmatched, composite } = tasks.shift()
    const fillable = composite.getFillablePoint()

    for (const image of unmatched) {
      for (const orientation of image.orientations()) {
        const newComposite = composite.fillPoint(orientation, fillable)
        if (!newComposite) {
          continue
        }

        if (newComposite.isFilled()) {
          return newComposite
        }

        tasks.unshift({
          unmatched: unmatched.filter((img) => img !== image),
          composite: newComposite,
        })
      }
    }
  }
}

const composite = compositeImages()
console.log(`composite:\n${composite}`)

if (composite) {
  const corners = [
    composite.contents.get(p(0, 0)).id,
    composite.contents.get(p(compositeSize - 1, 0)).id,
    composite.contents.get(p(compositeSize - 1, compositeSize - 1)).id,
    composite.contents.get(p(0, compositeSize - 1)).id,
  ]

  console.log(
    'product of the corners is',
    corners.reduce((acc, id) => acc * id),
  )
}
