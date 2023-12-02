import { strictEqual } from 'assert'

const getKey = (subject: number, loopSize: number) => {
  let key = 1
  for (let i = 0; i < loopSize; i++) {
    key = (key * subject) % 20201227
  }
  return key
}

const findLoopSize = (subject: number, key: number) => {
  for (let found = 1, size = 1; ; size++) {
    found = (found * subject) % 20201227
    if (found === key) {
      return size
    }
  }
}

const crackEncryption = (publicKeyA: number, publicKeyB: number) => {
  const loopSizeA = findLoopSize(7, publicKeyA)
  return getKey(publicKeyB, loopSizeA)
}

export function test() {
  const cardPublicKey = 5764801
  const doorPublicKey = 17807724

  strictEqual(crackEncryption(cardPublicKey, doorPublicKey), 14897079)
  strictEqual(crackEncryption(doorPublicKey, cardPublicKey), 14897079)
}

export function part1() {
  const cardPublicKey = 11239946
  const doorPublicKey = 10464955

  console.log(
    'encryption key is',
    crackEncryption(doorPublicKey, cardPublicKey),
  )
}
