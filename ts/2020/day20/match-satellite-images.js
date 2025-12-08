import { p } from './point.js'
import { Image } from './image.js'

export function run(input) {
  const images = input
    .split('\n\n')
    .filter((i) => i.trim())
    .map((d) => Image.fromInput(d))

  const rotate = (img) => {
    const w = img.pixels.length - 1
    return new Image(
      img.id,
      img.pixels.map((r, y) => r.map((_, x) => img.pixels[w - x][y])),
    )
  }

  const flipH = (img) =>
    new Image(
      img.id,
      img.pixels.map((r) => r.slice().reverse()),
    )

  const flipV = (img) => new Image(img.id, img.pixels.slice().reverse())

  const getAllOrientations = (img) => {
    const orientations = []
    for (let i = 0, source = img; i < 4; i++, source = rotate(source)) {
      source.desc = `${img.id} ${i * 90} degrees`
      const flippedH = flipH(source)
      flippedH.desc = `${source.desc} flipH`
      const flippedV = flipV(source)
      flippedV.desc = `${source.desc} flipV`
      orientations.push(source, flippedH, flippedV)
    }
    return orientations
  }

  const allOrientations = new Map()
  for (const img of images) {
    allOrientations.set(img.id, getAllOrientations(img))
  }

  let corner = images.find(
    (img) => img.findNeighbors(allOrientations).size === 2,
  )

  /** @type {Map<Point,Image>} */
  const map = new Map()

  const unmappedImages = new Map(allOrientations)
  map.set(p(0, 0), corner)
  unmappedImages.delete(corner.id)

  // fill in the map with the neighbors discovered by traversing from the first corner
  const queue = [p(0, 0)]
  while (queue.length) {
    const point = queue.shift()
    const img = map.get(point)

    for (const [nDir, nImg] of img.findNeighbors(unmappedImages)) {
      const nPoint = point[nDir]()
      unmappedImages.delete(nImg.id)
      map.set(nPoint, nImg)
      queue.push(nPoint)
    }
  }

  // shift the map so that x and y values are all positive
  const farCorner = Array.from(map.keys()).reduce((max, p) =>
    max.abs().isLarger(p.abs()) ? max : p,
  )
  const absMap = new Map()
  for (const [point, image] of map) {
    absMap.set(
      p(
        farCorner.x < 0 ? point.x - farCorner.x : point.x,
        farCorner.y < 0 ? point.y - farCorner.y : point.y,
      ),
      image,
    )
  }

  // write the pixel data from the map to the composite, one row at a time
  const compositePixels = []
  // width of the pixels we pull from each image, two less than width of pixel
  // data because we exclude the borders
  const imagePixelWidth = images[0].pixels.length - 2
  // width/height of composite in pixels
  const width = imagePixelWidth * Math.sqrt(images.length)

  for (let y = width - 1; y >= 0; y--) {
    const row = []

    for (let x = 0; x < width; x++) {
      const imgPoint = p(
        Math.floor(x / imagePixelWidth),
        Math.floor(y / imagePixelWidth),
      )
      const img = absMap.get(imgPoint)

      // add 1 to x and y to skip the border row/column
      const pixelPoint = p((x % imagePixelWidth) + 1, (y % imagePixelWidth) + 1)
      row.push(img.get(pixelPoint))
    }

    compositePixels.push(row)
  }

  const seaMonsterOffsets = [
    p(0, 1),
    p(1, 0),
    p(4, 0),
    p(5, 1),
    p(6, 1),
    p(7, 0),
    p(10, 0),
    p(11, 1),
    p(12, 1),
    p(13, 0),
    p(16, 0),
    p(17, 1),
    p(18, 1),
    p(18, 2),
    p(19, 1),
  ]

  const highlightSeaMonsters = (src) => {
    const img = new Image(
      null,
      src.pixels.map((r) => r.slice()),
    )
    const width = img.pixels.length
    let count = 0

    // iterate from y 3-less than the max to try and find a sea monster
    for (let y = width - 3; y >= 0; y--) {
      xLoop: for (let x = 0; x < width; x++) {
        const origin = p(x, y)

        // detect the sea monster by checking each offset for a #
        for (const offset of seaMonsterOffsets) {
          const p = origin.add(offset)
          if (img.get(p) !== '#') {
            // if any offset is not a # then abort the loop and move onto the next origin
            continue xLoop
          }
        }

        // count the found monsters
        count += 1
        // highlight the monster by changing each pixel to O
        for (const offset of seaMonsterOffsets) {
          img.set(origin.add(offset), 'O')
        }
      }
    }

    if (count > 0) {
      return img
    }
  }

  let composite = new Image('composite', compositePixels)

  for (const img of getAllOrientations(composite)) {
    const highlighted = highlightSeaMonsters(img)
    if (highlighted) {
      console.log('found sea monsters\n')
      console.log(highlighted.toString())
      console.log()
      let waveCount = 0
      for (let p of highlighted.iter()) {
        if (highlighted.get(p) === '#') {
          waveCount++
        }
      }
      console.log('there are', waveCount, 'waves in the water')
      console.log('\n\n')
      break
    }
  }
}
