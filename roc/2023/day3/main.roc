app "AoC"
    packages { pf: "../../../basic-cli/src/main.roc", lib: "../../lib/main.roc" }
    imports [
        pf.Stdout,
        lib.Parse,
        lib.Point,
        lib.Point.{Point},
        lib.PointMap,
        lib.PointMap.{PointMap},
        lib.Match,
        "input.txt" as input : Str,
    ]
    provides [main] to pf

example =
    PointMap.fromStr
        """
        467..114..
        ...*......
        ..35..633.
        ......#...
        617*......
        .....+.58.
        ..592.....
        ......755.
        ...$.*....
        .664.598..
        """

takeNeighboringNumbers = \initialMap, origin ->
    List.walk (Point.neighbors origin) ([], initialMap) \(results, map), neighbor ->
        (toLeft, mapA) = PointMap.slurp map neighbor Match.number Point.left
        # toLeft checks the neighbor itself, so it it didn't match then end
        if List.isEmpty toLeft then
            (results, map)
        else
            (toRight, mapB) = PointMap.slurp mapA (Point.right neighbor) Match.number Point.right
            bytes = List.concat (List.reverse toLeft) toRight
            newNum = Parse.intFromUtf8 bytes
            (List.append results newNum, mapB)

expect
    map = PointMap.fromStr
        """
        ..123..
        ..4*5..
        ..678..
        """

    (numbers, filteredMap) = takeNeighboringNumbers map (3, 1)
    numbers == [123, 5, 678, 4] &&
    (filteredMap |> Dict.values |> Set.fromList |> Set.toList) == ['.', '*']

findPartNumbers = \initialMap -> 
    Dict.walk initialMap ([], initialMap) \(results, map), point, value ->
        if !(Match.number value) && value != '.'
            then
                (partNumbers, filteredMap) = takeNeighboringNumbers map point
                (List.concat results partNumbers, filteredMap)
            else
                (results, map)

expect
    (partNumbers, _) = findPartNumbers example
    partNumbers == [35, 467, 633, 617, 592, 664, 755, 598]


part1 = \str ->
    map = PointMap.fromStr str
    (partNumbers, _) = findPartNumbers map
    List.sum partNumbers

part2 = \str -> 
    map = PointMap.fromStr str
    Dict.walk map 0 \sum, point, value ->
        if value != '*'
            then sum
            else
                (partNumbers, _) = takeNeighboringNumbers map point
                if List.len partNumbers == 2
                    then
                        sum + List.product partNumbers
                    else
                        sum

main = Stdout.line
    """
    part1 \(Num.toStr (part1 input))
    part2 \(Num.toStr (part2 input))
    """