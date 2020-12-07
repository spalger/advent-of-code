const Fs = require('fs')

class Rule {
  /**
   * @param {string} type
   * @param {string} contentsStr
   */
  constructor(type, contentsStr) {
    this.type = type
    this.contents = contentsStr
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c !== 'no other bags.')
      .map((content) => {
        const [number, ...name] = content.split(' ')
        return {
          count: parseInt(number, 10),
          type: name.slice(0, -1).join(' '),
        }
      })
  }

  /**
   * @param {string} type
   */
  canHold(type) {
    return this.contents.some((c) => c.type === type)
  }
}

/**
 * @type {Rule[]}
 */
const rules = Fs.readFileSync('./input.txt', 'utf8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    const [containerType, contentsStr] = l.split(' bags contain ')
    return new Rule(containerType, contentsStr)
  })

// start with a list of all rules that can immediately contain shiny gold bags and add rules which can contain those recursively
const matches = new Set(rules.filter((r) => r.canHold('shiny gold')))
for (const rule of matches) {
  for (const r of rules.filter((r) => r.canHold(rule.type))) {
    matches.add(r)
  }
}

console.log(matches.size, 'bags could contain a "shiny gold" bag')
