import { performance } from 'perf_hooks'
import Path from 'path'
import Fs from 'fs'
import chalk from 'chalk'
import { getopts } from 'getopts'

const norm = (path: string) => path.split(Path.sep).join('/')
const relnorm = (path: string) => norm(Path.relative(__dirname, path))

const allDays = Fs.readdirSync(__dirname)
  .filter((n) => /^\d\d\d\d$/.test(n))
  .reduce(
    (acc: { dir: string; year: number; day: number }[], year) => [
      ...acc,
      ...Fs.readdirSync(Path.resolve(__dirname, year))
        .filter((n) => /^day\d\d$/.test(n))
        .map((day) => ({
          dir: Path.resolve(__dirname, year, day),
          year: parseInt(year, 10),
          day: parseInt(day.replace('day', ''), 10),
        })),
    ],
    [],
  )
  .sort((a, b) => a.year - b.year || a.day - b.day)

async function isSolutionModule(path: string) {
  const module = await import(path)
  return !!(
    module &&
    typeof (module.run || module.test || module.part1 || module.part2) ===
      'function'
  )
}

async function getSolutions(
  dir: string,
  solutionFilter?: string | number | undefined,
) {
  return (
    await Promise.all(
      Fs.readdirSync(dir).map(async (n) => {
        if (
          ['.js', '.ts'].includes(Path.extname(n)) &&
          (await isSolutionModule(Path.resolve(dir, n))) &&
          (typeof solutionFilter !== 'string' || n.startsWith(solutionFilter))
        ) {
          return [n]
        }

        return []
      }),
    )
  ).flat()
}

const SECOND = 1000
const MINUTE = SECOND * 60
function formatTime(ms: number): string {
  if (ms < SECOND) {
    return `${ms.toFixed(1)}ms`
  }
  if (ms < MINUTE) {
    return `${(ms / SECOND).toFixed(2)}sec`
  }
  return `${Math.floor(ms / MINUTE)}min ${formatTime(ms % MINUTE)}`
}

function exec(name: string, fn: (input?: string) => void, input?: string) {
  console.log(chalk.grey(name))
  const start = performance.now()
  fn(input)
  const end = performance.now()
  console.log(`${chalk.grey(`took ${formatTime(end - start)}`)}\n`)
}

const flags = getopts(process.argv.slice(2), {
  boolean: ['test'],
  string: ['part'],
  alias: {
    t: 'test',
    p: 'part',
  },
})

const selector = relnorm(Path.resolve(flags._[0] || '.'))
const [yearSelector, daySelector, solutionSelector] = selector
  .split('/')
  .map((input) => {
    if (!input) return undefined
    const n = parseInt(input.replace('day', ''), 10)
    return Number.isNaN(n) ? input : n
  })

const selectedDays = allDays.filter(
  ({ year, day }) =>
    (yearSelector === undefined || year === yearSelector) &&
    (daySelector === undefined || day === daySelector),
)

if (!selectedDays.length) {
  throw new Error(`${yearSelector}/${daySelector} doesn't match any days`)
}

for (const { dir, year, day } of selectedDays) {
  console.log(chalk.bgGreen.red.bold(` [${year}] day ${day}: `))

  for (const solution of await getSolutions(dir, solutionSelector)) {
    const path = Path.resolve(dir, solution)
    const { test, run, part1, part2 } = await import(path)

    // determine what we're going to do
    const tasks = []
    if (flags.test === true) {
      tasks.push('test')
    }
    if (flags.part !== '') {
      tasks.push(`part${flags.part}`)
    }
    if (!flags.test && !flags.part) {
      if (test) tasks.push('test')
      if (part1) tasks.push('part1')
      if (part2) tasks.push('part2')
      if (run) tasks.push('run')
    }

    // load the test input from file
    const testInput = Fs.existsSync(Path.resolve(dir, 'test-input.txt'))
      ? Fs.readFileSync(Path.resolve(dir, 'test-input.txt'), 'utf-8')
      : undefined
    const testInDesc = testInput ? ', test-input.txt' : ''

    // load the input from file
    const input = Fs.existsSync(Path.resolve(dir, 'input.txt'))
      ? Fs.readFileSync(Path.resolve(dir, 'input.txt'), 'utf-8')
      : undefined
    const inDesc = input ? ', input.txt' : ''

    // execute our tasks
    for (const task of tasks) {
      switch (task) {
        case 'test':
          exec(`test(${solution}${testInDesc}):`, test, testInput)
          break
        case 'part1':
          exec(`part1(${solution}${inDesc})`, part1, input)
          break
        case 'part2':
          exec(`part2(${solution}${inDesc})`, part2, input)
          break
        case 'run':
          exec(`run(${solution}${inDesc})`, run, input)
          break
        default:
          throw new Error(`unexpected task [${task}]`)
      }
    }
  }
}
