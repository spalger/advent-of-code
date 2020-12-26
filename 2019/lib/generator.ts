// @ts-expect-error no types available
import permute from 'johnson-trotter'

interface JohnsonTrotterIterator<T> {
  hasNext(): boolean
  next(): T[]
  reset(): undefined
}

export function* iterCombinations(...numbers: number[]) {
  const iter: JohnsonTrotterIterator<number> = permute(numbers)
  while (iter.hasNext()) {
    yield iter.next()
  }
}
