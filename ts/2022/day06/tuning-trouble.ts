import { deepStrictEqual } from 'assert'

function isUniq(window: string) {
  return new Set(window).size === window.length
}

function findPacketPosition(stream: string, width: number) {
  let i = width
  let window = stream.slice(0, i)
  while (!isUniq(window)) {
    i += 1
    window = stream.slice(i - width, i)
  }
  return i
}

export function test() {
  deepStrictEqual(findPacketPosition('mjqjpqmgbljsphdztnvjfqwrcgsmlb', 4), 7)
  deepStrictEqual(findPacketPosition('bvwbjplbgvbhsrlpgdmjqwftvncz', 4), 5)
  deepStrictEqual(findPacketPosition('nppdvjthqldpwncqszvftbrmjlhg', 4), 6)
  deepStrictEqual(
    findPacketPosition('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', 4),
    10,
  )
  deepStrictEqual(findPacketPosition('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', 4), 11)

  deepStrictEqual(findPacketPosition('mjqjpqmgbljsphdztnvjfqwrcgsmlb', 14), 19)
  deepStrictEqual(findPacketPosition('bvwbjplbgvbhsrlpgdmjqwftvncz', 14), 23)
  deepStrictEqual(findPacketPosition('nppdvjthqldpwncqszvftbrmjlhg', 14), 23)
  deepStrictEqual(
    findPacketPosition('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', 14),
    29,
  )
  deepStrictEqual(
    findPacketPosition('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', 14),
    26,
  )
}

export function part1(input: string) {
  console.log('position of packet boundry is', findPacketPosition(input, 4))
}

export function part2(input: string) {
  console.log('position of message boundry is', findPacketPosition(input, 14))
}
