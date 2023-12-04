interface Parse
    exposes [
        strFromUtf8,
        i32,
        i32FromUtf8,
        dropLeft,
        intoTwo,
    ]
    imports []

strFromUtf8 = \bytes ->
    when Str.fromUtf8 bytes is
        Ok str -> str
        _ -> crash "unable to parse str from utf8 bytes"

i32 = \str ->
    when Str.toI32 str is
        Ok num -> num
        _ -> crash "unable to parse int: \(str)"

i32FromUtf8 = \bytes ->
    i32 (strFromUtf8 bytes)

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
