const Fs = require('fs')

const passwords = Fs.readFileSync('./input.txt', 'utf8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
        const match = l.match(/^(\d+)-(\d+) (\w): (.+)/);
        if (!match) {
            throw new Error(`line doesn't match expected pattern: [${l}]`)
        }

        const [, min, max, letter, password] = match;
        let count = 0;
        let valid = true;

        for (const char of password) {
            if (char === letter) {
                count += 1
                if (count > +max) {
                    valid = false
                    break;
                }
            }
        }

        if (valid && count < +min) {
            valid = false
        }

        return { password, min, max, letter, valid }
    })

const valid = passwords.filter(p => p.valid)

console.log(valid.length, 'of', passwords.length, 'are valid')