app "AoC"
    packages { pf: "../../../basic-cli/src/main.roc", lib: "../../lib/main.roc" }
    imports [pf.Stdout, lib.Parse, "input.txt" as input : Str]
    provides [main] to pf

parseDraw = \draw ->
    Str.split draw ","
    |> List.map Str.trim
    |> List.walk (Dict.empty {}) \acc, cubeCount ->
        (num, color) = Parse.intoTwo cubeCount " "
        Dict.insert acc color (Parse.int num)

parseGame = \game ->
    (label, drawsStr) = Parse.intoTwo game ": "
    id =
        label
        |> Parse.dropLeft "Game "
        |> Parse.firstWord
        |> Parse.int

    draws =
        drawsStr
        |> Str.split "; "
        |> List.map parseDraw

    { id, draws }

parseGames = \str ->
    str
    |> Str.split "\n"
    |> List.map parseGame

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
        Dict.get draw color
        |> Result.withDefault 0
    |> List.max
    |> Result.withDefault 0

part1 = \str ->
    parseGames str
    |> List.keepIf \game ->
        (max game "red") <= 12
        && (max game "green") <= 13
        && (max game "blue") <= 14
    |> List.map .id
    |> List.sum

expect
    part1 example == 8

part2 = \str ->
    parseGames str
    |> List.map \game -> (max game "red") * (max game "green") * (max game "blue")
    |> List.sum

expect
    part2 example == 2286

main = Stdout.line "part1 \(Num.toStr (part1 input))\npart2 \(Num.toStr (part2 input))"
