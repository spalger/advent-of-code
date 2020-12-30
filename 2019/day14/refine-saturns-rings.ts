import { strictEqual } from 'assert'

import { toLines, dedent } from '../lib/string'
import { toInt } from '../lib/number'

const TRILLION = 1_000_000_000_000

type Recipes = Map<
  string,
  {
    quantity: number
    oreCost?: number
    matCost: Array<readonly [number, string]>
  }
>

function parseRecipes(input: string) {
  const recipes: Recipes = new Map()

  for (const line of toLines(input)) {
    const [matList, quantityAndProduct] = line.split(' => ')

    const pair = (p: string) => {
      const [input, name] = p.split(' ')
      return [toInt(input), name] as const
    }

    const [quantity, name] = pair(quantityAndProduct)
    const matCost = matList.split(', ').map(pair)

    recipes.set(name, {
      quantity,
      matCost,
    })
  }

  return recipes
}

class Stock {
  private values = new Map<string, number>()
  get(mat: string) {
    return this.values.get(mat) ?? 0
  }
  add(mat: string, number: number) {
    this.values.set(mat, (this.values.get(mat) ?? 0) + number)
  }
  consume(mat: string, number: number) {
    const q = this.get(mat)
    if (mat !== 'ORE' && q < number) {
      throw new Error(`unable to consume ${number} ${mat}, only ${q} in stock`)
    }
    if (q === number) {
      this.values.delete(mat)
    } else {
      this.values.set(mat, q - number)
    }
  }
  isEmpty() {
    return this.values.size === 0
  }
}

const produce = (
  recipes: Recipes,
  stock: Stock,
  material: string,
  quantity: number,
) => {
  const recipe = recipes.get(material)
  if (!recipe) {
    throw new Error(`unknown recipe [${material}]`)
  }

  const needed = quantity - stock.get(material)
  const recipeMul = Math.ceil(needed / recipe.quantity)
  if (recipeMul <= 0) {
    return
  }

  for (const [q, mat] of recipe.matCost) {
    if (mat !== 'ORE') {
      // ensure that there is at least q * recipeMul of mat in stock
      produce(recipes, stock, mat, q * recipeMul)
    }

    // consume the q * recipeMul of mat from stock, throws if something is hayward
    stock.consume(mat, q * recipeMul)
  }

  // add the product to the stock
  stock.add(material, recipe.quantity * recipeMul)
}

function determineOreCost(recipes: Recipes, fuelCount: number) {
  const stock = new Stock()
  produce(recipes, stock, 'FUEL', fuelCount)
  return stock.get('ORE') * -1
}

function determineFuelProducedWithOre(recipes: Recipes, oreQuantity: number) {
  let min = Math.floor(oreQuantity / determineOreCost(recipes, 1))
  let max = min * 2

  while (min < max) {
    const test = min + Math.round((max - min) / 2)
    const testCost = determineOreCost(recipes, test)
    if (testCost === oreQuantity) {
      return test
    }

    if (testCost > oreQuantity) {
      max = test - 1
    } else {
      min = test + 1
    }
  }

  return Math.min(min, max)
}

export function test() {
  strictEqual(
    determineOreCost(
      parseRecipes(dedent`
        10 ORE => 10 A
        1 ORE => 1 B
        7 A, 1 B => 1 C
        7 A, 1 C => 1 D
        7 A, 1 D => 1 E
        7 A, 1 E => 1 FUEL
      `),
      1,
    ),
    31,
  )

  strictEqual(
    determineOreCost(
      parseRecipes(dedent`
        9 ORE => 2 A
        8 ORE => 3 B
        7 ORE => 5 C
        3 A, 4 B => 1 AB
        5 B, 7 C => 1 BC
        4 C, 1 A => 1 CA
        2 AB, 3 BC, 4 CA => 1 FUEL
      `),
      1,
    ),
    165,
  )

  const largeRecipes = parseRecipes(dedent`
    171 ORE => 8 CNZTR
    7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
    114 ORE => 4 BHXH
    14 VRPVC => 6 BMBT
    6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
    6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
    15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
    13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
    5 BMBT => 4 WPTQ
    189 ORE => 9 KTJDG
    1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
    12 VRPVC, 27 CNZTR => 2 XDBXC
    15 KTJDG, 12 BHXH => 5 XCVML
    3 BHXH, 2 VRPVC => 7 MZWV
    121 ORE => 7 VRPVC
    7 XCVML => 6 RJRHP
    5 BHXH, 4 VRPVC => 5 LTCX
  `)

  strictEqual(determineOreCost(largeRecipes, 1), 2210736)

  strictEqual(determineFuelProducedWithOre(largeRecipes, TRILLION), 460664)
}

export function part1(input: string) {
  console.log(
    'based on these recipies it will take',
    determineOreCost(parseRecipes(input), 1),
    'ore to preduce 1 fuel',
  )
}

export function part2(input: string) {
  console.log(
    'based on these recipies',
    TRILLION,
    'ore would be able to produce',
    determineFuelProducedWithOre(parseRecipes(input), TRILLION),
    'fuel',
  )
}
