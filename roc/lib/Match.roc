interface Match
    exposes [
        number
    ]
    imports []

number = \char -> char >= '0' && char <= '9'