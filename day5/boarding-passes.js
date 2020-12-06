const Fs = require('fs')

class Options {
    constructor(length) {
        this.options = ' '.repeat(length).split('').map((_, i) => i)
    }

    left() {
        this.options = this.options.slice(0, this.options.length / 2)
    }

    right() {
        this.options = this.options.slice(this.options.length / 2)
    }

    final() {
        if (this.options.length !== 1) {
            throw new Error(`failed to parse, remaining options: ${row.options}`)
        }
        return this.options[0]
    }
}

const boardingPasses = Fs.readFileSync('./input.txt', 'utf-8').split('\n').filter(l => l.trim()).map(code => {
    const rows = new Options(128)
    for (const char of code.slice(0, 7)) {
        if (char === 'F') {
            rows.left()
        } else {
            rows.right()
        }
    }

    const cols = new Options(8)
    for (const char of code.slice(7)) {
        if (char === 'L') {
            cols.left()
        } else {
            cols.right()
        }
    }
    
    const row = rows.final()
    const col = cols.final()
    const id = (row * 8) + col
    return { id, row, col }
})

console.log('highest seat id is', boardingPasses.reduce((acc, b) => Math.max(acc, b.id), -Infinity))

