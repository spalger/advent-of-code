const Fs = require('fs')

const FOUR_DIGITS_RE = /^\d{4}$/
const NINE_DIGITS_RE = /^\d{9}$/
const HEIGHT_RE = /^(\d+)(cm|in)$/
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/

const parseYear = (year) => {
  if (typeof year !== 'string' || !FOUR_DIGITS_RE.test(year)) {
    return
  }

  return parseInt(year, 10)
}

class Passport {
  byr = undefined // Birth Year
  iyr = undefined // Issue Year
  eyr = undefined // Expiration Year
  hgt = undefined // Height
  hcl = undefined // Hair Color
  ecl = undefined // Eye Color
  pid = undefined // Passport ID
  cid = undefined // Country ID

  isValidBirthYear() {
    const year = parseYear(this.byr)
    return typeof year === 'number' && year >= 1920 && year <= 2002
  }

  isValidIssueYear() {
    const year = parseYear(this.iyr)
    return typeof year === 'number' && year >= 2010 && year <= 2020
  }

  isValidExpirationYear() {
    const year = parseYear(this.eyr)
    return typeof year === 'number' && year >= 2020 && year <= 2030
  }

  isValidHeight() {
    const match = typeof this.hgt === 'string' && this.hgt.match(HEIGHT_RE)
    if (!match) {
      return false
    }

    const [, num, unit] = match
    const size = parseInt(num, 10)
    if (unit === 'cm') {
      return size >= 150 && size <= 193
    }
    if (unit === 'in') {
      return size >= 59 && size <= 76
    }
    return false
  }

  isValidHairColor() {
    return typeof this.hcl === 'string' && HEX_COLOR_RE.test(this.hcl)
  }

  isValidEyeColor() {
    return ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].includes(this.ecl)
  }

  isValidPassportId() {
    return typeof this.pid === 'string' && NINE_DIGITS_RE.test(this.pid)
  }

  isValid() {
    return (
      this.isValidBirthYear() &&
      this.isValidIssueYear() &&
      this.isValidExpirationYear() &&
      this.isValidHeight() &&
      this.isValidHairColor() &&
      this.isValidEyeColor() &&
      this.isValidPassportId()
    )
  }
}

const passports = Fs.readFileSync('./input.txt', 'utf-8')
  .split('\n')
  .reduce(
    (acc, l) => {
      if (l.trim() === '') {
        // end of passport data, inject new pending passport
        return [new Passport(), ...acc]
      }

      // parse fields and assign them to the incomplete passport at the top of acc
      Object.assign(
        acc[0],
        Object.fromEntries(l.split(' ').map((p) => p.split(':'))),
      )
      return acc
    },
    [new Passport()],
  )

const valid = passports.filter((p) => p.isValid())

console.log('there are', valid.length, 'valid passports')
