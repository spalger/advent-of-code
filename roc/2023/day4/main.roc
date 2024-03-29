app "AoC"
    packages { pf: "../../basic-cli/src/main.roc", lib: "../../lib/main.roc" }
    imports [
        pf.Stdout,
        lib.Parse,
        "input.txt" as input : Str,
    ]
    provides [main] to pf

example =
    """
    Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
    Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
    Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
    Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
    Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
    Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
    """

parseNums = \str ->
    str
    |> Str.split " "
    |> List.map Str.trim
    |> List.dropIf Str.isEmpty
    |> List.map Parse.i64

Card : { count : Nat, winning : List i64, have : List i64 }
parseCard : Str -> Card
parseCard = \str ->
    (_, numbers) = Parse.intoTwo str ":"
    (winning, have) = Parse.intoTwo numbers "|"
    { count: 1, winning: parseNums winning, have: parseNums have }

scoreCard = \{ winning, have } ->
    set = Set.fromList winning
    List.walk have 0 \acc, num ->
        if Set.contains set num then
            if acc == 0 then 1 else acc * 2
        else
            acc

getTotalScore = \str ->
    Str.split str "\n"
    |> List.map parseCard
    |> List.map scoreCard
    |> List.sum

expect (getTotalScore example) == 13

winCount = \{ winning, have } ->
    List.countIf have \num -> List.contains winning num

incrCardCount = \cards, startAt, endBefore, count ->
    List.mapWithIndex cards \card, i ->
        if i >= startAt && i <= endBefore then
            { card & count: card.count + count }
        else
            card

getTotalCardCount = \str ->
    initialCards = Str.split str "\n" |> List.map parseCard

    initialCards
    |> List.mapWithIndex \_, i -> i
    |> List.walk initialCards \cards, i ->
        card =
            when List.get cards i is
                Ok c -> c
                _ -> crash "card index out of bounds"

        incrCardCount cards (i + 1) (i + (winCount card)) card.count
    |> List.map .count
    |> List.sum

expect (getTotalCardCount example) == 30

main = Stdout.line
    """
    part 1 \(Num.toStr (getTotalScore input))
    part 2 \(Num.toStr (getTotalCardCount input))
    """
