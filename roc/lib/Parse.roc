interface Parse
    exposes [
        strFromUtf8,
        int,
        intFromUtf8,
        dropLeft,
        intoTwo,
    ]
    imports []

strFromUtf8 = \bytes ->
    when Str.fromUtf8 bytes is
        Ok str -> str
        _ -> crash "unable to parse str from utf8 bytes"

int = \str ->
    when Str.toU32 str is
        Ok num -> num
        _ -> crash "unable to parse int: \(str)"

intFromUtf8 = \bytes ->
    int (strFromUtf8 bytes)

dropLeft = \str, lead ->
    (left, right) = intoTwo str lead
    if
        left != ""
    then
        crash "expected '\(lead)' at start of string: \(str)"
    else
        right

intoTwo = \str, sep ->
    when Str.splitFirst str sep is
        Ok result -> (result.before, result.after)
        _ -> crash "separator '\(sep)' not found in string: \(str)"
