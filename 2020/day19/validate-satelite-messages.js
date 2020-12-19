const Fs = require('fs')
const [rulesChunk, messagesChunk] = Fs.readFileSync('input.txt', 'utf-8').split(
  '\n\n',
)

/** @typedef {{name: string, char: string}|{name: string, options: Array<string[]>}} Rule */

/** @type {Rule[]} */
const rules = rulesChunk
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    let [name, rule] = l.split(': ')
    if (rule.startsWith('"')) {
      return {
        name,
        char: JSON.parse(rule),
      }
    }

    return {
      name,
      options: rule.split('|').map((ordered) => ordered.trim().split(' ')),
    }
  })

/** @type {Map<string, Rule>} */
const rulesByName = new Map(rules.map((r) => [r.name, r]))

const messages = messagesChunk.split('\n').filter((l) => l.trim())

const matchRule0 = (input) => {
  // array of parsing tasks that keep have consumed some amount of the input and
  // have some unresolved refs. When any of those refs resolve to more refs a new
  // job is created to resolve those. Once all the refs are resolved, if the entire
  // input is consumed we will return true
  const tasks = rulesByName.get('0').options.map((option) => ({
    consumed: '',
    refs: option.slice(),
  }))

  while (tasks.length) {
    const task = tasks.shift()

    const [ref, ...nextRefs] = task.refs
    const rule = rulesByName.get(ref)

    if (rule.options) {
      // substitute this ref with the options it includes, including one task for each possible path
      tasks.unshift(
        ...rule.options.map((subRefs) => ({
          consumed: task.consumed,
          refs: [...subRefs, ...nextRefs],
        })),
      )
    } else {
      // concrete rule is able to actually consume input characters
      const match = rule.char === input.charAt(task.consumed.length)

      if (!match) {
        continue
      }

      const consumed = task.consumed + rule.char
      const moreRefs = !!nextRefs.length

      if (!moreRefs) {
        if (input !== consumed) {
          continue
        }

        return true
      }

      tasks.unshift({
        consumed: task.consumed + rule.char,
        refs: nextRefs,
      })
    }
  }

  return false
}

console.log(messages.filter(matchRule0).length, 'messages match rule 0')
