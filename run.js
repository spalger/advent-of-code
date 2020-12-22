/* eslint-disable @typescript-eslint/no-var-requires */

const { performance } = require('perf_hooks')
const Path = require('path')
const Fs = require('fs')
const chalk = require('chalk')
const getopts = require('getopts')

const SECOND = 1000
const MINUTE = SECOND * 60

const norm = (path) => path.split(Path.sep).join('/')
const relnorm = (path) => norm(Path.relative(__dirname, path))

require('@babel/register')({
  configFile: Path.resolve(__dirname, 'babel.config.js'),
  extensions: ['.js', '.ts'],
  cache: true,
})

const allTasks = Fs.readdirSync(__dirname)
  .filter((n) => /^\d\d\d\d$/.test(n))
  .reduce((tasks, year) => {
    return [
      ...tasks,
      ...Fs.readdirSync(Path.resolve(__dirname, year)).map((day) => {
        const dir = Path.resolve(__dirname, year, day)
        return {
          dir,
          year,
          day,

          getInputs: (inputFilter) => {
            const inputNames = Fs.readdirSync(
              Path.resolve(dir, 'inputs'),
            ).filter((i) => (inputFilter ? i.startsWith(inputFilter) : true))

            return {
              tests: inputNames.filter((n) => n.includes('test')),
              inputs: inputNames.filter((n) => !n.includes('test')),
            }
          },

          getSolutions: (solutionFilter) =>
            Fs.readdirSync(dir).filter(
              (n) =>
                ['.js', '.ts'].includes(Path.extname(n)) &&
                typeof require(Path.resolve(dir, n)).run === 'function' &&
                (solutionFilter ? n.startsWith(solutionFilter) : true),
            ),
        }
      }),
    ]
  }, [])

function resolveTasks(argv) {
  const flags = getopts(argv, {
    boolean: ['test'],
    alias: {
      i: 'input',
      t: 'test',
    },
  })

  const inputSelector =
    flags.input === true ? 'input' : flags.test === true ? 'test' : flags.input

  const selector = relnorm(Path.resolve(flags._[0] || '.'))
  const [yearSelector, daySelector, solutionSelector] = selector.split('/')

  const tasks = allTasks
    .filter(
      (task) =>
        (!yearSelector || task.year === yearSelector) &&
        (!daySelector || task.day === daySelector),
    )
    .map((task) => {
      return {
        ...task,
        ...task.getInputs(inputSelector),
        runTestFunction: !inputSelector || inputSelector === 'test',
        solutions: task.getSolutions(solutionSelector),
      }
    })
    .filter((task) => task.solutions.length)

  if (!tasks.length) {
    throw new Error(`selector [${selector}] doesn't match any tasks`)
  }

  return tasks
}

function readInput(dir, name) {
  const path = Path.resolve(dir, 'inputs', name)
  switch (Path.extname(name)) {
    case '.txt':
      return Fs.readFileSync(path, 'utf-8')
    case '.js':
    case '.ts': {
      return require(path).input
    }
  }
}

function formatTime(ms) {
  if (ms < SECOND) {
    return `${ms.toFixed(1)}ms`
  }
  if (ms < MINUTE) {
    return `${(ms / SECOND).toFixed(2)}sec`
  }
  return `${Math.floor(ms / MINUTE)}min ${formatTime(ms % MINUTE)}`
}

function exec(fn, input) {
  const start = performance.now()
  fn(input)
  const end = performance.now()
  console.log(chalk.grey(`took ${formatTime(end - start)}`))
}

const tasks = resolveTasks(process.argv.slice(2))

for (const task of tasks) {
  if (tasks.length > 1) {
    console.log(
      `${chalk.bgRed.green(task.year)}/${chalk.bgGreen.red(task.day)}:`,
    )
  }

  for (const solution of task.solutions) {
    const path = Path.resolve(task.dir, solution)
    const { test, run } = require(path)

    for (const test of task.tests) {
      console.log(chalk.grey(`test(${solution}, ${test}):`))
      exec(run, readInput(task.dir, test))
      console.log()
    }

    if (typeof test === 'function' && task.runTestFunction) {
      console.log(chalk.grey(`test(${solution}):`))
      exec(test)
      console.log()
    }

    for (const input of task.inputs) {
      console.log(chalk.grey(`run(${solution}, ${input}):`))
      exec(run, readInput(task.dir, input))
      console.log()
    }
  }
}
