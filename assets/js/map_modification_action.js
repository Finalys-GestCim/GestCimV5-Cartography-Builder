mapCanvas.addEventListener('mousemove', e =>
{
    var M1 = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    var M = projectPointInRealScale(M1);

    // draw grave
    if (modification.action == ADD_GRAVE && modification.startPoint)
    {
        var v = getVector(modification.startPoint, M);

        var center = getCenterRect(modification.startPoint, v.x, v.y);
        var grave = {
            number: 0,
            center:
                {
                    x: center.x,
                    y: center.y
                },
            rotation: 0.0,
            size:
                {
                    w: Math.abs(v.x),
                    h: Math.abs(v.y)
                }
        };

        var isOssuary = document.getElementById("ossuaryCheckbox");

        if (isOssuary.checked) {
            grave.isOssuary = true;
        }

        drawElements();
        drawGrave(grave);
    }
    // draw rectangle
    else if (modification.action == ADD_RECTANGLE && modification.startPoint)
    {
        var v = getVector(modification.startPoint, M);
        var center = getCenterRect(modification.startPoint, v.x, v.y);
        var thicknessLine = getPolygonThicknessLine();

        var rectangle = createRectangleElement(center, Math.abs(v.x), Math.abs(v.y), thicknessLine);

        drawElements();
        drawRectangleElement(rectangle);
    }
    // draw polygon
    else if (modification.action == ADD_POLYGON && modification.pointList.length>0)
    {
        var polygon = {
            pointList: modification.pointList.slice()
        };
        polygon.pointList.push(M);
        polygon.thicknessLine = getPolygonThicknessLine();
        drawElements();
        drawLines(polygon, false);
    }
    // draw arrow
    else if (modification.action == ADD_ARROW && modification.startPoint)
    {
        var v = getVector(modification.startPoint, M);

        var width = v.x;
        var height = 3/2 * v.y ;

        var center = {
            x: modification.startPoint.x + width / 2,
            y: modification.startPoint.y + height / 6
        }

        var arrow = {
            "category": "informationElements",
            "type": "arrow",
            "center":
                {
                    "x": center.x,
                    "y": center.y
                },
            "rotation": 0.0,
            "size":
                {
                    "w": Math.abs(width),
                    "h": Math.abs(height)
                }
        };

        drawElements();
        drawArrow(arrow);
    }
    else if ((modification.action == SET_SCALE || modification.action == MEASURE) && modification.startPoint != null)
    {
        drawElements();
        drawDottedLine(modification.startPoint, M);

        if (modification.action == MEASURE)
        {
            var dist = getDistance(modification.startPoint, M);
            var distInMeters = dist / map.scale1m;
            drawMeasure(M, distInMeters);
        }
    }
});

mapCanvas.addEventListener('mousedown', e =>
{
    var M1 = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    var M = projectPointInRealScale(M1);

    // mouse left click
    if (e.button == 0)
    {
        // start to draw a grave / a rectangle element / an arrow
        if (modification.action == ADD_GRAVE || modification.action == ADD_RECTANGLE || modification.action == ADD_ARROW)
        {
            modification.startPoint = {
                x: M.x,
                y: M.y
            };
        }
    }
});

mapCanvas.addEventListener('mouseup', e =>
{
    var M1 = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    var M = projectPointInRealScale(M1);

    // mouse left click
    if (e.button == 0)
    {
        if (modification.action)
        {

            // draw grave
            if (modification.action == ADD_GRAVE)
            {
                var v = getVector(modification.startPoint, M);

                // if it was a simple click, draw the default grave
                if (v.x == 0 && v.y == 0)
                {
                    var simpleGrave = document.getElementById("simpleGrave");
                    var width = 1.4;
                    var height = 2.4;

                    // if not simple grave (1m x 2m), then it is a double grave (2m x 2m)
                    // NB: 1.4 (resp. 2.4) instead of 1 (resp.2) because there are borders of 20cm
                    if (!simpleGrave.checked)
                    {
                        width = 2.4;
                    }

                    v.x = (width * map.scale1m);
                    v.y = (height * map.scale1m);
                }
                var center = getCenterRect(modification.startPoint, v.x, v.y);
                var grave = {
                    "category": "graves",
                    "number": 0,
                    "center":
                        {
                            "x": center.x,
                            "y": center.y
                        },
                    "rotation": 0.0,
                    "size":
                        {
                            "w": Math.abs(v.x),
                            "h": Math.abs(v.y)
                        }
                };

                var isOssuary = document.getElementById("ossuaryCheckbox");

                if (isOssuary.checked) {
                    grave.isOssuary = true;
                }

                graves.push(grave);
                selectElement(grave);
                drawGrave(grave);
                console.log("Draw a new grave");

                initToolbar();
                modification.startPoint = null;
            }
            // draw rectangle
            else if (modification.action == ADD_RECTANGLE)
            {
                var v = getVector(modification.startPoint, M);

                // if it was a simple click, draw a default rectangle
                if (v.x == 0 && v.y == 0)
                {
                    v.x = (10 * map.scale1m);
                    v.y = (10 * map.scale1m);
                }

                var center = getCenterRect(modification.startPoint, v.x, v.y);

                var thicknessLine = getPolygonThicknessLine();

                addRectangleElement(center, Math.abs(v.x), Math.abs(v.y), thicknessLine);
                drawElements();
                console.log("Draw a new rectangle");

                initToolbar();
                modification.startPoint = null;
            }
            // draw arrow
            else if (modification.action == ADD_ARROW)
            {
                var v = getVector(modification.startPoint, M);

                // if it was a simple click, draw the default arrow
                if (v.x == 0 && v.y == 0)
                {
                    v.x = map.scale1m * 4;
                    v.y = map.scale1m / 2;
                }

                var width = v.x;
                var height = 3/2 * v.y ;

                var center = {
                    x: modification.startPoint.x + width / 2,
                    y: modification.startPoint.y + height / 6
                }

                var arrow = {
                    "category": "informationElements",
                    "type": "arrow",
                    "center":
                        {
                            "x": center.x,
                            "y": center.y
                        },
                    "rotation": 0.0,
                    "size":
                        {
                            "w": Math.abs(width),
                            "h": Math.abs(height)
                        }
                };

                informationElements.push(arrow);
                selectElement(arrow);
                drawArrow(arrow);
                console.log("Draw a new arrow");

                initToolbar();
                modification.startPoint = null;
            }
        }
    }
});

mapCanvas.addEventListener('click', e =>
{
    var M1 = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    var M = projectPointInRealScale(M1);

    // set scale
    if (modification.action == SET_SCALE || modification.action == MEASURE)
    {
        // if first click on the map : beginning of the segment
        if (modification.startPoint == null)
        {
            modification.startPoint = {
                x: M.x,
                y: M.y
            };
        }
        // else it is the second click : end of the segment
        else
        {
            var dist = getDistance(modification.startPoint, M);

            if (modification.action == SET_SCALE)
            {
                var distInMeters = prompt("Longueur en mètres :");
                if (distInMeters == null || distInMeters == "")
                {
                    // do not modify scale
                }
                else
                {
                    var scale = dist / distInMeters;
                    setMapScale(scale);
                }
            }
            else if (modification.action == MEASURE)
            {
                var distInMeters = dist / map.scale1m;

                // pop up to indicate the measure
                confirm("Longueur mesurée : " + distInMeters.toFixed(2).toString().replace(".", ",") +" m");

                initToolbar();
            }

            modification.startPoint = null;
            initToolbar();
        }
    }
    // polygon drawing: add a new point
    else if (modification.action == ADD_POLYGON)
    {
        var P = {
            x: M.x,
            y: M.y
        };
        var polygon = {
            "category": "polygons",
            "pointList": modification.pointList.slice()
        };
        polygon.thicknessLine = getPolygonThicknessLine();

        // add a new point
        if (modification.pointList.length < 3 || !testClosePoints(M, polygon.pointList[0], polygon.thicknessLine*2)) {
            polygon.pointList.push(P);
            modification.pointList.push(P);
            if (modification.pointList.length > 1) {
                drawElements();
                drawLines(polygon, false);
            }
        }
        // end of polygon drawing : close the polygon
        else if (testClosePoints(M, polygon.pointList[0], polygon.thicknessLine*2)) {
            polygons.push(polygon);
            selectElement(polygon);
            drawPolygon(polygon);
            console.log("Draw a new polygon");

            // init
            modification.pointList = null;
            initToolbar();
        }
    }
    else if(modification.action == ADD_IMAGE)
    {
        var name = modification.element;
        addImage(name, M);
        initToolbar();
    }
    else if(modification.action == ADD_TEXT) {
        var text = prompt("Texte :");
        if (text == null || text == "")
        {
            // do not add text area
        }
        else
        {
            addText(text, M);
        }
        initToolbar();
    }

    if (!modification.action)
    {
        drawElements();
    }
});

