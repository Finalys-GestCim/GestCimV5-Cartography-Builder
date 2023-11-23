var imagesOK = 0;



var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var img = new Image();
        images["airPhoto"] = img;
        img.onload = function() {
            imagesAreNowLoaded();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}


// Create a new Image() for each item in imageSources[]
// When all images are loaded, run the callback (==imagesAreNowLoaded)
function startLoadingAllImages(callback)
{
    for (const nameImg in imageSources)
    {
        var img = new Image();

        if (imageSources.hasOwnProperty(nameImg))
        {
            images[nameImg] = img;
        }

        img.onload = function(){
            imagesOK++;

            // if we've loaded all images, call the callback
            if (imagesOK >= Object.keys(imageSources).length)
            {
                callback();
            }
        };

        // notify if there's an error
        img.onerror = function(){
            if (nameImg == "airPhoto")
            {
                alert("Veuillez placer la photo aérienne dans le dossier data");
            }
            else
            {
                alert("Une image n'a pas pu être chargée");
            }
        }

        // set img properties
        img.src = imageSources[nameImg];
    }
}

function imagesAreNowLoaded()
{
    alert("all images loaded!!")
    var maxWidth = photoCtx.canvas.width;
    var maxHeight = photoCtx.canvas.height;
    var img = images["airPhoto"];

    image.width = img.naturalWidth;
    image.height = img.naturalHeight;

    if (map == null)
    {
        initVariables();
        initMapSize();
        createMap();
        alert("Aucun fichier JSON n'étant présent dans le dossier data, un nouveau plan a été créé");
    }
    else
    {
        elements = map.elements;

        graves = elements.graves;
        polygons = elements.polygons;
        rectangles = elements.rectangles;
        informationElements = elements.informationElements;
    }

    coeffWidthLine = Math.round(map.scale1m/12);
    selectionDistTolerance = coeffWidthLine;

    if (isInModificationMode)
    {
        /* init toolbar checkboxes */
        document.getElementById("displayBackground").checked = map.displayBackground;
        document.getElementById("displayGraveColor").checked = map.displayGraveColor;
    }

    // init zoom to print the full map
    var reduction = 1;
    if(map.w > maxWidth || map.h > maxHeight) {
        reduction = Math.max(map.w / maxWidth, map.h/ maxHeight);
    }
    camera.zoom = 1/reduction;

    // TO MODIFY : tmp init to test
    //camera.zoom = 0.5;

    focusOnCenterMap();
    drawMap();
}



mapCanvas.addEventListener('mousemove', e => {
    var M1 = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    M = projectPointInRealScale(M1);

    var cursorIsChanged = false;

    var element = getPointedElement(M);
    if (element != null && !element.isSelected
        && (!modification.action
            || (modification.action == DELETE && canDeleteElement(element))
            || (modification.action == COPY && canCopyElement(element))
            || (modification.action == SET_GRAVE_COLOR && modification.color != null && element.category == "graves" && !element.isOssuary)))
    {
        if (isInModificationMode || element.category == "graves")
        {
            hoverElement(element);

            if (!modification.action)
            {
                document.body.style.cursor = "pointer";
                cursorIsChanged = true;
            }
        }
    }
    else if (hoveredElement != null)
    {
        stopHoverElement();
    }

    if (isInModificationMode)
    {

        if (selectedElement != null)
        {
            if (selectedElement.category == "graves")
            {
                var grave = selectedElement;

                if (modification.action == ROTATE)
                {
                    grave.rotation = (grave.storedAngle + getGraveMouseRotation(grave, grave.rotationStart.x, grave.rotationStart.y, M.x, M.y)) % (2 * Math.PI);
                    document.body.style.cursor = "grabbing";
                    cursorIsChanged = true;
                }
                else if (modification.action == MOVE)
                {
                    grave.center.x = M.x + grave.moveDisplacement.x;
                    grave.center.y = M.y + grave.moveDisplacement.y;
                    document.body.style.cursor = "move";
                    cursorIsChanged = true;
                }
                else if (modification.action == RESIZE)
                {
                    var M2 = rotateAround(M, grave.center, -grave.rotation);
                    var startPoint = getResizingStartPoint(grave);

                    var coeffs = getResizingCoeff(grave);
                    var dxCoeff = coeffs.dxCoeff;
                    var dyCoeff = coeffs.dyCoeff;

                    // dx and dy correspond to the resizing
                    var dx = dxCoeff * (M2.x - startPoint.x);
                    var dy = dyCoeff * (M2.y - startPoint.y);

                    // if resizing by a corner
                    // then keep the proportionality
                    if (grave.isResizedBy <= 4)
                    {
                        var dx2 = dy * grave.size.w / grave.size.h;
                        var dy2 = dx * grave.size.h / grave.size.w;

                        if (dx2 > dx)
                        {
                            dx = dx2;
                        }
                        else if (dy2 > dy)
                        {
                            dy = dy2;
                        }
                    }

                    var center = {
                        x: grave.center.x + dxCoeff * dx / 2,
                        y: grave.center.y + dyCoeff * dy / 2
                    };

                    center = rotateAround(center, grave.center, grave.rotation);

                    grave.size.w += dx;
                    grave.size.h += dy;

                    var width = grave.size.w - (coeffWidthLine * graveLineThicknessCoeff);
                    var height = grave.size.h - (coeffWidthLine * graveLineThicknessCoeff);

                    if (width <= 0)
                    {
                        grave.size.w = coeffWidthLine * graveLineThicknessCoeff;
                    }

                    if (height <= 0)
                    {
                        grave.size.h = coeffWidthLine * graveLineThicknessCoeff;
                    }

                    grave.center.x = center.x;
                    grave.center.y = center.y;

                    cursorIsChanged = true; // to keep the arrow cursor
                }
                else if (testPointOnCorners(M, grave) || testPointOnSides(M, grave))
                {
                    document.body.style.cursor = getGraveResizingCursor(M, grave);
                    cursorIsChanged = true;
                }
                else if (testPointIntoGrave(M, grave))
                {
                    document.body.style.cursor = "move";
                    cursorIsChanged = true;
                }
                else if (testPointOnRotationArrow(M, grave))
                {
                    document.body.style.cursor = "grab";
                    cursorIsChanged = true;
                }
            }
            else if (selectedElement.category == "rectangles")
            {
                var rectangle = selectedElement;

                if (modification.action == ROTATE)
                {
                    rectangle.rotation = (rectangle.storedAngle + getGraveMouseRotation(rectangle, rectangle.rotationStart.x, rectangle.rotationStart.y, M.x, M.y)) % (2 * Math.PI);
                    document.body.style.cursor = "grabbing";
                    cursorIsChanged = true;
                }
                else if (modification.action == MOVE)
                {
                    rectangle.center.x = M.x + rectangle.moveDisplacement.x;
                    rectangle.center.y = M.y + rectangle.moveDisplacement.y;
                    document.body.style.cursor = "move";
                    cursorIsChanged = true;
                }
                else if (modification.action == RESIZE)
                {
                    var M2 = rotateAround(M, rectangle.center, -rectangle.rotation);
                    var startPoint = getRectangleResizingStartPoint(rectangle);

                    var coeffs = getResizingCoeff(rectangle);
                    var dxCoeff = coeffs.dxCoeff;
                    var dyCoeff = coeffs.dyCoeff;

                    // dx and dy correspond to the resizing
                    var dx = dxCoeff * (M2.x - startPoint.x);
                    var dy = dyCoeff * (M2.y - startPoint.y);

                    // if resizing by a corner
                    // then keep the proportionality
                    if (rectangle.isResizedBy <= 4)
                    {
                        var dx2 = dy * rectangle.size.w / rectangle.size.h;
                        var dy2 = dx * rectangle.size.h / rectangle.size.w;

                        if (dx2 > dx)
                        {
                            dx = dx2;
                        }
                        else if (dy2 > dy)
                        {
                            dy = dy2;
                        }
                    }

                    var center = {
                        x: rectangle.center.x + dxCoeff * dx / 2,
                        y: rectangle.center.y + dyCoeff * dy / 2
                    };

                    center = rotateAround(center, rectangle.center, rectangle.rotation);

                    rectangle.size.w += dx;
                    rectangle.size.h += dy;

                    var width = rectangle.size.w - (coeffWidthLine * rectangle.thicknessLine);
                    var height = rectangle.size.h - (coeffWidthLine * rectangle.thicknessLine);

                    if (width <= 0)
                    {
                        rectangle.size.w = coeffWidthLine * rectangle.thicknessLine;
                    }

                    if (height <= 0)
                    {
                        rectangle.size.h = coeffWidthLine * rectangle.thicknessLine;
                    }

                    rectangle.center.x = center.x;
                    rectangle.center.y = center.y;

                    cursorIsChanged = true; // to keep the arrow cursor
                }
                else if (testPointOnRectangleCorners(M, rectangle) || testPointOnRectangleSides(M, rectangle))
                {
                    document.body.style.cursor = getRectangleResizingCursor(M, rectangle);
                    cursorIsChanged = true;
                }
                else if (testPointOnRectangleCenter(M, rectangle))
                {
                    document.body.style.cursor = "move";
                    cursorIsChanged = true;
                }
                else if (testPointOnRotationArrow(M, rectangle))
                {
                    document.body.style.cursor = "grab";
                    cursorIsChanged = true;
                }
            }
            else if (selectedElement.category == "polygons")
            {
                var polygon = selectedElement;

                // modify a point of the polygon
                if (modification.action == RESIZE)
                {
                    polygon.pointList[modification.startPointIndex] = M;
                    cursorIsChanged = true;
                }
                else if (testPointOnPolygonPoints(M, polygon))
                {
                    document.body.style.cursor = "grab";
                    cursorIsChanged = true;
                }
            }
            else if (selectedElement.category == "informationElements")
            {
                var element = selectedElement;

                if (modification.action == ROTATE)
                {
                    element.rotation = (element.storedAngle + getGraveMouseRotation(element, element.rotationStart.x, element.rotationStart.y, M.x, M.y)) % (2 * Math.PI);
                    document.body.style.cursor = "grabbing";
                    cursorIsChanged = true;
                }
                else if (modification.action == MOVE)
                {
                    element.center.x = M.x + element.moveDisplacement.x;
                    element.center.y = M.y + element.moveDisplacement.y;
                    document.body.style.cursor = "move";
                    cursorIsChanged = true;
                }
                else if (modification.action == RESIZE)
                {
                    var M2 = rotateAround(M, element.center, -element.rotation);
                    var startPoint = {
                        x: element.center.x + element.size.w / 2,
                        y: element.center.y + element.size.h / 2
                    };

                    // dx and dy correspond to the resizing
                    var dx = M2.x - startPoint.x;
                    var dy = M2.y - startPoint.y;

                    /* keep the proportionality */
                    if (element.type != "arrow")
                    {
                        var dx2 = dy * element.size.w / element.size.h;
                        var dy2 = dx * element.size.h / element.size.w;

                        if (dx2 > dx)
                        {
                            dx = dx2;
                        }
                        else if (dy2 > dy)
                        {
                            dy = dy2;
                        }
                    }

                    var center = {
                        x: element.center.x + dx / 2,
                        y: element.center.y + dy / 2
                    };

                    center = rotateAround(center, element.center, element.rotation);

                    element.center.x = center.x;
                    element.center.y = center.y;

                    element.size.w += dx;
                    element.size.h += dy;

                    cursorIsChanged = true; // to keep the arrow cursor
                }
                else if (testPointOnResizingPoint(M, element) && element.type != "scale")
                {
                    var position = getRotationPosition(element);
                    var arrowList = ["ns-resize", "nwse-resize", "ew-resize", "nesw-resize"];
                    var i = 1 + position;

                    // modulo to make a loop in the array
                    i = i % 4;

                    document.body.style.cursor = arrowList[i];
                    cursorIsChanged = true;
                }
                else if (testPointOnInformationElement(M, element))
                {
                    document.body.style.cursor = "move";
                    cursorIsChanged = true;
                }
                else if ((element.type != "scale") && testPointOnRotationArrow(M, element))
                {
                    document.body.style.cursor = "grab";
                    cursorIsChanged = true;
                }
            }
        }

        if (modification.action == SET_GRAVE_DIRECTION)
        {
            for (var g = graves.length - 1; g >= 0; --g)
            {
                var grave = graves[g];
                var direction = getPointedGraveTriangle(M, grave);
                if (direction)
                {
                    document.body.style.cursor = "pointer";
                    cursorIsChanged = true;
                    break;
                }
            }
        }
        // pick a color for the graves
        else if (modification.action == SET_GRAVE_COLOR)
        {
            var color = getPointedColor(M1);

            if (color != null)
            {
                document.body.style.cursor = "pointer";
                cursorIsChanged = true;
            }
        }
    }

    if (camera.isMoving)
    {
        // new camera position = (vector M'M) + old camera position
        // NB : camera displacement is opposite to cursor displacement
        camera.center.x = (camera.startDisplacementPoint.x - M.x) + camera.center.x;
        camera.center.y = (camera.startDisplacementPoint.y - M.y) + camera.center.y;
        document.body.style.cursor = "move";
        cursorIsChanged = true;
        drawAirPhoto();
    }
    if (!cursorIsChanged)
    {
        if (!modification.action)
        {
            // reinitiate the cursor
            document.body.style.cursor = "default";
        }
        else
        {
            if (modification.action == DELETE)
            {
                document.body.style.cursor = "not-allowed";
            }
            else if (modification.action == COPY)
            {
                document.body.style.cursor = "copy";
            }
            else if (modification.action == SET_GRAVE_DIRECTION)
            {
                document.body.style.cursor = "default";
            }
            else if (modification.action == SET_GRAVE_COLOR)
            {
                if (modification.color == null)
                {
                    document.body.style.cursor = "default";
                }
                else
                {
                    document.body.style.cursor = "crosshair";
                }

            }
        }
    }
    if (modification.action <= 10)
    {
        drawElements();
    }
});

mapCanvas.addEventListener('mousedown', e => {
    var M1 = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    var M = projectPointInRealScale(M1);

    // mouse left click
    if (e.button == 0)
    {

        if (isInModificationMode)
        {
            if (selectedElement != null)
            {
                if (selectedElement.category == "graves")
                {
                    var grave = selectedElement;

                    // rotation click
                    if (testPointOnRotationArrow(M, grave))
                    {
                        modification.action = ROTATE;
                        grave.rotationStart = {
                            x: M.x,
                            y: M.y
                        };
                        grave.storedAngle = grave.rotation;
                        document.body.style.cursor = "grabbing";
                    }
                    // resize click on a grave corner
                    else if (testPointOnCorners(M, grave))
                    {
                        var cornerList = [BOTTOM_RIGHT_CORNER, BOTTOM_LEFT_CORNER, TOP_LEFT_CORNER, TOP_RIGHT_CORNER];
                        var corner = 0;
                        var i = 0;

                        /* look for the selected corner to resize */
                        while (!corner && i < cornerList.length)
                        {
                            if (testPointOnSpecificCorner(M, grave, cornerList[i]))
                            {
                                corner = cornerList[i];
                            }
                            i++;
                        }
                        if (i > 4)
                        {
                            console.error("Do not find the selected corner to resize");
                        }
                        else
                        {
                            grave.isResizedBy = corner;
                            modification.action = RESIZE;
                        }
                    }
                    // resize click on a grave side
                    else if (testPointOnSides(M, grave))
                    {
                        var sideList = [TOP_SIDE, RIGHT_SIDE, BOTTOM_SIDE, LEFT_SIDE];
                        var side = 0;
                        var i = 0;

                        /* look for the selected side to resize */
                        while (!side && i < sideList.length)
                        {
                            if (testPointOnSpecificSide(M, grave, sideList[i]))
                            {
                                side = sideList[i];
                            }
                            i++;
                        }
                        if (i > 4)
                        {
                            console.error("Do not find the selected side to resize");
                        }
                        else
                        {
                            grave.isResizedBy = side;
                            modification.action = RESIZE;
                        }
                    }
                    // grave moving click
                    else if (testPointIntoGrave(M, grave))
                    {
                        modification.action = MOVE;
                        var dx = grave.center.x - M.x;
                        var dy = grave.center.y - M.y;
                        grave.moveDisplacement = {
                            x: dx,
                            y: dy
                        };
                    }
                }
                if (selectedElement.category == "rectangles")
                {
                    var rectangle = selectedElement;

                    // rotation click
                    if (testPointOnRotationArrow(M, rectangle))
                    {
                        modification.action = ROTATE;
                        rectangle.rotationStart = {
                            x: M.x,
                            y: M.y
                        };
                        rectangle.storedAngle = rectangle.rotation;
                        document.body.style.cursor = "grabbing";
                    }
                    // resize click on a rectangle corner
                    else if (testPointOnRectangleCorners(M, rectangle))
                    {
                        var cornerList = [BOTTOM_RIGHT_CORNER, BOTTOM_LEFT_CORNER, TOP_LEFT_CORNER, TOP_RIGHT_CORNER];
                        var corner = 0;
                        var i = 0;

                        /* look for the selected corner to resize */
                        while (!corner && i < cornerList.length)
                        {
                            if (testPointOnRectangleSpecificCorner(M, rectangle, cornerList[i]))
                            {
                                corner = cornerList[i];
                            }
                            i++;
                        }
                        if (i > 4)
                        {
                            console.error("Do not find the selected corner to resize");
                        }
                        else
                        {
                            rectangle.isResizedBy = corner;
                            modification.action = RESIZE;
                        }
                    }
                    // resize click on a rectangle side
                    else if (testPointOnRectangleSides(M, rectangle))
                    {
                        var sideList = [TOP_SIDE, RIGHT_SIDE, BOTTOM_SIDE, LEFT_SIDE];
                        var side = 0;
                        var i = 0;

                        /* look for the selected side to resize */
                        while (!side && i < sideList.length)
                        {
                            if (testPointOnRectangleSpecificSide(M, rectangle, sideList[i]))
                            {
                                side = sideList[i];
                            }
                            i++;
                        }
                        if (i > 4)
                        {
                            console.error("Do not find the selected side to resize");
                        }
                        else
                        {
                            rectangle.isResizedBy = side;
                            modification.action = RESIZE;
                        }
                    }
                    // rectangle moving click
                    else if (testPointOnRectangleCenter(M, rectangle))
                    {
                        modification.action = MOVE;
                        var dx = rectangle.center.x - M.x;
                        var dy = rectangle.center.y - M.y;
                        rectangle.moveDisplacement = {
                            x: dx,
                            y: dy
                        };
                    }
                }
                else if (selectedElement.category == "polygons")
                {
                    var polygon = selectedElement;

                    if (testPointOnPolygonPoints(M, polygon))
                    {
                        document.body.style.cursor = "grabbing";
                        modification.action = RESIZE;
                        modification.startPointIndex = getAimedPolygonPointIndex(M, polygon);
                    }
                }
                else if (selectedElement.category == "informationElements")
                {
                    var element = selectedElement;

                    // rotation click
                    if ((element.type != "scale") && testPointOnRotationArrow(M, element))
                    {
                        modification.action = ROTATE;
                        element.rotationStart = {
                            x: M.x,
                            y: M.y
                        };
                        element.storedAngle = element.rotation;
                        document.body.style.cursor = "grabbing";
                    }
                    // resizing click
                    else if (testPointOnResizingPoint(M, element) && element.type != "scale")
                    {
                        modification.action = RESIZE;
                    }
                    // moving click
                    else if (testPointOnInformationElement(M, element))
                    {
                        modification.action = MOVE;
                        var dx = element.center.x - M.x;
                        var dy = element.center.y - M.y;
                        element.moveDisplacement = {
                            x: dx,
                            y: dy
                        };
                    }
                }
            }
        }
        if (!modification.action || modification.action == DELETE || modification.action == COPY || modification.action == SET_GRAVE_DIRECTION || modification.action == SET_GRAVE_COLOR)
        {
            // potential map moving click if not click on any element
            if (!modification.action || !testPointOnAllElements(M))
            {
                camera.isMoving = true;
                camera.startDisplacementPoint = {
                    x: M.x,
                    y: M.y
                };
                camera.startMousePoint = {
                    x: M1.x,
                    y: M1.y
                };
            }
            drawElements();
        }
    }
});

mapCanvas.addEventListener('mouseup', e => {
    var M1 = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    var M = projectPointInRealScale(M1);

    // mouse left click
    if (e.button == 0)
    {
        /* click on an element */
        var element = getPointedElement(M);
        if (element != null)
        {
            var elementList = elements[element.category];
            var e = getElementIndex(element);

            if (!isInModificationMode)
            {
                if (element.category == "graves")
                {
                    selectElement(element);
                    camera.center = {
                        x: element.center.x,
                        y: element.center.y
                    };
                }
            }
            else
            {
                /* click to delete */
                if (modification.action == DELETE && canDeleteElement(element))
                {
                    // pop up of confirmation
                    if (confirm("Veuillez confirmer la suppression de l'élément"))
                    {
                        console.log("An element has been deleted");
                        elementList.splice(e, 1);
                    }
                    initToolbar();
                }
                /* click to copy */
                else if (modification.action == COPY && canCopyElement(element))
                {
                    var copiedElement = copyElement(element);

                    var newCenter = {
                        "x": element.center.x,
                        "y": element.center.y
                    }

                    if (element.category == "graves" || element.category == "rectangles")
                    {
                        if(!element.direction || element.direction == TOP_SIDE)
                        {
                            newCenter.x += element.size.w;
                        }
                        else if(element.direction == BOTTOM_SIDE)
                        {
                            newCenter.x -= element.size.w;
                        }
                        else if(element.direction == LEFT_SIDE)
                        {
                            newCenter.y -= element.size.h;
                        }
                        else if(element.direction == RIGHT_SIDE)
                        {
                            newCenter.y += element.size.h;
                        }

                        newCenter = rotateAround(newCenter, element.center, element.rotation);

                        if (element.category == "graves" && !element.isOssuary)
                        {
                            copiedElement.number = (parseFloat(element.number) + 1).toString();
                        }
                    }
                    else
                    {
                        newCenter.x += map.scale1m;
                        newCenter.y += map.scale1m;
                    }

                    copiedElement.center = newCenter;
                    elementList.push(copiedElement);
                }
                /* click to set grave direction */
                else if (modification.action == SET_GRAVE_DIRECTION && element.category == "graves")
                {
                    var grave = element;
                    var direction = getPointedGraveTriangle(M, grave);
                    if (direction)
                    {
                        // if click to remove the direction
                        if (direction == grave.direction)
                        {
                            grave.direction = 0;
                        }
                        // else, set the new grave direction
                        else
                        {
                            grave.direction = direction;
                        }
                    }
                }
                /* click to set grave color */
                else if (modification.action == SET_GRAVE_COLOR && modification.color != null
                        && element.category == "graves" && !element.isOssuary)
                {
                    element.color = modification.color;
                }
                /* click to select */
                else if (!element.isSelected && modification.action == NO_ACTION)
                {
                    selectElement(element);

                    document.body.style.cursor = getCursorAfterElementSelection(M, element);

                    // change the rank of the element
                    // to draw it in the foreground
                    elementList.splice(e, 1);
                    elementList.push(element);
                }
            }
        }
        else if (modification.action == SET_GRAVE_COLOR)
        {
            var color = getPointedColor(M1);

            // if click to select the color
            if (color != null)
            {
                modification.color = color;
            }
        }
        /* if no click on any element and no action is been doing
         * then deselect the current element */
        else if (modification.action == NO_ACTION)
        {
            if (selectedElement)
            {
                // check if the mouse do not move during the click
                // (in other case, it would be a click to move the camera)
                if (!camera.isMoving || (camera.isMoving && M1.x == camera.startMousePoint.x && M1.y == camera.startMousePoint.y))
                {
                    deselectElement();
                }
            }
        }

        if (selectedElement != null)
        {
            if (selectedElement.category == "graves")
            {
                var grave = selectedElement;

                if (modification.action == ROTATE)
                {
                    console.log("The grave " + grave.number + " is rotated");
                    modification.action = NO_ACTION;
                    document.body.style.cursor = "grab";
                }
                else if (modification.action == RESIZE)
                {
                    console.log("The grave " + grave.number + " is resized");
                    grave.isResizedBy = 0;
                    modification.action = NO_ACTION;
                }
                else if (modification.action == MOVE)
                {
                    console.log("The grave " + grave.number + " is moved");
                    modification.action = NO_ACTION;
                }
            }
            else if (selectedElement.category == "rectangles")
            {
                var rectangle = selectedElement;

                if (modification.action == ROTATE)
                {
                    console.log("The rectangle is rotated");
                    modification.action = NO_ACTION;
                    document.body.style.cursor = "grab";
                }
                else if (modification.action == RESIZE)
                {
                    console.log("The rectangle is resized");
                    rectangle.isResizedBy = 0;
                    modification.action = NO_ACTION;

                    if (rectangle.info == "frame")
                    {
                        setMapSize(rectangle.size.w, rectangle.size.h, rectangle.center);
                    }
                }
                else if (modification.action == MOVE)
                {
                    console.log("The rectangle is moved");
                    modification.action = NO_ACTION;
                }
            }
            else if (selectedElement.category == "polygons")
            {
                var polygon = selectedElement;

                // modify a point of the polygon
                if (modification.action == RESIZE)
                {
                    console.log("The polygon borders are modified");
                    modification.action = NO_ACTION;
                    modification.startPointIndex = null;
                    document.body.style.cursor = "grab";
                }
            }
            else if (selectedElement.category == "informationElements")
            {
                var element = selectedElement;

                if (modification.action == ROTATE)
                {
                    console.log("The element is rotated");
                    modification.action = NO_ACTION;
                    document.body.style.cursor = "grab";
                }
                else if (modification.action == RESIZE)
                {
                    console.log("The element is resized");
                    element.isResizedBy = 0;
                    modification.action = NO_ACTION;
                }
                else if (modification.action == MOVE)
                {
                    console.log("The element is moved");
                    modification.action = NO_ACTION;
                }
            }
        }

        if (camera.isMoving)
        {
            camera.isMoving = false;
            if (!modification.action)
            {
                document.body.style.cursor = "default";
            }
            drawAirPhoto();
        }

        if (!modification.action || modification.action == DELETE || modification.action == COPY || modification.action == SET_GRAVE_DIRECTION || modification.action == SET_GRAVE_COLOR)
        {
            drawElements();
        }
    }
});

//scroll wheel
mapCanvas.addEventListener('wheel', e => {
    var M = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    var M2 = projectPointInRealScale(M);
    var y = e.deltaY;
    var oldZoom = camera.zoom;

    // zoom --
    if (y > 0)
    {
        var maxWidth = photoCtx.canvas.width;
        var maxHeight = photoCtx.canvas.height;
        // minimum zoom to print the full map
        var minZoom = 1/(Math.max(map.w/maxWidth, map.h/maxHeight)*2);
        if (camera.zoom > minZoom)
        {
            camera.zoom = camera.zoom / 1.2;
            console.log("Zoom out : " + camera.zoom);
        }
    }
    // zoom ++
    else if (y < 0)
    {
        camera.zoom = camera.zoom * 1.2;
        console.log("Zoom in : " + camera.zoom);
    }

    /* calculate camera position to keep the cursor on the same map point */

    // distance between the old camera position and the mouse cursor (M2) in real scale (vector C2M2)
    var dx = M2.x - camera.center.x;
    var dy = M2.y - camera.center.y;

    // distance between the new camera position and the mouse cursor and in real scale (vector C'2M2)
    dx = (dx * oldZoom) / camera.zoom;
    dy = (dy * oldZoom) / camera.zoom;

    // subtract this vector to cursor position to find camera position
    camera.center.x = M2.x - dx;
    camera.center.y = M2.y - dy;

    refresh();
});

document.addEventListener('dblclick', e => {
    var M = {
        x: e.clientX - mapCanvas.getBoundingClientRect().left,
        y: e.clientY - mapCanvas.getBoundingClientRect().top
    };
    M = projectPointInRealScale(M);

    if (e.button == 0 && isInModificationMode) {
        if (selectedElement != null && getPointedElement(M) == selectedElement)
        {
            /* double click to change grave number */
            if (selectedElement.category == "graves" && !selectedElement.isOssuary)
            {
                var grave = selectedElement;

                if (!(modification.action == MOVE))
                {
                    var number = prompt("Numéro de la tombe :", grave.number);
                    if (number == null || number == "")
                    {
                        // do not modify grave number
                    }
                    else
                    {
                        grave.number = number;
                        drawGrave(grave);
                        drawElements();
                    }
                }
            }
            else if (selectedElement.category == "informationElements" && (selectedElement.type == "text" || selectedElement.type == "title"))
            {
                var element = selectedElement;

                if (!(modification.action == MOVE))
                {
                    var text = prompt("Texte :", element.info);
                    if (text == null || text == "")
                    {
                        // do not modify grave number
                    }
                    else
                    {
                        element.info = text;
                        element.size = getTextSize(text, element.size.h);
                        writeTextElement(element);
                        drawElements();
                    }
                }
            }
        }
    }

});

document.addEventListener('keydown', e => {
    console.log("key "+ e.key);
    // up arrow
    if (e.key == "ArrowUp")
    {
        camera.center.y -= 100/camera.zoom;
    }
    // down arrow
    else if (e.key == "ArrowDown")
    {
        camera.center.y += 100/camera.zoom;
    }
    // left arrow
    else if (e.key == "ArrowLeft")
    {
        camera.center.x -= 100/camera.zoom;
    }
    // right arrow
    else if (e.key == "ArrowRight")
    {
        camera.center.x += 100/camera.zoom;
    }
    refresh();
});

// zoom out with button
document.getElementById("zoomOut").addEventListener("click", function() {
    var maxWidth = photoCtx.canvas.width;
    var maxHeight = photoCtx.canvas.height;
    // minimum zoom to print the full map
    var minZoom = 1/(Math.max(map.w/maxWidth, map.h/maxHeight)*2);
    if (camera.zoom > minZoom)
    {
        camera.zoom = camera.zoom / 1.5;
        console.log("Zoom out : " + camera.zoom);
    }
    refresh();
});

// zoom in with button
document.getElementById("zoomIn").addEventListener("click", function() {
    camera.zoom = camera.zoom * 1.5;
    console.log("Zoom in : " + camera.zoom);
    refresh();
});

window.addEventListener('resize', e => {
    refreshSizeCanvas();
    refresh();
});

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

initMap();
