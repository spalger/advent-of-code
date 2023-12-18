app "AoC"
    packages { pf: "../../basic-cli/src/main.roc", lib: "../../lib/main.roc" }
    imports [
        pf.Stdout,
        lib.Parse,
        "input.txt" as input : Str,
    ]
    provides [main] to pf

example =
    """
    seeds: 79 14 55 13

    seed-to-soil map:
    50 98 2
    52 50 48

    soil-to-fertilizer map:
    0 15 37
    37 52 2
    39 0 15

    fertilizer-to-water map:
    49 53 8
    0 11 42
    42 0 7
    57 7 4

    water-to-light map:
    88 18 7
    18 25 70

    light-to-temperature map:
    45 77 23
    81 45 19
    68 64 13

    temperature-to-humidity map:
    0 69 1
    1 0 69

    humidity-to-location map:
    60 56 37
    56 93 4
    """

Rule : { dest: I64, src: I64, len: I64 }
Rules : List Rule

parseRules : Str -> Rules
parseRules = \str ->
    str
    |> Str.split "\n"
    |> List.map \line ->
        (a, bc) = line |> Parse.intoTwo " "
        (b, c) = bc |> Parse.intoTwo " "
        { dest: Parse.i64 a, src: Parse.i64 b, len: Parse.i64 c }

Transform : { into: Str, rules: Rules }
Transforms : Dict Str Transform

parse : Str -> { seeds: List I64, transforms: Transforms }
parse = \str ->
    (seedsStr, transformsStr) = str |> Parse.intoTwo "\n\n"
    seeds = seedsStr |> Parse.dropStart "seeds: " |> Str.split " " |> List.map Parse.i64

    transforms =
        transformsStr
        |> Str.split "\n\n"
        |> List.map \transform ->
            (name, values) = transform |> Parse.intoTwo " map:\n"
            (from, into) = name |> Parse.intoTwo "-to-"
            (from, { into, rules: parseRules (values |> Str.trim) })
        |> Dict.fromList

    { seeds, transforms }

expect
    output = parse example
    output == {
        seeds: [79, 14, 55, 13],
        transforms: Dict.fromList [
            ("seed", {
                into: "soil",
                rules: [
                    { dest: 50, src: 98, len: 2 },
                    { dest: 52, src: 50, len: 48 },
                ],
            }),
            ("soil", {
                into: "fertilizer",
                rules: [
                    { dest: 0, src: 15, len: 37 },
                    { dest: 37, src: 52, len: 2 },
                    { dest: 39, src: 0, len: 15 },
                ],
            }),
            ("fertilizer", {
                into: "water",
                rules: [
                    { dest: 49, src: 53, len: 8 },
                    { dest: 0, src: 11, len: 42 },
                    { dest: 42, src: 0, len: 7 },
                    { dest: 57, src: 7, len: 4 },
                ],
            }),
            ("water", {
                into: "light",
                rules: [
                    { dest: 88, src: 18, len: 7 },
                    { dest: 18, src: 25, len: 70 },
                ],
            }),
            ("light", {
                into: "temperature",
                rules: [
                    { dest: 45, src: 77, len: 23 },
                    { dest: 81, src: 45, len: 19 },
                    { dest: 68, src: 64, len: 13 },
                ],
            }),
            ("temperature", {
                into: "humidity",
                rules: [
                    { dest: 0, src: 69, len: 1 },
                    { dest: 1, src: 0, len: 69 },
                ],
            }),
            ("humidity", {
                into: "location",
                rules: [
                    { dest: 60, src: 56, len: 37 },
                    { dest: 56, src: 93, len: 4 },
                ],
            }),
        ],
    }

toLocation = \value, type, transforms ->
    when Dict.get transforms type is
        Ok transform ->
            newValue = 
                when (List.findFirst transform.rules \rule -> value >= rule.src && value < (rule.src + rule.len)) is
                    Ok rule -> rule.dest + (value - rule.src)
                    Err _ -> value
            if transform.into == "location"
                then newValue
                else toLocation newValue transform.into transforms
        Err _ -> crash "Unable to transform ranges of type \(type)"

expect toLocation 14 "seed" (parse example).transforms == 43
expect toLocation 79 "seed" (parse example).transforms == 82

part1 = \str ->
    { seeds, transforms } = parse str
    seeds
    |> List.map \seed -> toLocation seed "seed" transforms
    |> List.min
    |> Result.withDefault 0

Range : (I64, I64)

clamp : Range, Range -> Range
clamp = \(from, to), (min, max) ->
    (Num.max from min, Num.min to max)

expect clamp (100, 200) (150, 250) == (150, 200)
expect clamp (199, 210) (150, 250) == (199, 210)
expect clamp (100, 200) (99, 175) == (100, 175)

slice : List Range, Range -> List Range
slice = \ranges, (from, to) ->
    ranges
    |> List.keepIf \range -> range.1 > from && range.0 < to
    |> List.map \range -> clamp range (from, to)

expect
    ranges = [(0, Num.maxI64)]
    sliced = slice ranges (5, 10)
    sliced == [(5, 10)]

snip: List Range, Range -> { snipped: List Range, remains: List Range }
snip = \range, (from, to) ->
    head = slice range (0, from)
    snipped = slice range (from, to)
    tail = slice range (to, Num.maxI64)
    { snipped, remains: List.concat head tail }

expect
    ranges = [(0, 15), (100, 150)]
    { snipped, remains } = snip ranges (10, 120)
    snipped == [(10, 15), (100, 120)] && remains == [(0, 10), (120, 150)]

add: List Range, Range -> List Range
add = \ranges, (from, to) ->
    head = slice ranges (0, from)
    tail = slice ranges (to, Num.maxI64)
    (List.concat (List.append head (from, to)) tail)

expect
    ranges = [(0, 15), (100, 150)]
    sum = add ranges (50, 55)
    sum == [(0, 15), (50, 55), (100, 150)]

shift: List Range, I64 -> List Range
shift = \ranges, offset ->
    ranges |> List.map \(from, to) -> (from + offset, to + offset)

expect
    orig = [(0, 10), (10, 20)]
    shifted = shift orig 5
    shifted == [(5, 15), (15, 25)]

applyRules: List Range, Rules -> List Range
applyRules = \initial, rules ->
    withHoles = List.walk rules initial \ranges, rule ->
        (snip ranges (rule.src, (rule.src + rule.len))).remains

    List.walk rules withHoles \holy, rule ->
        { snipped } = snip initial (rule.src, (rule.src + rule.len))
        updates = shift snipped (rule.dest - rule.src)
        List.walk updates holy \updated, update ->
            add updated update

expect
    orig = [(0, 10)]
    rules = [{ src: 5, len: 2, dest: 15 }]
    applied = applyRules orig rules
    applied == [(0, 5), (7, 10), (15, 17)]

seedsToRanges : List I64 -> List Range
seedsToRanges = \seeds ->
    seeds
    |> Parse.pairs
    |> List.map \(from, len) -> (from, from + len)
    |> List.sortWith \(a, _), (b, _) -> Num.compare a b

expect seedsToRanges [0, 1, 2, 3] == [(0, 1), (2, 5)]

transformRanges : List Range, Str, Str, Transforms -> List Range
transformRanges = \ranges, from, until, transforms ->
    when Dict.get transforms from is
        Err _ -> crash "Unable to transform ranges of type \(from) into \(until)"
        Ok transform ->
            transformed = applyRules ranges transform.rules
            if transform.into == until
                then transformed
                else transformRanges transformed transform.into until transforms 

part2 = \str ->
    { seeds, transforms } = parse str
    seeds
    |> seedsToRanges
    |> transformRanges "seed" "location" transforms
    |> List.first
    |> Result.map \(from, _) -> from
    |> Result.withDefault Num.maxI64

expect
    result = part2 example
    result == 46

main = Stdout.line
    """
    part 1: \(Num.toStr (part1 input))
    part 2: \(Num.toStr (part2 input))
    """
