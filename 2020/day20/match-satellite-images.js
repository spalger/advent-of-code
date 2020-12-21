const Fs = require('fs')
const { p } = require('./point')

class Image {
  static fromInput(imageData) {
    const [title, ...pixelRows] = imageData.trim().split('\n')
    const id = parseInt(title.split(' ')[1], 10)
    const pixels = pixelRows.map((row) => row.split(''))
    return new Image(
      id,
      pixels[0].join(''),
      pixels.map((r) => r[r.length - 1]).join(''),
      pixels[pixels.length - 1].join(''),
      pixels.map((r) => r[0]).join(''),
    )
  }

  /**
   * @param {number} id
   * @param {string} top
   * @param {string} right
   * @param {string} bottom
   * @param {string} left
   */
  constructor(id, top, right, bottom, left) {
    this.id = id
    this.top = top
    this.right = right
    this.bottom = bottom
    this.left = left
  }

  findNeighbors(allImageOrientationsById) {
    const others = new Map(allImageOrientationsById)
    others.delete(this.id)

    const neighbors = new Map()

    const findNeighbor = (dir, oppositeDir) => {
      for (const [id, orientations] of others) {
        for (const img of orientations) {
          if (img[oppositeDir] === this[dir]) {
            others.delete(id)
            neighbors.set(dir, img)
          }
        }
      }
    }

    findNeighbor('left', 'right')
    findNeighbor('right', 'left')
    findNeighbor('top', 'bottom')
    findNeighbor('bottom', 'top')

    return neighbors
  }

  toString() {
    let printed = `${this.top}\n`
    const center = ' '.repeat(this.top.length - 2)
    for (let i = 1; i < this.left.length - 1; i++) {
      printed += `${this.left[i]}${center}${this.right[i]}\n`
    }
    printed += this.bottom
    return printed
  }
}

const images = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n\n')
  .filter((i) => i.trim())
  .map((d) => Image.fromInput(d))

const reverse = (str) => str.split('').reverse().join('')
const rotate = (img) =>
  new Image(img.id, img.left, img.top, img.right, img.bottom)
const flipH = (img) =>
  new Image(img.id, reverse(img.top), img.left, reverse(img.bottom), img.right)
const flipV = (img) =>
  new Image(img.id, img.bottom, reverse(img.right), img.top, reverse(img.left))

const imagesOrientationsById = new Map()
for (const img of images) {
  const orientations = []
  for (let i = 0, source = img; i < 4; i++, source = rotate(source)) {
    orientations.push(source, flipH(source), flipV(source))
  }
  imagesOrientationsById.set(img.id, orientations)
}

const imagesWithTwoNeighbors = images.filter(
  (img) => img.findNeighbors(imagesOrientationsById).size === 2,
)

console.log(
  'there are',
  imagesWithTwoNeighbors.length,
  'images with only two neighbors, ids:',
  imagesWithTwoNeighbors.map((img) => img.id),
  'product of the ids is',
  imagesWithTwoNeighbors.reduce((acc, img) => acc * img.id, 1),
)
