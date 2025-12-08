import { strictEqual } from 'assert'
import { bitsToInt } from '../../common/number.ts'

const HEX = {
  '0': [0, 0, 0, 0],
  '1': [0, 0, 0, 1],
  '2': [0, 0, 1, 0],
  '3': [0, 0, 1, 1],
  '4': [0, 1, 0, 0],
  '5': [0, 1, 0, 1],
  '6': [0, 1, 1, 0],
  '7': [0, 1, 1, 1],
  '8': [1, 0, 0, 0],
  '9': [1, 0, 0, 1],
  A: [1, 0, 1, 0],
  B: [1, 0, 1, 1],
  C: [1, 1, 0, 0],
  D: [1, 1, 0, 1],
  E: [1, 1, 1, 0],
  F: [1, 1, 1, 1],
}

const isHex = (char: string): char is keyof typeof HEX =>
  Object.prototype.hasOwnProperty.call(HEX, char)

class BitReader {
  static fromHex(hex: string) {
    return new BitReader(
      hex.split('').flatMap((char) => {
        if (isHex(char)) {
          return HEX[char]
        } else {
          throw new Error(`unexpected hex char ${char}`)
        }
      }),
    )
  }

  readonly bits: number[]
  cursor = 0
  constructor(bits: number[]) {
    this.bits = bits
  }

  next() {
    const bit = this.bits[this.cursor]
    this.cursor += 1
    return bit
  }

  read(n: number) {
    if (this.cursor + n > this.bits.length) {
      throw new Error(
        `unable to read ${n} bits [cursor=${this.cursor}] [bits length=${this.bits.length}]`,
      )
    }

    const val = this.bits.slice(this.cursor, this.cursor + n)
    this.cursor += n
    return val
  }

  readInt(size: number) {
    return bitsToInt(this.read(size))
  }

  readLiteral(): number {
    const bits = []
    // literal
    while (true) {
      const isLast = this.next() === 0
      bits.push(...this.read(4))
      if (isLast) {
        break
      }
    }
    return bitsToInt(bits)
  }

  readOperator() {
    const lengthType = this.next()
    return lengthType === 0
      ? this.readPacketsByLength()
      : this.readPackagesByCount()
  }

  private readPacketsByLength() {
    const length = this.readInt(15)
    const end = this.cursor + length
    const sub = []
    while (this.cursor < end) {
      sub.push(new Packet(this))
    }
    return sub
  }

  private readPackagesByCount() {
    const packetCount = this.readInt(11)
    const sub = []
    while (sub.length < packetCount) {
      sub.push(new Packet(this))
    }
    return sub
  }
}

class Packet {
  static decode(hex: string) {
    return new Packet(BitReader.fromHex(hex))
  }

  readonly bits: BitReader
  readonly version: number
  readonly type: number
  readonly value: number | Packet[]

  constructor(bits: BitReader) {
    this.bits = bits
    // read the header
    this.version = this.bits.readInt(3)
    this.type = this.bits.readInt(3)
    this.value =
      this.type === 4 ? this.bits.readLiteral() : this.bits.readOperator()
  }

  sumVersions(): number {
    return Array.isArray(this.value)
      ? this.value.reduce((acc, p) => acc + p.sumVersions(), this.version)
      : this.version
  }

  resolve(): number {
    if (typeof this.value === 'number') {
      return this.value
    }

    const values = this.value.map((p) => p.resolve())
    if (this.type === 0) {
      return values.reduce((acc, v) => acc + v)
    }
    if (this.type === 1) {
      return values.reduce((acc, v) => acc * v)
    }
    if (this.type === 2) {
      return values.reduce((acc, v) => Math.min(acc, v))
    }
    if (this.type === 3) {
      return values.reduce((acc, v) => Math.max(acc, v))
    }
    if (this.type === 5) {
      return values[0] > values[1] ? 1 : 0
    }
    if (this.type === 6) {
      return values[0] < values[1] ? 1 : 0
    }
    if (this.type === 7) {
      return values[0] === values[1] ? 1 : 0
    }

    throw new Error(
      `unable to resolve value for packet with type [${this.type}]`,
    )
  }
}

function sumVersions(packet: Packet): number {
  const sum = packet.sumVersions()
  console.log('sum of all packet versions is', sum)
  return sum
}

function resolve(packet: Packet): number {
  const num = packet.resolve()
  console.log('packet resolved to', num)
  return num
}

export function test() {
  strictEqual(sumVersions(Packet.decode(`8A004A801A8002F478`)), 16)
  strictEqual(sumVersions(Packet.decode('620080001611562C8802118E34')), 12)
  strictEqual(sumVersions(Packet.decode('C0015000016115A2E0802F182340')), 23)
  strictEqual(sumVersions(Packet.decode('A0016C880162017C3686B18A3D4780')), 31)

  strictEqual(resolve(Packet.decode('C200B40A82')), 3)
  strictEqual(resolve(Packet.decode('04005AC33890')), 54)
  strictEqual(resolve(Packet.decode('880086C3E88112')), 7)
  strictEqual(resolve(Packet.decode('CE00C43D881120')), 9)
  strictEqual(resolve(Packet.decode('D8005AC2A8F0')), 1)
  strictEqual(resolve(Packet.decode('F600BC2D8F')), 0)
  strictEqual(resolve(Packet.decode('9C005AC2F8F0')), 0)
  strictEqual(resolve(Packet.decode('9C0141080250320F1802104A08')), 1)
}

export function part1(input: string) {
  strictEqual(sumVersions(Packet.decode(input)), 860)
}

export function part2(input: string) {
  strictEqual(resolve(Packet.decode(input)), 470949537659)
}
