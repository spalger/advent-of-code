app "AoC"
    packages { pf: "../../../basic-cli/src/main.roc" }
    imports [pf.Stdout, pf.Task.{ Task }, "input.txt" as input : Str]
    provides [main] to pf

main : Task {} *
main = Stdout.line "part1 \(Num.toStr(part1 input))"

firstOrCrash = \nums ->
    when List.first nums is
        Ok first -> first
        Err ListWasEmpty -> crash "first number not found"

lastOrCrash = \nums ->
    when List.last nums is
        Ok last -> last
        Err ListWasEmpty -> crash "last number not found"

toStrOrCrash = \bytes ->
    when Str.fromUtf8 bytes is
        Ok str -> str
        Err _ -> crash "could not convert to string"

toU32OrCrash = \bytes ->
    when Str.toU32 bytes is
        Ok num -> num
        Err _ -> crash "could not convert to u32"

part1 : Str -> U32
part1 = \str ->
    str
    |> Str.split "\n" 
    |> List.map Str.toUtf8
    |> List.map \bytes ->
        List.keepIf bytes \b -> b >= '0' && b <= '9'
        |> \nums -> toStrOrCrash [firstOrCrash nums, lastOrCrash nums]
        |> toU32OrCrash
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
