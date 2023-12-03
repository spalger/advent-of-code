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
    |> List.walk { red: 0, blue: 0, green: 0 } \acc, cubeCount ->
        when Str.split cubeCount " " is
            [num, "red"] -> { acc & red: acc.red + intOrCrash num }
            [num, "blue"] -> { acc & blue: acc.blue + intOrCrash num }
            [num, "green"] -> { acc & green: acc.green + intOrCrash num }
            _ -> crash "expected draw to be a number and color separated by a space: \(cubeCount)"

parseDraws = \str ->
    Str.split str ";"
    |> List.map Str.trim
    |> List.map parseDraw

parseGame = \str ->
    when Str.split str ": " is
        [label, draws] -> { id: parseGameId label, draws: parseDraws draws }
        _ -> crash "unable to parse game: \(str)"

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

expect
    parseGames example == [
        { id: 1, draws: [{ red: 4, green: 0, blue: 3 }, { red: 1, green: 2, blue: 6 }, { red: 0, green: 2, blue: 0 }] },
        { id: 2, draws: [{ red: 0, green: 2, blue: 1 }, { red: 1, green: 3, blue: 4 }, { red: 0, green: 1, blue: 1, }] },
        { id: 3, draws: [{ red: 20, green: 8, blue: 6 }, { red: 4, green: 13, blue: 5 }, { red: 1, green: 5, blue: 0 }] },
        { id: 4, draws: [{ red: 3, green: 1, blue: 6 }, { red: 6, green: 3, blue: 0 }, { red: 14, green: 3, blue: 15 }] },
        { id: 5, draws: [{ red: 6, green: 3, blue: 1 }, { red: 1, green: 2, blue: 2 }] }
    ]

maxCubes = \draws ->
    List.walk draws { red: 0, green: 0, blue: 0 } \max, draw -> {
        red: Num.max max.red draw.red,
        green: Num.max max.green draw.green,
        blue: Num.max max.blue draw.blue
    }

filterPossibleGames = \games, redLimit, greenLimit, blueLimit ->
    games
    |> List.keepIf \game ->
        max = maxCubes game.draws
        max.red <= redLimit && max.green <= greenLimit && max.blue <= blueLimit

sumGameIds = \games ->
    games
    |> List.walk 0 \sum, game -> sum + game.id

part1 = \str ->
    parseGames str
    |> filterPossibleGames 12 13 14
    |> sumGameIds

expect
    part1 example == 8

part2 = \str ->
    parseGames str
    |> List.map \game -> maxCubes game.draws
    |> List.walk 0 \sum, max -> sum + (max.red * max.green * max.blue)

expect
    part2 example == 2286