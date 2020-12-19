const Fs = require('fs')
const [rulesChunk, messagesChunk] = Fs.readFileSync('input.txt', 'utf-8').split(
  '\n\n',
)

/** @typedef {{name: string, char: string}|{name: string, options: Array<string[]>}}} Rule */

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

const matchRule = (chars, rule) => {
  if (rule.char) {
    if (chars[0] === rule.char) {
      return {
        consumed: rule.char,
      }
    }

    return
  }

  checkOptions: for (const option of rule.options) {
    let consumed = ''
    for (let i = 0; i < option.length; i++) {
      const ref = rulesByName.get(option[i])
      const match = matchRule(chars.slice(consumed.length), ref)
      if (!match) {
        continue checkOptions
      }

      consumed += match.consumed

      // if we have consumed the whole message but haven't matched the entire option then we don't actually match
      if (consumed.length >= chars.length && i < option.length - 1) {
        continue checkOptions
      }
    }

    return {
      consumed,
    }
  }

  return
}

console.log(
  messages.filter((msg) => {
    const match = matchRule(msg, rulesByName.get('0'))
    return match?.consumed === msg
  }).length,
  'messages match rule 0',
)
