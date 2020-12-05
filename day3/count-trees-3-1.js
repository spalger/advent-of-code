const Fs = require('fs')
const map = Fs.readFileSync('./input.txt', 'utf-8').split('\n').filter(l => l.trim()).map(l => l.split('').filter(c => c.trim()).map(c => c === '#' ? 'tree' : undefined))
const mapHeight = map.length
const mapWidth = map[0].length

const isTree = (x, y) => {
    if (y >= mapHeight) {
        throw new RangeError(`map does not extend to row ${y}`)
    }
    return map[y][x % mapWidth] === 'tree'
}

let treeCount = 0;
for (let x = 0, y = 0; y < mapHeight; x += 3, y += 1) {
    treeCount += isTree(x, y) ? 1 : 0
}

console.log('going right 3, down 1, would lead to encountering', treeCount, 'trees');