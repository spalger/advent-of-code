/**
 * Wrapper around map which makes it more useful for counting things. Rather than
 * a set() method it has an add() function which adds some amount to the specified
 * key, initializing that key if it doesn't exist. get() also returns the current
 * value or 0 rather than undefined
 */
export class CountMap<T> {
  public map: Map<T, number>
  constructor(initial: [T, number][] = []) {
    this.map = new Map(initial)
  }

  /**
   * Clear out the counts in the CountMap and return the previous values, useful
   * for iterating over the values and defining the values for the next phase
   */
  flush() {
    const queue = this.map
    this.map = new Map()
    return queue
  }

  /**
   * Increment the value for some key by `count`, if the key doesn't exist
   * it's value becomes `count`
   */
  add(key: T, count: number) {
    this.map.set(key, this.get(key) + count)
  }

  /**
   * Returns the current value for a key, or 0 if the key isn't defined
   */
  get(key: T): number {
    return this.map.get(key) ?? 0
  }

  /**
   * Clears the value for some key
   */
  delete(key: T) {
    this.map.delete(key)
  }

  /**
   * The number of keys in the map
   */
  get size() {
    return this.map.size
  }

  /**
   * Support iterating over the maps keys and values just like a normal map
   */
  [Symbol.iterator]() {
    return this.map[Symbol.iterator]()
  }
}
