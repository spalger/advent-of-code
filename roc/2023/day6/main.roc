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
    Time:      7  15   30
    Distance:  9  40  200
    """

dist = timeHolding * (dur - timeHolding)
9 = (x * 7) + Math.sqrt((x * -1), 2)

main = Stdout.line
    """
    """
