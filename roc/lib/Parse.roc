interface Parse
    exposes [
        int,
        dropLeft,
        intoTwo,
    ]
    imports []

int = \str ->
    when Str.toU32 str is
        Ok num -> num
        _ -> crash "unable to parse int: \(str)"

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
