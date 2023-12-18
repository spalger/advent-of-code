interface Parse
    exposes [
        strFromUtf8,
        i64,
        i64FromUtf8,
        dropStart,
        intoTwo,
        dropEnd,
        pairs,
    ]
    imports []

strFromUtf8 = \bytes ->
    when Str.fromUtf8 bytes is
        Ok str -> str
        _ -> crash "unable to parse str from utf8 bytes"

i64 = \str ->
    when Str.toI64 str is
        Ok num -> num
        _ -> crash "unable to parse int: \(str)"

i64FromUtf8 = \bytes ->
    i64 (strFromUtf8 bytes)

dropStart = \str, lead ->
    (left, right) = intoTwo str lead
    if
        left != ""
    then
        crash "expected '\(lead)' at start of string: \(str)"
    else
        right

dropEnd = \str, tail ->
    (left, right) = intoTwo str tail
    if
        right != ""
    then
        crash "expected '\(tail)' at end of string: \(str)"
    else
        left

intoTwo = \str, sep ->
    when Str.splitFirst str sep is
        Ok result -> (result.before, result.after)
        _ -> crash "separator '\(sep)' not found in string: \(str)"

pairs = \list ->
    { before, others } = List.split list 2
    when before is
        [a, b] -> List.concat [(a, b)] (pairs others)
        [] -> []
        _ -> crash "expected list to have an even length"
