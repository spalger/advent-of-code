import { strictEqual, deepStrictEqual } from 'assert'

const parse = (cupStr: string) => cupStr.split('').map((n) => parseInt(n, 10))

const print = (cup1: Cup) => {
  let str = ''

  for (let cursor = cup1.next; cursor.n !== 1; cursor = cursor.next) {
    str += cursor.n
  }

  return str
}

const twoAfter1 = (cup1: Cup) => {
  return [cup1.next.n, cup1.next.next.n]
}

class Cup {
  public next!: Cup
  constructor(public readonly n: number) {}
}

function playCupGame(
  numbers: number[],
  rounds: number,
  totalCups: number = numbers.length,
) {
  // setup a linked list of the cups, and a map that indexes them by their number
  const map = new Map<number, Cup>()
  let tail: Cup
  for (let i = 0; i < totalCups; i++) {
    const n = i < numbers.length ? numbers[i] : i + 1
    const cup = new Cup(n)
    map.set(n, cup)
    if (tail!) {
      tail.next = cup
    }
    tail = cup
  }

  // complete the circle
  const head = map.get(numbers[0])!
  tail!.next = head

  // speed up finding the max by collecting the top four cup values
  const top4 =
    totalCups > numbers.length + 4
      ? [
          map.get(totalCups)!,
          map.get(totalCups - 1)!,
          map.get(totalCups - 2)!,
          map.get(totalCups - 3)!,
        ]
      : numbers
          .slice()
          .sort((a, b) => b - a)
          .slice(0, 4)
          .map((n) => map.get(n)!)

  for (
    let round = 0, current = head;
    round < rounds;
    round++, current = current.next
  ) {
    const pickedUp = [current.next, current.next.next, current.next.next.next]
    current.next = pickedUp[2].next

    let dest = map.get(current.n - 1)!
    while (dest && pickedUp.includes(dest)) {
      dest = map.get(dest.n - 1)!
    }
    dest = dest ?? top4.find((t) => !pickedUp.includes(t))!

    const spliceEnd = dest.next
    dest.next = pickedUp[0]
    pickedUp[2].next = spliceEnd
  }

  return map.get(1)!
}

export function test() {
  strictEqual(print(playCupGame(parse('389125467'), 10)), '92658374')
  strictEqual(print(playCupGame(parse('389125467'), 100)), '67384529')

  deepStrictEqual(
    twoAfter1(playCupGame(parse('389125467'), 10_000_000, 1_000_000)),
    [934001, 159792],
  )
}

export function part1() {
  console.log(
    'after 100 rounds the cups after 1 are in order',
    print(playCupGame(parse('523764819'), 100)),
  )
}

export function part2() {
  const [a, b] = twoAfter1(
    playCupGame(parse('523764819'), 10_000_000, 1_000_000),
  )

  console.log(
    'after 10M rounds the two numbers after 1 are',
    a,
    'and',
    b,
    'product =',
    a * b,
  )
}
