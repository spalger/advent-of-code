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

function isSolutionModule(path) {
  const module = require(path)
  return (
    module &&
    (typeof module.run === 'function' ||
      typeof module.part1 === 'function' ||
      typeof module.part2 === 'function')
  )
}

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
            const inputPaths = [
              ...(Fs.existsSync(Path.resolve(dir, 'inputs'))
                ? Fs.readdirSync(Path.resolve(dir, 'inputs')).map((n) =>
                    Path.resolve(dir, 'inputs', n),
                  )
                : []),
              ...(Fs.existsSync(Path.resolve(dir, 'input.txt'))
                ? [Path.resolve(dir, 'input.txt')]
                : []),
            ]

            return {
              tests: inputPaths.filter(
                (p) =>
                  Path.basename(p).includes('test') &&
                  (!inputFilter || Path.basename(p).startsWith(inputFilter)),
              ),
              inputs: inputPaths.filter(
                (p) =>
                  !Path.basename(p).includes('test') &&
                  (!inputFilter || Path.basename(p).startsWith(inputFilter)),
              ),
            }
          },

          getSolutions: (solutionFilter) =>
            Fs.readdirSync(dir).filter(
              (n) =>
                ['.js', '.ts'].includes(Path.extname(n)) &&
                isSolutionModule(Path.resolve(dir, n)) &&
                (solutionFilter ? n.startsWith(solutionFilter) : true),
            ),
        }
      }),
    ]
  }, [])

function resolveTasks(argv) {
  const flags = getopts(argv, {
    boolean: ['test'],
    string: ['part'],
    alias: {
      i: 'input',
      t: 'test',
      p: 'part',
    },
  })

  const inputSelector =
    flags.input === true ? 'input' : flags.test === true ? 'test' : flags.input

  const partNumber = flags.part ? parseInt(flags.part, 10) : undefined

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
        partNumber,
        runTestFunction:
          partNumber === undefined &&
          (!inputSelector || inputSelector === 'test'),
        solutions: task.getSolutions(solutionSelector),
      }
    })
    .filter((task) => task.solutions.length)

  if (!tasks.length) {
    throw new Error(`selector [${selector}] doesn't match any tasks`)
  }

  return tasks
}

function readInput(path) {
  switch (Path.extname(path)) {
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

function exec(name, fn, input) {
  console.log(chalk.grey(name))
  const start = performance.now()
  fn(input)
  const end = performance.now()
  console.log(`${chalk.grey(`took ${formatTime(end - start)}`)}\n`)
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
    const { test, run, part1, part2 } = require(path)

    for (const test of task.tests) {
      exec(
        `test(${solution}, ${Path.relative(task.dir, test)}):`,
        run,
        readInput(test),
      )
    }

    if (typeof test === 'function' && task.runTestFunction) {
      exec(`test(${solution}):`, test)
    }

    for (const input of task.inputs) {
      const relinput = Path.relative(task.dir, input)
      if ((task.partNumber ?? 1) === 1 && part1) {
        exec(`${solution} part1(${relinput}):`, part1, readInput(input))
      }

      if ((task.partNumber ?? 2) === 2 && part2) {
        exec(`${solution} part2(${relinput}):`, part2, readInput(input))
      }

      if (run) {
        exec(`${solution} run(${relinput}):`, run, readInput(input))
      }
    }
  }
}
