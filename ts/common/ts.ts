export type ElementType<T> = T extends ReadonlyArray<infer U>
  ? ElementType<U>
  : T
