export function run(input) {
  /** @type {Rule[]} */
  const rules = []

  /** @type {Map<string, Rule>} */
  const rulesByType = new Map()

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

    /**
     * @returns {number}
     */
    countCountents() {
      return this.contents.reduce(
        (acc, content) =>
          acc +
          content.count +
          content.count * rulesByType.get(content.type).countCountents(),
        0,
      )
    }
  }

  input
    .split('\n')
    .filter((l) => l.trim())
    .forEach((l) => {
      const [containerType, contentsStr] = l.split(' bags contain ')
      const rule = new Rule(containerType, contentsStr)
      rules.push(rule)
      rulesByType.set(rule.type, rule)
    })

  console.log(
    'one "shiny gold" bag contains',
    rulesByType.get('shiny gold').countCountents(),
    'bags',
  )
}
