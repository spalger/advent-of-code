app "AoC"
    packages { pf: "../../../basic-cli/src/main.roc" }
    imports [pf.Stdout, pf.Task.{ Task }, "input.txt" as input : Str]
    provides [main] to pf

main : Task {} *
main = Stdout.line "part1 \(Num.toStr(part1 input))\npart2 \(Num.toStr(part2 input))"

intOrCrash = \str ->
    when Str.toU32 str is
        Ok num -> num
        _ -> crash "unable to parse int: \(str)"

parseGameId = \str ->
    when Str.split str " " is
        ["Game", id] -> intOrCrash id
        _ -> crash "unable to parse game id: \(str)"

parseDraw = \draw ->
    Str.split draw ","
    |> List.map Str.trim
    |> List.walk (Dict.empty {}) \acc, cubeCount ->
        when Str.split cubeCount " " is
            [num, color] -> Dict.insert acc color (intOrCrash num)
            _ -> crash "expected draw to be a number and color separated by a space: \(cubeCount)"

parseGames = \str ->
    str
    |> Str.split "\n" 
    |> List.map \game ->
        when Str.split game ": " is
            [label, draws] -> {
                id: parseGameId label,
                draws: Str.split draws "; " |> List.map parseDraw
            }
            _ -> crash "unable to parse game: \(game)"

example =
    """
    Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
    Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
    Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
    Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
    Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
    """

max = \game, color ->
    game.draws
    |> List.map \draw ->
        Dict.get draw color |> Result.withDefault 0
    |> List.walk 0 Num.max

sumGameIds = \games ->
    games
    |> List.walk 0 \sum, game -> sum + game.id

part1 = \str ->
    parseGames str
    |> List.keepIf \game ->
        (max game "red") <= 12 &&
        (max game "green") <= 13 &&
        (max game "blue") <= 14
    |> sumGameIds

expect
    part1 example == 8

part2 = \str ->
    parseGames str
    |> List.walk 0 \sum, game -> sum + (
        (max game "red") *
        (max game "green") *
        (max game "blue")
    )

expect
    part2 example == 2286