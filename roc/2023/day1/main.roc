app "AoC"
    packages { pf: "../../basic-cli/src/main.roc" }
    imports [pf.Stdout, pf.Task.{ Task }, "input.txt" as input : Str]
    provides [main] to pf

main : Task {} *
main = Stdout.line "part1 \(Num.toStr(part1 input))\npart2 \(Num.toStr(part2 input))"

num = \bytes ->
    when bytes is
        ['0', ..] -> Match 0
        ['1', ..] -> Match 1
        ['2', ..] -> Match 2
        ['3', ..] -> Match 3
        ['4', ..] -> Match 4
        ['5', ..] -> Match 5
        ['6', ..] -> Match 6
        ['7', ..] -> Match 7
        ['8', ..] -> Match 8
        ['9', ..] -> Match 9
        _ -> None

word = \bytes ->
    when bytes is
        ['z', 'e', 'r', 'o', ..] -> Match 0
        ['o', 'n', 'e', ..] -> Match 1
        ['t', 'w', 'o', ..] -> Match 2
        ['t', 'h', 'r', 'e', 'e', ..] -> Match 3
        ['f', 'o', 'u', 'r', ..] -> Match 4
        ['f', 'i', 'v', 'e', ..] -> Match 5
        ['s', 'i', 'x', ..] -> Match 6
        ['s', 'e', 'v', 'e', 'n', ..] -> Match 7
        ['e', 'i', 'g', 'h', 't', ..] -> Match 8
        ['n', 'i', 'n', 'e', ..] -> Match 9
        _ -> None

numOrWord = \bytes ->
    when num bytes is
        Match x -> Match x
        None -> word bytes

first = \matcher, bytes ->
    when matcher bytes is
        Match x -> Match x
        None -> when bytes is
            [_, _, ..] -> first matcher (List.takeLast bytes ((List.len bytes) - 1))
            _ -> None

last = \matcher, bytes ->
    depthFirst = when bytes is
        # if there are at least two elements in bytes, recurse
        [_, _, ..]  -> last matcher (List.takeLast bytes ((List.len bytes) - 1))
        _ -> None

    when depthFirst is
        Match x -> Match x
        None -> matcher bytes

firstAndLast = \bytes, matcher ->
    a = when first matcher bytes is
        Match x -> x
        None -> crash "first number not found"

    b = when last matcher bytes is
        Match x -> x
        None -> crash "last number not found"

    nStr = "\(Num.toStr(a))\(Num.toStr(b))"
    when Str.toU32 nStr is
        Ok x -> x
        Err _ -> crash "could not convert \(nStr) to a U32"

part1 : Str -> U32
part1 = \str ->
    str
    |> Str.split "\n" 
    |> List.map Str.toUtf8
    |> List.map \bytes -> firstAndLast bytes num
    |> List.sum

example =
    """
    1abc2
    pqr3stu8vwx
    a1b2c3d4e5f
    treb7uchet
    """

expect
    Bool.isEq (part1 example) 142

expect
    Bool.isEq (part1 input) 52974

expect Bool.isEq (first numOrWord (Str.toUtf8 "123")) (Match 1)
expect Bool.isEq (first numOrWord (Str.toUtf8 "sdflksjdf0")) (Match 0)
expect Bool.isEq (first numOrWord (Str.toUtf8 "sdflskdjfthreesoiun3123j09")) (Match 3)
expect Bool.isEq (first numOrWord (Str.toUtf8 "naodfijsdf")) None
expect Bool.isEq (first numOrWord (Str.toUtf8 "")) None

expect Bool.isEq (last numOrWord (Str.toUtf8 "123")) (Match 3)
expect Bool.isEq (last numOrWord (Str.toUtf8 "sdflksjdf0")) (Match 0)
expect Bool.isEq (last numOrWord (Str.toUtf8 "sdflskdjfthreesoiun3123fourj")) (Match 4)
expect Bool.isEq (last numOrWord (Str.toUtf8 "aslkdjsodifjhn")) None
expect Bool.isEq (last numOrWord (Str.toUtf8 "")) None

part2 = \str ->
    str
    |> Str.split "\n" 
    |> List.map Str.toUtf8
    |> List.map \bytes -> firstAndLast bytes numOrWord
    |> List.sum