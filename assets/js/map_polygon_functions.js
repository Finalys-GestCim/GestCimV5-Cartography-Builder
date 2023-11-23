function getProjectedPointOnLine(P, S1, S2) {
    const epsilon = 1e-10;

    var vect_S1P = getVector(S1, P);
    var vect_S1S2 = getVector(S1, S2);

    var dist_S1S2 = getDistance(S1, S2);

    if (-epsilon <= dist_S1S2 && dist_S1S2 <= epsilon) {
        return S1;
    }

    var dist_S1P2 = (vect_S1S2.x*vect_S1P.x + vect_S1S2.y*vect_S1P.y) / dist_S1S2;
    var k =  dist_S1P2 / dist_S1S2;
    var P2 = {
        x: S1.x + k * vect_S1S2.x,
        y: S1.y + k * vect_S1S2.y
    }

    return P2;
}

/* P: a point
 * S1 & S2: both points at the ends of the segment
 */
function testPointInSegment(P, S1, S2, thickness = 1)
{
    /* test is the points are approximately collinear */
    var P2 = getProjectedPointOnLine(P, S1, S2);
    var result = testClosePoints(P, P2, thickness);

    // if points are approximately collinear
    // then test if projected P is inside the segment
    if (result)
    {
        var dist_P2S1 = getDistance(P2, S1);
        var dist_P2S2 = getDistance(P2, S2);
        var dist_S1S2 = getDistance(S1, S2);
        result = areEqualDistancesWithTolerance(dist_P2S1+dist_P2S2, dist_S1S2);
    }
    return result;
}

// test if the point belongs to a segment of the polygon
function testPointOnPolygon(P, polygon) {
    var result = false;
    for (j = 0; j < polygon.pointList.length; j++)
    {
        var k = j+1;
        // to loop with the last and first point of the polygon
        if (k >= polygon.pointList.length)
        {
            k = 0;
        }

        if (testPointInSegment(P, polygon.pointList[j], polygon.pointList[k], polygon.thicknessLine))
        {
            result = true;
            break;
        }
    }
    return result;
}

function testPointOnPolygonPoints(P, polygon) {
    var result = false;
    for (j = 0; j < polygon.pointList.length; j++)
    {
        var C = polygon.pointList[j];
        var radius = polygon.thicknessLine*coeffWidthLine*2;

        if (testPointInCircle(P, C, radius))
        {
            result = true;
            break;
        }
    }
    return result;
}

function getAimedPolygonPointIndex(P, polygon) {
    var index = null;
    for (j = 0; j < polygon.pointList.length; j++)
    {
        var C = polygon.pointList[j];
        var radius = polygon.thicknessLine*coeffWidthLine*2;

        if (testPointInCircle(P, C, radius))
        {
            index = j;
            break;
        }
    }
    return index;
}

// get the thickness selected by the user to draw a new polygon
function getPolygonThicknessLine() {
    if (isInModificationMode)
    {
        var mediumLine = document.getElementById("mediumLine");
        var thickLine = document.getElementById("thickLine");
        var veryThickLine = document.getElementById("veryThickLine");

        var thickness;
        if (mediumLine.checked)
        {
            thickness = 2;
        }
        else if (thickLine.checked)
        {
            thickness = 3;
        }
        else if (veryThickLine.checked)
        {
            thickness = 4;
        }
        // else thinLine is checked
        else
        {
            thickness = 1;
        }
    }

    return thickness;
}

function copyPolygon(polygon)
{
    var copiedPolygon = {
        "category": "polygons",
        "pointList": polygon.pointList.slice(),
        "thicknessLine": polygon.thicknessLine
    }

    return copiedPolygon;
}