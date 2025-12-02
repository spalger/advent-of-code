export function sum(a: bigint, b: bigint): bigint {
  return a + b
}

export function getSum(ints: bigint[]): bigint {
  return ints.reduce(sum, BigInt(0))
}
