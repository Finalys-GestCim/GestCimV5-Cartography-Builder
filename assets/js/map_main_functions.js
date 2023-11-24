function downloadJSONFile(filename, data)
{
    var blob = new Blob(["map = " + JSON.stringify(data,undefined,2)], {
        type: 'application/json',
        name: filename
    });

    //IE 10+
    if (window.navigator.msSaveBlob)
    {
        window.navigator.msSaveBlob(blob, filename);
    }
    else
    {
        //Everything else
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;

        setTimeout(() => {
            a.click();

            //Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 1);
    }
}

function openCanvasWindow()
{
    var canvasWindow = window.open("", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,width=600,height=600");
    canvasWindow.document.write("<canvas id=\"imageCanvas\"> </canvas>");

    var canvas = canvasWindow.document.getElementById("imageCanvas");

    var ctx = canvas.getContext("2d");
    ctx.canvas.width = map.w;
    ctx.canvas.height = map.h;

    var copiedCamera = copyCamera();
    camera.zoom = 1;
    focusOnCenterMap();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    photoCanvas = canvas;
    photoCtx = ctx;
    mapCanvas = canvas;
    mapCtx = ctx;

    drawAirPhoto();
    drawElements(false);

    /* reinit */
    camera = copiedCamera;

    photoCanvas = document.getElementById("photoCanvas");
    photoCtx = photoCanvas.getContext("2d");

    mapCanvas = document.getElementById("mapCanvas");
    mapCtx = mapCanvas.getContext("2d");

    refreshSizeCanvas();
    drawMap();

    canvasWindow.alert("Clique droit pour enregistrer l'image \n(le plan étant volumineux, il faudra patienter...)");
}

function initVariables()
{
    graves = [];
    polygons = [];
    rectangles = [];
    informationElements = [];

    elements = {
        "graves": graves,
        "rectangles": rectangles,
        "polygons": polygons,
        "informationElements": informationElements
    };

    map = {
        "name": null,
        "scale1m": 100.0,
        "init": false,
        "w": null,
        "h": null,
        "displayBackground": true,
        "displayGraveColor": false,
        "legendWidth": null,
        "elements": elements
    };
}

function initMapSize()
{
    var titleHeight = Math.round(image.width / 10) + map.scale1m;
    map.legendWidth = image.width / 2;
    map.w = image.width + map.legendWidth + map.scale1m;
    map.h = image.height + titleHeight + map.scale1m;
    map.origin = {
        "x": - map.legendWidth,
        "y": - titleHeight - map.scale1m
    };
}

function setMapSize(width, height, center)
{
    map.w = width;
    map.h = height;
    map.origin = {
        "x": center.x - map.w/2,
        "y": center.y - map.h/2
    };
}

// set map scale and do the needed modifications on other variables
function setMapScale(scale)
{
    map.scale1m = scale;
    coeffWidthLine = Math.round(map.scale1m/12);
    selectionDistTolerance = coeffWidthLine;
    updateScaleElement();
}

function getElementIndex(element)
{
    var elementList = elements[element.category];
    return elementList.indexOf(element);
}

function rotateAround(P, center, angle)
{
    return {
        x:center.x+(P.x-center.x)*Math.cos(angle)+(P.y-center.y)*Math.sin(angle),
        y:center.y-(P.x-center.x)*Math.sin(angle)+(P.y-center.y)*Math.cos(angle)
    };
}

function getVector(P1, P2)
{
    var v = {
        x: P2.x - P1.x,
        y: P2.y - P1.y
    };
    return v;
}

function getDeterminant(v1, v2)
{
    return v1.x * v2.y - v1.y * v2.x;
}

function getCenterRect(P, width, height)
{
    var center = {
        x: P.x + width/2,
        y: P.y + height/2
    }
    return center;
}

// P : point to test
// C : rectangle center
function testPointOnRectangle(P, C, width, height, rotation=0)
{
    var P2 = rotateAround(P, C, -rotation);

    return C.x-width/2 <= P2.x && P2.x <= C.x+width/2
        && C.y-height/2 <= P2.y && P2.y <= C.y+height/2;
}

function testPointOnTriangle(P, P1, P2, P3)
{
    v_PP1 = getVector(P, P1);
    v_PP2 = getVector(P, P2);
    v_PP3 = getVector(P, P3);

    det1 = getDeterminant(v_PP1, v_PP2);
    det2 = getDeterminant(v_PP2, v_PP3);
    det3 = getDeterminant(v_PP3, v_PP1);

    // the point P is in the triangle if the 3 determinants have the same sign
    return (det1 <= 0 && det2 <= 0 && det3 <= 0) || (det1 > 0 && det2 > 0 && det3 > 0);
}

function testPointOnElementCategory(P, element, elementCategory)
{
    var functionMapping = {
        graves: testPointIntoGrave,
        polygons: testPointOnPolygon,
        rectangles: testPointOnRectangleElement,
        informationElements: testPointOnInformationElement
    }
    return functionMapping[elementCategory](P, element);
}

function getPointedElement(P)
{
    var result = null;
    for (var elementKey in elements)
    {
        var elementList = elements[elementKey];
        for (var e = elementList.length - 1; e >= 0; --e)
        {
            var element = elementList[e];
            if (testPointOnElementCategory(P, element, elementKey))
            {
                result = element;
                break;
            }
        }
    }
    return result;
}

function testPointOnAllElements(P)
{
    if (getPointedElement(P) == null)
    {
        return false;
    }
    else
    {
        return true;
    }
}

function deselectElement()
{
    if (selectedElement)
    {
        selectedElement.isSelected = false;
        selectedElement = null;
    }
}

function selectElement(element)
{
    deselectElement();
    selectedElement = element;
    element.isSelected = true;
    element.isHovered = false;
}

function stopHoverElement()
{
    if (hoveredElement)
    {
        hoveredElement.isHovered = false;
        hoveredElement = null;
    }
}

function hoverElement(element)
{
    stopHoverElement();

    hoveredElement = element;
    element.isHovered = true;
}

function getCursorAfterElementSelection(P, element)
{
    var cursor = "default";

    if (element.category == "graves")
    {
        var grave = element;

        if (testPointOnCorners(P, grave) || testPointOnSides(P, grave))
        {
            cursor = getGraveResizingCursor(P, grave);
        }
        else if (testPointIntoGrave(P, grave))
        {
            cursor = "move";
        }
        else if (testPointOnRotationArrow(P, grave))
        {
            cursor = "grab";
        }
    }
    else if (element.category == "rectangles")
    {
        var rectangle = element;
        if (testPointOnRectangleCorners(P, rectangle) || testPointOnRectangleSides(P, rectangle))
        {
            cursor = getRectangleResizingCursor(P, rectangle);
        }
        else if (testPointOnRectangleCenter(P, rectangle))
        {
            cursor = "move";
        }
        else if (testPointOnRotationArrow(P, rectangle))
        {
            cursor = "grab";
        }
    }
    else if (selectedElement.category == "polygons")
    {
        var polygon = element;
        if (testPointOnPolygonPoints(P, polygon))
        {
            cursor = "grab";
        }
    }
    else if (element.category == "informationElements")
    {
        if (testPointOnResizingPoint(P, element) && element.type != "scale")
        {
            var position = getRotationPosition(element);
            var arrowList = ["ns-resize", "nwse-resize", "ew-resize", "nesw-resize"];
            var i = 1 + position;

            // modulo to make a loop in the array
            i = i % 4;

            cursor = arrowList[i];
        }
        else if (testPointOnInformationElement(M, element))
        {
            cursor = "move";
        }
        else if ((element.type != "scale") && testPointOnRotationArrow(M, element))
        {
            cursor = "grab";
        }
    }

    return cursor;
}

function copyElement(element)
{
    var functionMapping = {
        graves: copyGrave,
        polygons: copyPolygon,
        rectangles: copyRectangleElement,
        informationElements: copyInformationElement
    }
    return functionMapping[element.category](element);
}

function canDeleteElement(element)
{
    return (!(element.category == "informationElements"
                && (element.info == "logo" || element.info == "procedureLegend" || element.type == "scale"))
            && !(element.category == "rectangles" && element.info == "frame"))
}

function canCopyElement(element)
{
    return (
        !(element.category == "informationElements"
            && (element.info == "logo" || element.info == "procedureLegend" || element.type == "scale"))
        && !(element.category == "rectangles" && element.info == "frame")
        && element.category != "polygons")
}

function areEqualDistancesWithTolerance(dist1, dist2, coeff=1)
{
    //console.log("dist 1:"+dist1);
    //console.log("dist 2:"+dist2);
    //console.log("tolerance distance :"+(selectionDistTolerance*coeff));
    return (dist1 - selectionDistTolerance*coeff <= dist2) && (dist2 <= dist1 + selectionDistTolerance*coeff);
}

function testClosePoints(P1, P2, coeff=1)
{
    var dist = Math.sqrt((P1.x - P2.x)**2 + (P1.y - P2.y)**2);
    return areEqualDistancesWithTolerance(dist, 0, coeff);
}

function getDistance(P1, P2)
{
    return Math.sqrt((P1.x - P2.x)**2 + (P1.y - P2.y)**2);
}

function testPointInCircle(P, C, radius)
{
    var dist = getDistance(P, C);
    return (dist <= radius);
}

// handle camera zoom and movement on a point of the map :
// project a point from the map to the screen
function projectPoint(P)
{
    var P2 = {
        x: (P.x-camera.center.x)*camera.zoom+mapCanvas.width/2,
        y: (P.y-camera.center.y)*camera.zoom+mapCanvas.height/2
    };

    return P2;
}

// project a point from the screen to the map
function projectPointInRealScale(P)
{
    var P2 = {
        x: (P.x/camera.zoom+camera.center.x)-mapCanvas.width/(2*camera.zoom),
        y: (P.y/camera.zoom+camera.center.y)-mapCanvas.height/(2*camera.zoom)
    };

    return P2;
}

function focusOnCenterMap()
{
    camera.center = getMapCenter();
}

function getMapCenter()
{
    var center = {
        "x": map.origin.x + map.w / 2,
        "y": map.origin.y + map.h / 2
    };
    return center;
}

function createMap()
{
    map.init = true;
    addLogo();
    addProcedureLegend();
    addScale();
    addTitle();
    addFrame();
    console.log("Create a new map");
    deselectElement();
}

function initMap()
{
    refreshSizeCanvas();
    
    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);

    initIndexedDB();
    
    startLoadingAllImages(imagesAreNowLoaded);
}

// refresh all the elements of the map (background and map drawing)
function refresh()
{
    drawMap();
}

function drawMap()
{
    drawAirPhoto();
    drawElements();
}

function refreshSizeCanvas()
{
    var toolbarWidth = 200;

    mapCtx.canvas.width  = window.innerWidth - toolbarWidth;
    mapCtx.canvas.height = window.innerHeight;
    
    photoCtx.canvas.width  = window.innerWidth - toolbarWidth;
    photoCtx.canvas.height = window.innerHeight;
}

function copyCamera()
{
    var copiedCamera = {
        "center": {
            "x": camera.center.x,
            "y": camera.center.y
        },
        "zoom": camera.zoom
    };

    return copiedCamera;
}
