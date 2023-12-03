interface Parse
  exposes [
    int,
    dropLeft,
    firstWord,
    intoTwo,
  ]
  imports []

int = \str ->
  when Str.toU32 str is
      Ok num -> num
      _ -> crash "unable to parse int: \(str)"

dropLeft = \str, lead ->
  if Str.startsWith str lead
  then Str.replaceFirst str lead ""
  else crash "string does not start with '\(lead)': \(str)"

firstWord = \str ->
  when Str.splitFirst str " " is
      Ok result -> result.before
      _ -> str

intoTwo = \str, sep ->
  when Str.splitFirst str sep is
      Ok result -> (result.before, result.after)
      _ -> crash "separator '\(sep)' not found in string: \(str)"
