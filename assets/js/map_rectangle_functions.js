function createRectangleElement(P, width, height, thicknessLine, info=null)
{
    var rectangle = {
        "category": "rectangles",
        "center":
            {
                "x": P.x,
                "y": P.y
            },
        "size":
            {
                "w": width,
                "h": height
            },
        "rotation": 0.0,
        "thicknessLine": thicknessLine
    };

    if (info != null)
    {
        rectangle.info = info;
    }

    return rectangle;
}

function addRectangleElement(P, width, height, thicknessLine)
{
    var rectangle = createRectangleElement(P, width, height, thicknessLine);
    rectangles.push(rectangle);
    selectElement(rectangle);
}

function addFrame()
{
    var width = map.w;
    var height = map.h;
    var P = {
        "x": map.origin.x + width / 2,
        "y": map.origin.y + height / 2
    };
    var thicknessLine = 4;

    var rectangle = createRectangleElement(P, width, height, thicknessLine, "frame");
    rectangles.push(rectangle);
}

function copyRectangleElement(rectangle)
{
    var copiedElement = {
        "category": "rectangles",
        "center": {
            "x": rectangle.center.x,
            "y": rectangle.center.y
        },
        "size": {
            "w": rectangle.size.w,
            "h": rectangle.size.h
        },
        "rotation": rectangle.rotation,
        "thicknessLine": rectangle.thicknessLine
    }

    return copiedElement;
}

function testPointOnRectangleVerticalSides(P, rectangle)
{
    var P2 = rotateAround(P, rectangle.center, -rectangle.rotation);

    return areEqualDistancesWithTolerance(Math.abs(rectangle.center.x - P2.x), (rectangle.size.w-(coeffWidthLine*5/3*rectangle.thicknessLine))/2, rectangle.thicknessLine)
        && Math.abs(rectangle.center.y - P2.y) <= rectangle.size.h/2;
}

function testPointOnRectangleHorizontalSides(P, rectangle)
{
    var P2 = rotateAround(P, rectangle.center, -rectangle.rotation);

    return areEqualDistancesWithTolerance(Math.abs(rectangle.center.y - P2.y), (rectangle.size.h-(coeffWidthLine*5/3*rectangle.thicknessLine))/2, rectangle.thicknessLine)
        && Math.abs(rectangle.center.x - P2.x) <= rectangle.size.w/2;
}

function testPointOnRectangleSides(P, rectangle)
{
    return testPointOnRectangleVerticalSides(P, rectangle) || testPointOnRectangleHorizontalSides(P, rectangle);
}

function testPointOnRectangleNWSEDiagonal(P, rectangle)
{
    return testPointOnRectangleSpecificCorner(P, rectangle, TOP_LEFT_CORNER) || testPointOnRectangleSpecificCorner(P, rectangle, BOTTOM_RIGHT_CORNER);
}

function testPointOnRectangleNESWDiagonal(P, rectangle)
{
    return testPointOnRectangleSpecificCorner(P, rectangle, TOP_RIGHT_CORNER) || testPointOnRectangleSpecificCorner(P, rectangle, BOTTOM_LEFT_CORNER);
}

function testPointOnRectangleCorners(P, rectangle)
{
    var P2 = rotateAround(P, rectangle.center, -rectangle.rotation);
    return areEqualDistancesWithTolerance(Math.abs(rectangle.center.x - P2.x), (rectangle.size.w-rectangle.thicknessLine*5/3*coeffWidthLine)/2, rectangle.thicknessLine)
        && areEqualDistancesWithTolerance(Math.abs(rectangle.center.y - P2.y), (rectangle.size.h-rectangle.thicknessLine*5/3*coeffWidthLine)/2, rectangle.thicknessLine);
}

function testPointOnRectangleSpecificCorner(P, rectangle, corner)
{
    var P2 = rotateAround(P, rectangle.center, -rectangle.rotation);
    var coeffs = getCoeffForCorner(corner);

    return areEqualDistancesWithTolerance((P2.x - rectangle.center.x), coeffs.dxCoeff * (rectangle.size.w-rectangle.thicknessLine*5/3*coeffWidthLine)/2, rectangle.thicknessLine)
        && areEqualDistancesWithTolerance((P2.y - rectangle.center.y), coeffs.dyCoeff * (rectangle.size.h-rectangle.thicknessLine*5/3*coeffWidthLine)/2, rectangle.thicknessLine);
}

function testPointOnRectangleSpecificSide(P, rectangle, side)
{
    var P2 = rotateAround(P, rectangle.center, -rectangle.rotation);
    var coeffs = getCoeffForSide(side);

    if (coeffs.dxCoeff == 0)
    {
        return areEqualDistancesWithTolerance((P2.y - rectangle.center.y), coeffs.dyCoeff * (rectangle.size.h-rectangle.thicknessLine*5/3*coeffWidthLine) / 2, rectangle.thicknessLine);
    }
    //else dyCoeff == 0
    else
    {
        return areEqualDistancesWithTolerance((P2.x - rectangle.center.x), coeffs.dxCoeff * (rectangle.size.w-rectangle.thicknessLine*5/3*coeffWidthLine) / 2, rectangle.thicknessLine);
    }
}

function testPointOnRectangleElement(P, rectangle)
{
    return testPointOnRectangleSides(P, rectangle);
}

function testPointOnRectangleCenter(P, rectangle)
{
    var radius = coeffWidthLine * rectangle.thicknessLine * 2;
    var dist = Math.sqrt((P.x-rectangle.center.x)**2+(P.y-rectangle.center.y)**2);

    return dist <= radius + selectionDistTolerance;
}

function getRectangleResizingStartPoint(rectangle)
{
    var w = rectangle.size.w-coeffWidthLine*5/3*rectangle.thicknessLine;
    var h = rectangle.size.h-coeffWidthLine*5/3*rectangle.thicknessLine;

    var coeffs = getResizingCoeff(rectangle);
    var P = {
        'x': rectangle.center.x + coeffs.dxCoeff * w/2,
        'y': rectangle.center.y + coeffs.dyCoeff * h/2
    };

    return P;
}

function getRectangleResizingCursor(P, rectangle)
{
    var position = getRotationPosition(rectangle);
    var arrowList = ["ns-resize", "nwse-resize", "ew-resize", "nesw-resize"];
    var i;

    /* initialize i with the index of the arrow wanted when grave rotation = 0 */
    if (testPointOnRectangleNWSEDiagonal(P, rectangle))
    {
        i = 1;
    }
    else if (testPointOnRectangleNESWDiagonal(P, rectangle))
    {
        i = 3;
    }
    else if (testPointOnRectangleHorizontalSides(P, rectangle))
    {
        i = 0;
    }
    else if (testPointOnRectangleVerticalSides(P, rectangle))
    {
        i = 2;
    }

    i += position;

    // modulo to make a loop in the array
    i = i % 4;

    return arrowList[i];
}