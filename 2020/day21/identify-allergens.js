const Fs = require('fs')

const countItems = (arrays) => {
  const counts = new Map()

  for (const array of arrays) {
    for (const item of new Set(array)) {
      counts.set(item, (counts.get(item) ?? 0) + 1)
    }
  }

  return counts
}

const filterKeys = (map, test) => {
  const result = []
  for (const [key, value] of map) {
    if (test(key, value)) {
      result.push(key)
    }
  }
  return result
}

const union = (arrays) => {
  return filterKeys(countItems(arrays), (_, value) => value === arrays.length)
}

const recipes = Fs.readFileSync('input.txt', 'utf-8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    const [ingList, allgList] = l
      .split(/[()]/)
      .map((c) => c.trim())
      .filter(Boolean)

    const ingredients = ingList.split(' ').map((ing) => ing.trim())
    const allergens = allgList
      ?.split(/[, ]/)
      .map((allg) => allg.trim())
      .filter((allg) => allg && allg !== 'contains')

    return { ingredients, allergens }
  })

const allergenSources = new Map()
const unidentifiedAllergens = new Map()

// init unidentifiedAllergens with the recipes which contain each allergen
for (const r of recipes) {
  for (const a of r.allergens) {
    const state = unidentifiedAllergens.get(a)
    if (!state) {
      unidentifiedAllergens.set(a, { recipes: [r] })
    } else {
      state.recipes.push(r)
    }
  }
}

while (unidentifiedAllergens.size) {
  for (const [allergen, state] of unidentifiedAllergens) {
    if (!state.options) {
      // init options to the ingredients that are in every recipe
      state.options = union(state.recipes.map((r) => r.ingredients))
    }

    if (allergenSources.size) {
      // filter ingredient options which have already been identified
      state.options = state.options.filter((ing) => !allergenSources.has(ing))
    }

    if (state.options.length === 0) {
      throw new Error(`alergen ${allergen} has had it's options reduced to 0`)
    }

    if (state.options.length === 1) {
      allergenSources.set(state.options[0], allergen)
      unidentifiedAllergens.delete(allergen)
    }
  }
}

console.log('allergenSources', allergenSources)

let sum = 0
for (const [ing, count] of countItems(recipes.map((r) => r.ingredients))) {
  if (!allergenSources.has(ing)) {
    sum += count
  }
}

console.log(
  'all non-allergen ingredients are found in the recipes',
  sum,
  'times',
)
