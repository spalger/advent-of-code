interface Point
    exposes [
        Point,
        neighbors,
        add,
        top,
        topRight,
        right,
        bottomRight,
        bottom,
        bottomLeft,
        left,
        topLeft,
    ]
    imports []

Point : (I32, I32)

neighbors : Point -> List Point
neighbors = \p -> [
    top p,
    topRight p,
    right p,
    bottomRight p,
    bottom p,
    bottomLeft p,
    left p,
    topLeft p,
]

add : Point, Point -> Point
add = \(x1, y1), (x2, y2) -> (x1 + x2, y1 + y2)

top : Point -> Point
top = \p -> add p (0, -1)

topRight: Point -> Point
topRight = \p -> add p (1, -1)

right : Point -> Point
right = \p -> add p (1, 0)

bottomRight : Point -> Point
bottomRight = \p -> add p (1, 1)

bottom : Point -> Point
bottom = \p -> add p (0, 1)

bottomLeft : Point -> Point
bottomLeft = \p -> add p (-1, 1)

left : Point -> Point
left = \p -> add p (-1, 0)

topLeft : Point -> Point
topLeft = \p -> add p (-1, -1)