import { deepStrictEqual } from 'assert'
import { dedent, toLines } from '../../common/string'
import { toInt } from '../../common/number'

class File {
  constructor(public readonly name: string, public readonly size: number) {}
}
class Dir {
  private readonly entries = new Map<string, File | Dir>()
  constructor(public readonly name: string, public readonly parent?: Dir) {}

  private _metaCache?: { size?: number; dirs?: Dir[] }

  addDir(name: string) {
    this._metaCache = undefined
    this.entries.set(name, new Dir(name, this))
  }

  getDir(name: string) {
    const ent = this.entries.get(name)
    if (ent instanceof Dir) {
      return ent
    }
    if (ent instanceof File) {
      throw new Error('ENOTDIR')
    }
    throw new Error('ENOENT')
  }

  getParent() {
    if (!this.parent) {
      throw new Error(`directory ${this.name} has no parent`)
    }

    return this.parent
  }

  addFile(name: string, size: number) {
    this._metaCache = undefined
    this.entries.set(name, new File(name, size))
  }

  print(depth = 0): string {
    const indent = ' '.repeat(depth * 2)
    const items = Array.from(this.entries.values())
      .map((e) => {
        if (e instanceof Dir) {
          return e.print(depth + 1)
        }

        return `${indent}  - ${e.name} (file, size=${e.size})`
      })
      .join('\n')

    return `${indent}- ${this.name || '/'} (dir)\n${items}`
  }

  size(): number {
    const cache = (this._metaCache ??= {})
    return (cache.size ??= Array.from(this.entries.values()).reduce(
      (a, e) => a + (e instanceof Dir ? e.size() : e.size),
      0,
    ))
  }

  getDirsDeep(): Dir[] {
    const cache = (this._metaCache ??= {})
    return (cache.dirs ??= Array.from(this.entries.values()).flatMap((e) =>
      e instanceof Dir ? [e, ...e.getDirsDeep()] : [],
    ))
  }

  path(): string {
    return this.parent ? `${this.parent.path()}/${this.name}` : this.name
  }
}

const take = <T>(list: T[]): T => {
  const item = list.shift()
  if (item === undefined) {
    throw new Error('unable to take from an empty list')
  }
  return item
}

function mapFs(output: string) {
  const root = new Dir('')
  let pwd = root

  const lines = toLines(output)
  while (lines.length) {
    const line = take(lines)

    if (line === '$ ls') {
      while (lines[0] && !lines[0].startsWith('$')) {
        const ent = take(lines)
        if (ent.startsWith('dir ')) {
          pwd.addDir(ent.slice(4))
        } else {
          const [size, ...name] = ent.split(' ')
          pwd.addFile(name.join(' '), toInt(size))
        }
      }
      continue
    }

    if (line.startsWith('$ cd ')) {
      const target = line.slice(5)
      if (target === '..') {
        pwd = pwd.getParent()
      } else if (target === '/') {
        pwd = root
      } else {
        pwd = pwd.getDir(target)
      }
      continue
    }

    throw new Error('expected line to be a command line')
  }

  return root
}

function getSumOfDirsLte(size: number, fs: Dir) {
  return fs
    .getDirsDeep()
    .filter((d) => d.size() <= size)
    .reduce((a, d) => a + d.size(), 0)
}

function deleteOneForSpace(totalSpace: number, targetSpace: number, fs: Dir) {
  const available = totalSpace - fs.size()
  return fs
    .getDirsDeep()
    .sort((a, b) => a.size() - b.size())
    .find((d) => available + d.size() >= targetSpace)
}

export function test() {
  const fs = mapFs(dedent`
    $ cd /
    $ ls
    dir a
    14848514 b.txt
    8504156 c.dat
    dir d
    $ cd a
    $ ls
    dir e
    29116 f
    2557 g
    62596 h.lst
    $ cd e
    $ ls
    584 i
    $ cd ..
    $ cd ..
    $ cd d
    $ ls
    4060174 j
    8033020 d.log
    5626152 d.ext
    7214296 k
  `)

  deepStrictEqual(
    fs.print(),
    dedent`
      - / (dir)
        - a (dir)
          - e (dir)
            - i (file, size=584)
          - f (file, size=29116)
          - g (file, size=2557)
          - h.lst (file, size=62596)
        - b.txt (file, size=14848514)
        - c.dat (file, size=8504156)
        - d (dir)
          - j (file, size=4060174)
          - d.log (file, size=8033020)
          - d.ext (file, size=5626152)
          - k (file, size=7214296)
    `,
  )

  deepStrictEqual(getSumOfDirsLte(100_000, fs), 95437)
  deepStrictEqual(deleteOneForSpace(70000000, 30000000, fs)?.path(), '/d')
}

export function part1(input: string) {
  console.log(
    'the sum of the size all dirs <= 100_000 is',
    getSumOfDirsLte(100_000, mapFs(input)),
  )
}

export function part2(input: string) {
  const dir = deleteOneForSpace(70000000, 30000000, mapFs(input))
  if (!dir) {
    throw new Error('unable to find a directory that would clear enough space')
  }

  console.log(
    'to free up enough space, delete',
    dir.path(),
    'to clear',
    dir.size(),
  )
}
