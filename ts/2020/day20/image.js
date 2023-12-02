import chalk from 'chalk'
import { p } from './point'

const inverse = (dir) => {
  if (dir === 'left') return 'right'
  if (dir === 'right') return 'left'
  if (dir === 'top') return 'bottom'
  if (dir === 'bottom') return 'top'
}

export class Image {
  static fromInput(imageData) {
    const [title, ...pixelRows] = imageData.trim().split('\n')
    const id = parseInt(title.split(' ')[1], 10)
    const pixels = pixelRows.map((row) => row.split(''))
    return new Image(id, pixels)
  }

  /**
   * @param {number} id
   * @param {string} top
   * @param {string} right
   * @param {string} bottom
   * @param {string} left
   */
  constructor(id, pixels) {
    this.id = id
    this.pixels = pixels
    this.top = pixels[0].join('')
    this.right = pixels.map((r) => r[r.length - 1]).join('')
    this.bottom = pixels[pixels.length - 1].join('')
    this.left = pixels.map((r) => r[0]).join('')
  }

  findNeighbor(dir, orientationsById) {
    const oppositeDir = inverse(dir)

    for (const [id, orientations] of orientationsById) {
      if (id === this.id) {
        continue
      }

      for (const img of orientations) {
        if (img[oppositeDir] === this[dir]) {
          return img
        }
      }
    }
  }

  get(point) {
    // y index is inverted
    return this.pixels[this.pixels.length - 1 - point.y]?.[point.x]
  }

  set(point, pixel) {
    this.pixels[this.pixels.length - 1 - point.y][point.x] = pixel
  }

  *iter() {
    for (let x = 0; x < this.pixels.length; x++) {
      for (let y = 0; y < this.pixels.length; y++) {
        yield p(x, y)
      }
    }
  }

  findNeighbors(orientationsById) {
    const neighbors = new Map()

    const left = this.findNeighbor('left', orientationsById)
    if (left) neighbors.set('left', left)

    const right = this.findNeighbor('right', orientationsById)
    if (right) neighbors.set('right', right)

    const top = this.findNeighbor('top', orientationsById)
    if (top) neighbors.set('top', top)

    const bottom = this.findNeighbor('bottom', orientationsById)
    if (bottom) neighbors.set('bottom', bottom)

    return neighbors
  }

  toString() {
    return this.pixels
      .map((r, i) => {
        const y = this.pixels.length - 1 - i
        return `${y < 10 ? '0' : ''}${y} ${r
          .map((p) => {
            if (p === '.') {
              return chalk.blue('█')
            }
            if (p === '#') {
              return chalk.bgBlue.cyan('#')
            }
            if (p === 'O') {
              return chalk.green('█')
            }
            if (p === '@') {
              return chalk.red('█')
            }
            return p
          })
          .join('')}`
      })
      .reduce((acc, row /*, i*/) => {
        // const y = this.pixels.length - 1 - i
        // if (y % 10 === 0) {
        //   return [
        //     ...acc,
        //     row,
        //     `   ${this.pixels
        //       .map((_, x) => (x % 10 === 0 ? "'" : ' '))
        //       .join('')}`,
        //   ]
        // }

        return [...acc, row]
      }, [])
      .join('\n')
  }
}
