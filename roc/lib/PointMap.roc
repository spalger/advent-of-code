interface PointMap
    exposes [
        fromStr,
        PointMap,
        slurp
    ]
    imports [Point, Point.{ Point }, Match]

PointMap : Dict Point U8

# parser a PointMap from a string
fromStr : Str -> PointMap
fromStr = \str ->
    str
    |> Str.split "\n"
    |> List.mapWithIndex \line, y -> ((Num.toi64 y), line)
    |> List.joinMap \(y, line) ->
        line
        |> Str.toUtf8
        |> List.mapWithIndex \char, x -> (((Num.toi64 x), y), char)
    |> Dict.fromList

expect
    """
    abc
    123
    """
    |> fromStr
    |> Bool.isEq (Dict.fromList [
        ((0, 0), 'a'),
        ((1, 0), 'b'),
        ((2, 0), 'c'),
        ((0, 1), '1'),
        ((1, 1), '2'),
        ((2, 1), '3')
    ])


# take values from the target point, moving in the direction
# continuing as long as the values match the matcher
slurp = \map, target, matcher, next ->
    when Dict.get map target is
        Ok value ->
            if matcher value
                then 
                    (rest, mapWithout) = slurp (Dict.remove map target) (next target) matcher next
                    (List.prepend rest value, mapWithout)
                else ([], map)
        _ -> ([], map)

expect
    map = fromStr
        """
        ......
        ..123.
        ..456.
        """

    (nums, filteredMap) = slurp map (4, 1) Match.number Point.left
    expectedMap = map
        |> Dict.remove (4,1)
        |> Dict.remove (3,1)
        |> Dict.remove (2,1)

    nums == ['3', '2', '1'] && filteredMap == expectedMap

expect
    map = fromStr
        """
        ......
        ..123.
        ..456.
        """

    (nums, filteredMap) = slurp map (2, 2) Match.number Point.right
    expectedMap = map
        |> Dict.remove (2,2)
        |> Dict.remove (3,2)
        |> Dict.remove (4,2)

    nums == ['4', '5', '6'] && filteredMap == expectedMap