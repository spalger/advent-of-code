import { deepStrictEqual } from 'assert'

import { runBigIntCode } from '../lib/intcode-computer'

export function test() {
  deepStrictEqual(
    runBigIntCode(`109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99`),
    [
      109n,
      1n,
      204n,
      -1n,
      1001n,
      100n,
      1n,
      100n,
      1008n,
      100n,
      16n,
      101n,
      1006n,
      101n,
      0n,
      99n,
    ],
  )

  deepStrictEqual(runBigIntCode('1102,34915192,34915192,7,4,7,99,0'), [
    1219070632396864n,
  ])

  deepStrictEqual(runBigIntCode(`104,1125899906842624,99`), [1125899906842624n])
}
