/* eslint-disable @typescript-eslint/no-var-requires */

const { performance } = require('perf_hooks')
const Path = require('path')
const Fs = require('fs')
const chalk = require('chalk')
const getopts = require('getopts')

const norm = (path) => path.split(Path.sep).join('/')
const relnorm = (path) => norm(Path.relative(__dirname, path))

require('@babel/register')({
  cwd: __dirname,
  extensions: ['.js', '.ts'],
  cache: true,
  babelrc: false,
})

const allDays = Fs.readdirSync(__dirname)
  .filter((n) => /^\d\d\d\d$/.test(n))
  .reduce(
    (acc, year) => [
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

function isSolutionModule(path) {
  const module = require(path)
  return (
    module &&
    typeof (module.run || module.test || module.part1 || module.part2) ===
      'function'
  )
}

function getSolutions(dir, solutionFilter) {
  return Fs.readdirSync(dir).filter(
    (n) =>
      ['.js', '.ts'].includes(Path.extname(n)) &&
      isSolutionModule(Path.resolve(dir, n)) &&
      (solutionFilter ? n.startsWith(solutionFilter) : true),
  )
}

const SECOND = 1000
const MINUTE = SECOND * 60
function formatTime(ms) {
  if (ms < SECOND) {
    return `${ms.toFixed(1)}ms`
  }
  if (ms < MINUTE) {
    return `${(ms / SECOND).toFixed(2)}sec`
  }
  return `${Math.floor(ms / MINUTE)}min ${formatTime(ms % MINUTE)}`
}

function exec(name, fn, input) {
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
  console.log(chalk.bgGreen.red(` [${year}] day ${day}: `))

  for (const solution of getSolutions(dir, solutionSelector)) {
    const path = Path.resolve(dir, solution)
    const { test, run, part1, part2 } = require(path)

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

    // load the input from file
    const input = Fs.existsSync(Path.resolve(dir, 'input.txt'))
      ? Fs.readFileSync(Path.resolve(dir, 'input.txt'), 'utf-8')
      : undefined
    const inDesc = input ? ', input.txt' : ''

    // execute our tasks
    for (const task of tasks) {
      switch (task) {
        case 'test':
          exec(`test(${solution}):`, test)
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
