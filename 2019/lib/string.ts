export function lines(str: string) {
  return str
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}
