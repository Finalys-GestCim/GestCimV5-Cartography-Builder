var graveLineThicknessCoeff = 5/3;

function getGraveMouseRotation(grave, xStart, yStart, x, y)
{
    //var center = projectPoint(grave.center);
    var opp1 = grave.center.y-yStart;
    var adj1 = grave.center.x-xStart;
    var opp2 = grave.center.y-y;
    var adj2 = grave.center.x-x;
    //console.log(opp1+' : '+adj1+' : '+opp2+' : '+adj2+' : ');

    // to avoid division by 0
    if (-1e-10 <= adj1 && adj1 <= 1e-10)
    {
        adj1 = 1e-10;
    }
    if (-1e-10 <= adj2 && adj2 <= 1e-10)
    {
        adj2 = 1e-10;
    }

    if (adj1*adj2 < 0)
    {
        return Math.atan(opp1/adj1)-Math.atan(opp2/adj2)+Math.PI;
    }
    return Math.atan(opp1/adj1)-Math.atan(opp2/adj2);
}

function testPointIntoGrave(P, grave)
{
    var P2 = rotateAround(P, grave.center, -grave.rotation);

    return grave.center.x-grave.size.w/2 <= P2.x && P2.x <= grave.center.x+grave.size.w/2
        && grave.center.y-grave.size.h/2 <= P2.y && P2.y <= grave.center.y+grave.size.h/2;
}

function testPointOnRotationArrow(P, grave)
{
    var radius = map.scale1m * 0.2;
    var center = {
        x: grave.center.x,
        y: grave.center.y - grave.size.h/2 - map.scale1m*0.75,
    };
    var P2 = rotateAround(P, grave.center, -grave.rotation);
    var dist = Math.sqrt((P2.x-center.x)*(P2.x-center.x)+(P2.y-center.y)*(P2.y-center.y));

    return dist <= radius + selectionDistTolerance;

}

function getPointedGraveTriangle(P, grave)
{
    var result = 0;
    var P = rotateAround(P, grave.center, -grave.rotation);

    var width = grave.size.w - (coeffWidthLine * graveLineThicknessCoeff);
    var height = grave.size.h - (coeffWidthLine * graveLineThicknessCoeff);

    var base = map.scale1m*1/4;

    var P1, P2, P3;

    /* test on top side triangle */
    P1 = {
        x: grave.center.x - base / 2,
        y: grave.center.y - height / 2
    };
    P2 = {
        x: grave.center.x,
        y: grave.center.y - height / 2 + base * 2/3
    };
    P3 = {
        x: grave.center.x + base / 2,
        y: grave.center.y - height / 2
    };

    if (testPointOnTriangle(P, P1, P2, P3)) {
        result = TOP_SIDE;
    }

    /* test on bottom side triangle */
    P1 = rotateAround(P1, grave.center, Math.PI);
    P2 = rotateAround(P2, grave.center, Math.PI);
    P3 = rotateAround(P3, grave.center, Math.PI);

    if (testPointOnTriangle(P, P1, P2, P3)) {
        result = BOTTOM_SIDE;
    }

    /* test on left side triangle */
    P1 = {
        x: grave.center.x - width / 2,
        y: grave.center.y - base / 2
    };
    P2 = {
        x: grave.center.x - width / 2 + base * 0.75,
        y: grave.center.y
    };
    P3 = {
        x: grave.center.x - width / 2,
        y: grave.center.y + base / 2
    };

    if (testPointOnTriangle(P, P1, P2, P3)) {
        result = LEFT_SIDE;
    }

    /* test on right side triangle */
    P1 = rotateAround(P1, grave.center, Math.PI);
    P2 = rotateAround(P2, grave.center, Math.PI);
    P3 = rotateAround(P3, grave.center, Math.PI);

    if (testPointOnTriangle(P, P1, P2, P3)) {
        result = RIGHT_SIDE;
    }

    return result;
}

function testPointOnVerticalSides(P, grave)
{
    var P2 = rotateAround(P, grave.center, -grave.rotation);

    return areEqualDistancesWithTolerance(Math.abs(grave.center.x - P2.x), (grave.size.w-(coeffWidthLine*graveLineThicknessCoeff))/2, graveLineThicknessCoeff/2)
        && Math.abs(grave.center.y - P2.y) <= grave.size.h/2;
}

function testPointOnHorizontalSides(P, grave)
{
    var P2 = rotateAround(P, grave.center, -grave.rotation);

    return areEqualDistancesWithTolerance(Math.abs(grave.center.y - P2.y), (grave.size.h-(coeffWidthLine*graveLineThicknessCoeff))/2, graveLineThicknessCoeff/2)
        && Math.abs(grave.center.x - P2.x) <= grave.size.w/2;
}

function testPointOnSides(P, grave)
{
    return testPointOnVerticalSides(P, grave) || testPointOnHorizontalSides(P, grave);
}

function testPointOnNWSEDiagonal(P, grave)
{
    return testPointOnSpecificCorner(P, grave, TOP_LEFT_CORNER) || testPointOnSpecificCorner(P, grave, BOTTOM_RIGHT_CORNER);
}

function testPointOnNESWDiagonal(P, grave)
{
    return testPointOnSpecificCorner(P, grave, TOP_RIGHT_CORNER) || testPointOnSpecificCorner(P, grave, BOTTOM_LEFT_CORNER);
}

function testPointOnCorners(P, grave)
{
    var P2 = rotateAround(P, grave.center, -grave.rotation);
    return areEqualDistancesWithTolerance(Math.abs(grave.center.x - P2.x), (grave.size.w-graveLineThicknessCoeff*coeffWidthLine)/2, graveLineThicknessCoeff/2)
        && areEqualDistancesWithTolerance(Math.abs(grave.center.y - P2.y), (grave.size.h-graveLineThicknessCoeff*coeffWidthLine)/2, graveLineThicknessCoeff/2);
}

function getCoeffForSide(side)
{
    var dxCoeff = 1;
    var dyCoeff = 1;

    if (side == TOP_SIDE)
    {
        dxCoeff = 0;
        dyCoeff = -1;
    }
    else if (side == RIGHT_SIDE)
    {
        dxCoeff = 1;
        dyCoeff = 0;
    }
    else if (side == BOTTOM_SIDE)
    {
        dxCoeff = 0;
        dyCoeff = 1;
    }
    else if (side == LEFT_SIDE)
    {
        dxCoeff = -1;
        dyCoeff = 0;
    }
    else
    {
        console.error("Parameter side is not correct");
    }

    return {dxCoeff: dxCoeff, dyCoeff: dyCoeff};
}

function getCoeffForCorner(corner)
{
    var dxCoeff = 1;
    var dyCoeff = 1;

    if (corner == TOP_LEFT_CORNER)
    {
        dxCoeff = -1;
        dyCoeff = -1;
    }
    else if (corner == TOP_RIGHT_CORNER)
    {
        dxCoeff = 1;
        dyCoeff = -1;
    }
    else if (corner == BOTTOM_RIGHT_CORNER)
    {
        dxCoeff = 1;
        dyCoeff = 1;
    }
    else if (corner == BOTTOM_LEFT_CORNER)
    {
        dxCoeff = -1;
        dyCoeff = 1;
    }
    else
    {
        console.error("Parameter corner is not correct");
    }

    return {dxCoeff: dxCoeff, dyCoeff: dyCoeff};
}

function getResizingCoeff(grave)
{
    var coeffs;
    // if resizing by a corner
    if (grave.isResizedBy <= 4)
    {
        coeffs = getCoeffForCorner(grave.isResizedBy);
    }
    // else resizing by a side
    else
    {
        coeffs = getCoeffForSide(grave.isResizedBy);
    }
    return coeffs;
}

function testPointOnSpecificCorner(P, grave, corner)
{
    var P2 = rotateAround(P, grave.center, -grave.rotation);
    var coeffs = getCoeffForCorner(corner);

    return areEqualDistancesWithTolerance((P2.x - grave.center.x), coeffs.dxCoeff * (grave.size.w-graveLineThicknessCoeff*coeffWidthLine)/2, graveLineThicknessCoeff/2)
        && areEqualDistancesWithTolerance((P2.y - grave.center.y), coeffs.dyCoeff * (grave.size.h-graveLineThicknessCoeff*coeffWidthLine)/2, graveLineThicknessCoeff/2);
}

function testPointOnSpecificSide(P, grave, side)
{
    var P2 = rotateAround(P, grave.center, -grave.rotation);
    var coeffs = getCoeffForSide(side);

    if (coeffs.dxCoeff == 0)
    {
        return areEqualDistancesWithTolerance((P2.y - grave.center.y), coeffs.dyCoeff * (grave.size.h-graveLineThicknessCoeff*coeffWidthLine)/2, graveLineThicknessCoeff/2);
    }
    //else dyCoeff == 0
    else
    {
        return areEqualDistancesWithTolerance((P2.x - grave.center.x), coeffs.dxCoeff * (grave.size.w-graveLineThicknessCoeff*coeffWidthLine)/2, graveLineThicknessCoeff/2);
    }
}

function getRotationPosition(grave)
{
    var position = 0;
    var angle;
    if (grave.rotation >= 0)
    {
        angle = grave.rotation % Math.PI; // modulo PI because for the rotation position it is the same
    }
    else
    {
        angle = (((grave.rotation % Math.PI) + Math.PI) % Math.PI);
    }

    if ((0 <= angle && angle <= (Math.PI/8)) || ((7*Math.PI/8) <= angle && angle <= (Math.PI)))
    {
        position = VERTICAL;
    }
    else if ((Math.PI/8) <= angle && angle <= (3*Math.PI/8))
    {
        position = NWSE_DIAGONAL;
    }
    else if ((3*Math.PI/8) <= angle && angle <= (5*Math.PI/8))
    {
        position = HORIZONTAL;
    }
    else if ((5*Math.PI/8) <= angle && angle <= (7*Math.PI/8))
    {
        position = NESW_DIAGONAL;
    }
    else
    {
        console.error("It is strange, the angle should be between 0 and pi");
    }
    return position;
}

function getGraveResizingCursor(P, grave)
{
    var position = getRotationPosition(grave);
    var arrowList = ["ns-resize", "nwse-resize", "ew-resize", "nesw-resize"];
    var i;

    /* initialize i with the index of the arrow wanted when grave rotation = 0 */
    if (testPointOnNWSEDiagonal(P, grave))
    {
        i = 1;
    }
    else if (testPointOnNESWDiagonal(P, grave))
    {
        i = 3;
    }
    else if (testPointOnHorizontalSides(P, grave))
    {
        i = 0;
    }
    else if (testPointOnVerticalSides(P, grave))
    {
        i = 2;
    }

    i += position;

    // modulo to make a loop in the array
    i = i % 4;

    return arrowList[i];
}

function getResizingStartPoint(grave)
{
    var w = grave.size.w-coeffWidthLine*graveLineThicknessCoeff;
    var h = grave.size.h-coeffWidthLine*graveLineThicknessCoeff;

    var coeffs = getResizingCoeff(grave);
    var P = {
        'x': grave.center.x + coeffs.dxCoeff * w/2,
        'y': grave.center.y + coeffs.dyCoeff * h/2
    };

    return P;
}

function copyGrave(grave)
{
    var copiedGrave = {
        "category" : "graves",
        "number": grave.number,
        "center":
            {
                "x": grave.center.x,
                "y": grave.center.y
            },
        "rotation": grave.rotation,
        "size":
            {
                "w": grave.size.w,
                "h": grave.size.h
            },
        "direction": grave.direction,
        "color": grave.color,
        "isOssuary": grave.isOssuary
    }

    return copiedGrave;
}

// the coordinates of P must be in the canvas coordinates
function getPointedColor(P) {
    var color = null;
    var colors = [NO_COLOR, YELLOW, RED, RED_YELLOW];
    var width = 40;
    var height = 40;

    for (var i = 0; i < colors.length; i++)
    {
        var C =  {
            x: mapCtx.canvas.width - 30,
            y: 50 * (i+1)
        };

        if (testPointOnRectangle(P, C, width, height))
        {
            color = colors[i];
            break;
        }
    }

    return color;
}