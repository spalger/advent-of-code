export function toLines(str: string) {
  return str.split('\n').filter((l) => l.trim())
}

export function dedent(
  strings: string | TemplateStringsArray,
  ...vars: unknown[]
) {
  let str = typeof strings === 'string' ? strings : strings[0]

  // append extra args to str, support for template strings with vars
  for (let i = 0; i < vars.length; i++) {
    str += vars[i] + (Array.isArray(strings) ? strings[i + 1] : '')
  }

  const lines = str.split('\n')
  const emptyLines = []
  const output = []

  const firstLineI = lines.findIndex((l) => l.trim())
  if (firstLineI === -1) {
    return ''
  }

  const indentWidth = lines[firstLineI].indexOf(lines[firstLineI].trim()[0])

  for (let i = firstLineI; i < lines.length; i++) {
    const line = lines[i].slice(indentWidth)
    if (line === '') {
      emptyLines.push(line)
    } else {
      if (emptyLines.length) {
        output.push(...emptyLines)
        emptyLines.length = 0
      }
      output.push(line)
    }
  }

  return output.join('\n')
}

export function chunk(
  str: string,
  size: number,
  options?: { allowUneven?: boolean },
): string[] {
  const len = str.length

  if (!options?.allowUneven && len % size !== 0) {
    throw new Error(
      `string with length ${len} can not be devided evenly by ${size}`,
    )
  }

  const chunks: string[] = []
  for (let i = 0; i < len; i += 4) {
    chunks.push(str.slice(i, i + size))
  }

  return chunks
}
