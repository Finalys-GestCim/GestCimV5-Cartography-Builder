function drawDottedLine(P1, P2, color="black")
{
    P1 = projectPoint(P1);
    P2 = projectPoint(P2);

    mapCtx.strokeStyle = color;
    mapCtx.lineWidth = 2;

    mapCtx.beginPath();
    mapCtx.setLineDash([10, 10]);
    mapCtx.moveTo(P1.x, P1.y);
    mapCtx.lineTo(P2.x, P2.y);
    mapCtx.stroke();

    mapCtx.setLineDash([]);
}

function drawMeasure(M, distance)
{
    var M2 = projectPoint(M);
    var width = 80;
    var height = 30;

    var P = {
        "x": M2.x + 20,
        "y": M2.y - 15
    };

    mapCtx.fillStyle = "black";
    mapCtx.lineWidth = 10;

    mapCtx.globalAlpha = 0.5;
    mapCtx.fillRect(P.x, P.y, width, height);

    mapCtx.globalAlpha = 1;
    mapCtx.fillStyle = "white";
    mapCtx.textAlign = 'center';
    mapCtx.textBaseline = 'middle';
    mapCtx.font = 'normal 16px serif';

    mapCtx.fillText(distance.toFixed(2).toString().replace(".", ",") + " m", P.x + width/2, P.y + height/2);
}

function drawPoint(P, radius=coeffWidthLine, color="black", filled=false)
{
    P = projectPoint(P);
    mapCtx.beginPath();
    mapCtx.strokeStyle = color;
    mapCtx.fillStyle = "#cacaca";
    mapCtx.lineWidth = coeffWidthLine * camera.zoom;
    mapCtx.arc(P.x, P.y, radius*camera.zoom,0, 2 * Math.PI);
    mapCtx.stroke();
    if (filled)
    {
        mapCtx.fill();
    }
}

function drawPolygonPoints(polygon)
{
    var pointList = polygon.pointList;

    for (j = 0; j < pointList.length; j++)
    {
        var P = {
            x: pointList[j].x,
            y: pointList[j].y
        };
        drawPoint(P, polygon.thicknessLine*coeffWidthLine*2);
    }

}

function drawLines(polygon, closed=true)
{
    var colorList = ["#000000", "#FFFFFF"];
    var pointList = polygon.pointList;
    var widthList = [(coeffWidthLine*5/3)*polygon.thicknessLine, coeffWidthLine*polygon.thicknessLine];

    if(polygon.isHovered == true)
    {
        widthList[0] += 4;
    }

    if (polygon.isSelected) {
        colorList[1] = "#4d94ff";
    }

    for (var i = 0; i < colorList.length; i++) {
        mapCtx.beginPath();
        mapCtx.strokeStyle = colorList[i];
        mapCtx.lineWidth = widthList[i] * camera.zoom;

        for (var j = 0; j < pointList.length; j++) {
            var P = {
                x: pointList[j].x,
                y: pointList[j].y
            };
            P = projectPoint(P);

            if (j == 0) {
                mapCtx.moveTo(P.x, P.y);
            }
            else {
                mapCtx.lineTo(P.x, P.y);
            }
        }

        if (closed) {
            mapCtx.closePath();
        }

        mapCtx.stroke();
    }
}

function drawPolygon(polygon)
{
    drawLines(polygon);
    if (polygon.isSelected)
    {
        drawPolygonPoints(polygon);
    }
}

function drawRotationArrow(element, coeff=1)
{
    var radius = map.scale1m * 0.2;

    var center = {
        x: element.center.x,
        y: element.center.y - element.size.h/2 - map.scale1m*0.75,
    };
    center = rotateAround(center, element.center, element.rotation);
    center = projectPoint(center);

    var P1 = {
        x: element.center.x,
        y: element.center.y - element.size.h/2 - map.scale1m*0.75 + radius,
    };
    P1 = rotateAround(P1, element.center, element.rotation);
    P1 = projectPoint(P1);

    var P2 = {
        x: element.center.x,
        y: element.center.y - element.size.h/2,
    };
    P2 = rotateAround(P2, element.center, element.rotation);
    P2 = projectPoint(P2);

    mapCtx.strokeStyle  = "#000000";
    mapCtx.fillStyle  = "#000000";

    /* draw thin line between element and rotation arrow */
    mapCtx.lineWidth = camera.zoom * coeffWidthLine*0.2;
    mapCtx.beginPath();
    mapCtx.moveTo(P1.x, P1.y);
    mapCtx.lineTo(P2.x, P2.y);
    mapCtx.stroke();


    /* draw rotation arrow */
    mapCtx.lineWidth = camera.zoom * coeffWidthLine*0.8;

    mapCtx.beginPath();
    mapCtx.arc(center.x, center.y, radius * camera.zoom, 1/4 * Math.PI - element.rotation, 12/6 * Math.PI - element.rotation);
    mapCtx.stroke();

    mapCtx.lineWidth = camera.zoom * coeffWidthLine*0.8;
    var dx = Math.cos(1/4 * Math.PI) * radius/2;
    var dy = Math.sin(1/4 * Math.PI) * radius/2;

    var P3 = {
        x: element.center.x + dx,
        y: element.center.y - element.size.h/2 - map.scale1m*0.75 - dy
    };
    P3 = rotateAround(P3, element.center, element.rotation);
    P3 = projectPoint(P3);

    var P4 = {
        x: element.center.x + radius,
        y: element.center.y - element.size.h/2 - map.scale1m*0.75,
    };
    P4 = rotateAround(P4, element.center, element.rotation);
    P4 = projectPoint(P4);


    dx = Math.cos(1/5 * Math.PI) * radius*5/4;
    dy = Math.sin(1/5 * Math.PI) * radius*5/4;

    var P5 = {
        x: element.center.x + dx,
        y: element.center.y - element.size.h/2 - map.scale1m*0.75 - dy,
    };
    P5 = rotateAround(P5, element.center, element.rotation);
    P5 = projectPoint(P5);

    mapCtx.beginPath();
    mapCtx.moveTo(P3.x, P3.y);
    mapCtx.lineTo(P4.x, P4.y);
    mapCtx.lineTo(P5.x, P5.y);
    mapCtx.closePath();
    mapCtx.fill();
    mapCtx.stroke();
}

function drawGraveTriangle(grave, P1, P2, P3)
{
    P1 = rotateAround(P1, grave.center, grave.rotation);
    P2 = rotateAround(P2, grave.center, grave.rotation);
    P3 = rotateAround(P3, grave.center, grave.rotation);

    P1 = projectPoint(P1);
    P2 = projectPoint(P2);
    P3 = projectPoint(P3);

    mapCtx.beginPath();
    mapCtx.strokeStyle = "#000000";
    mapCtx.fillStyle = "#000000";
    mapCtx.lineWidth = coeffWidthLine * camera.zoom;
    mapCtx.moveTo(P1.x, P1.y);
    mapCtx.lineTo(P2.x, P2.y);
    mapCtx.lineTo(P3.x, P3.y);
    //mapCtx.stroke();
    mapCtx.fill();

}

function drawGraveTriangles(grave)
{
    var width = grave.size.w - (coeffWidthLine * graveLineThicknessCoeff);
    var height = grave.size.h - (coeffWidthLine * graveLineThicknessCoeff);

    var base = map.scale1m*1/4;

    var P1, P2, P3;

    /* draw top side triangle */
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

    drawGraveTriangle(grave, P1, P2, P3);

    /* draw bottom side triangle */
    P1 = rotateAround(P1, grave.center, Math.PI);
    P2 = rotateAround(P2, grave.center, Math.PI);
    P3 = rotateAround(P3, grave.center, Math.PI);

    drawGraveTriangle(grave, P1, P2, P3);

    /* draw left side triangle */
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

    drawGraveTriangle(grave, P1, P2, P3);

    /* draw right side triangle */
    P1 = rotateAround(P1, grave.center, Math.PI);
    P2 = rotateAround(P2, grave.center, Math.PI);
    P3 = rotateAround(P3, grave.center, Math.PI);

    drawGraveTriangle(grave, P1, P2, P3);
}

function getGraveColorSquareSize(grave)
{
    var size = map.scale1m * 0.6; // default size = 60 cm
    var width, height;

    if (!grave.direction || grave.direction == TOP_SIDE || grave.direction == BOTTOM_SIDE)
    {
        width = grave.size.w;
        height = grave.size.h;
    }
    else if (grave.direction == LEFT_SIDE || grave.direction == RIGHT_SIDE)
    {
        width = grave.size.h;
        height = grave.size.w;
    }

    var space_w = width - coeffWidthLine * graveLineThicknessCoeff * 2;
    var space_h = height/2 - coeffWidthLine * graveLineThicknessCoeff;

    /* calculate text width */
    var fontSize = Math.round(map.scale1m * 0.35);
    mapCtx.font = 'bold ' + fontSize.toString() + 'px arial';
    mapCtx.lineWidth = coeffWidthLine;
    var textWidth = mapCtx.measureText(grave.number).width + coeffWidthLine * 2;
    var maxTextWidth = (Math.min(grave.size.w, grave.size.h) - coeffWidthLine*graveLineThicknessCoeff*2);

    if (textWidth > maxTextWidth)
    {
        textWidth = maxTextWidth;
    }

    if (size > space_h - coeffWidthLine - textWidth/2)
    {
        size = space_h - coeffWidthLine - textWidth/2;
    }

    if (size > space_w - coeffWidthLine)
    {
        size = space_w - coeffWidthLine;
    }

    /* the minimum size is 20 cm */
    if (size < map.scale1m / 5)
    {
        size = map.scale1m / 5;
    }

    return size;
}

function drawGraveColor(grave)
{
    // if the grave has a color
    if (grave.color >= 1)
    {
        var size = getGraveColorSquareSize(grave);

        var P1, P2, P3, P4;

        if (!grave.direction || grave.direction == TOP_SIDE || grave.direction == BOTTOM_SIDE)
        {
            var height = grave.size.h;

            var space_h = height/2 - coeffWidthLine * graveLineThicknessCoeff;

            var y = space_h - coeffWidthLine - size/2;

            P1 = {
                x: grave.center.x - size / 2,
                y: grave.center.y + y - size / 2
            };
            P2 = {
                x: grave.center.x + size / 2,
                y: grave.center.y + y - size / 2
            };
            P3 = {
                x: grave.center.x + size / 2,
                y: grave.center.y + y + size / 2
            };
            P4 = {
                x: grave.center.x - size / 2,
                y: grave.center.y + y + size / 2
            };
        }
        else if (grave.direction == LEFT_SIDE || grave.direction == RIGHT_SIDE)
        {
            var height = grave.size.w;

            var space_h = height/2 - coeffWidthLine * graveLineThicknessCoeff;

            var y = space_h - coeffWidthLine - size/2;

            P1 = {
                x: grave.center.x + x - size / 2,
                y: grave.center.y + size / 2
            };
            P2 = {
                x: grave.center.x + x - size / 2,
                y: grave.center.y - size / 2
            };
            P3 = {
                x: grave.center.x + x + size / 2,
                y: grave.center.y - size / 2
            };
            P4 = {
                x: grave.center.x + x + size / 2,
                y: grave.center.y + size / 2
            };
        }
        else
        {
            console.error("Grave direction is not recognized");
        }

        if (grave.direction == BOTTOM_SIDE || grave.direction == RIGHT_SIDE)
        {
            P1 = rotateAround(P1, grave.center, Math.PI);
            P2 = rotateAround(P2, grave.center, Math.PI);
            P3 = rotateAround(P3, grave.center, Math.PI);
            P4 = rotateAround(P4, grave.center, Math.PI);
        }

        P1 = rotateAround(P1, grave.center, grave.rotation);
        P2 = rotateAround(P2, grave.center, grave.rotation);
        P3 = rotateAround(P3, grave.center, grave.rotation);
        P4 = rotateAround(P4, grave.center, grave.rotation);

        P1 = projectPoint(P1);
        P2 = projectPoint(P2);
        P3 = projectPoint(P3);
        P4 = projectPoint(P4);

        mapCtx.beginPath();

        if (grave.color == YELLOW)
        {
            mapCtx.strokeStyle = "#fff200";
            mapCtx.fillStyle = "#fff200";
        }
        else if (grave.color == RED)
        {
            mapCtx.strokeStyle = "#ff0000";
            mapCtx.fillStyle = "#ff0000";
        }
        else if (grave.color == RED_YELLOW)
        {
            mapCtx.strokeStyle = "#ff0000";
            mapCtx.fillStyle = "#fff200";
        }

        mapCtx.lineWidth = 1/6 * size * camera.zoom;
        mapCtx.moveTo(P1.x, P1.y);
        mapCtx.lineTo(P2.x, P2.y);
        mapCtx.lineTo(P3.x, P3.y);
        mapCtx.lineTo(P4.x, P4.y);
        mapCtx.closePath();
        mapCtx.fill();
        mapCtx.stroke();
    }
}

function drawGraveDirection(grave)
{
    var colorList = ["#000000","#FFFFFF"];
    var widthList = [coeffWidthLine * graveLineThicknessCoeff *2/3, coeffWidthLine*2/3];

    if (grave.isSelected) {
        colorList[1] = "#4d94ff";
    }

    var width = grave.size.w - (coeffWidthLine * graveLineThicknessCoeff);
    var height = grave.size.h - (coeffWidthLine * graveLineThicknessCoeff);

    var base = map.scale1m*1/3;

    var P1, P2, P3;

    if (grave.direction == TOP_SIDE || grave.direction == BOTTOM_SIDE)
    {
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
    }
    else if (grave.direction == LEFT_SIDE || grave.direction == RIGHT_SIDE)
    {
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
    }
    else
    {
        console.error("Grave direction is not recognized");
    }

    if (grave.direction == BOTTOM_SIDE || grave.direction == RIGHT_SIDE)
    {
        P1 = rotateAround(P1, grave.center, Math.PI);
        P2 = rotateAround(P2, grave.center, Math.PI);
        P3 = rotateAround(P3, grave.center, Math.PI);
    }

    P1 = rotateAround(P1, grave.center, grave.rotation);
    P2 = rotateAround(P2, grave.center, grave.rotation);
    P3 = rotateAround(P3, grave.center, grave.rotation);

    P1 = projectPoint(P1);
    P2 = projectPoint(P2);
    P3 = projectPoint(P3);

    for (i=0; i<colorList.length; i++) {
        mapCtx.beginPath();
        mapCtx.strokeStyle = colorList[i];
        mapCtx.lineWidth = widthList[i] * camera.zoom;
        mapCtx.moveTo(P1.x, P1.y);
        mapCtx.lineTo(P2.x, P2.y);
        mapCtx.lineTo(P3.x, P3.y);
        mapCtx.stroke();
    }
}

function drawGraveNumber(grave)
{
    mapCtx.textAlign = 'center';
    mapCtx.textBaseline = 'middle';
    mapCtx.lineJoin = 'round';

    var fontSize = Math.round(map.scale1m * 0.35 * camera.zoom);
    mapCtx.font = 'bold ' + fontSize.toString() + 'px arial';
    mapCtx.lineWidth = coeffWidthLine * camera.zoom;
    var textWidth = mapCtx.measureText(grave.number).width;

    while ((textWidth > ((Math.min(grave.size.w, grave.size.h) - coeffWidthLine*graveLineThicknessCoeff*2)*camera.zoom)) && (fontSize >= 10))
    {
        fontSize -= 1;
        mapCtx.font = 'bold ' + fontSize.toString() + 'px arial';
        textWidth = mapCtx.measureText(grave.number).width;
    }

    var P = {
        x: grave.center.x,
        y: grave.center.y,
    };
    P = rotateAround(P, grave.center, grave.rotation);
    P = projectPoint(P);

    mapCtx.strokeStyle = 'black';
    mapCtx.fillStyle = 'white';

    if (grave.isSelected) {
        mapCtx.fillStyle = "#4d94ff";
    }

    mapCtx.strokeText(grave.number, P.x, P.y);
    mapCtx.fillText(grave.number, P.x, P.y);

    mapCtx.lineJoin = 'miter';
}

function drawGrave(grave)
{
    var colorList = ["#000000","#FFFFFF"];
    var widthList = [coeffWidthLine * graveLineThicknessCoeff, coeffWidthLine];

    var width = grave.size.w - (coeffWidthLine * graveLineThicknessCoeff);
    var height = grave.size.h - (coeffWidthLine * graveLineThicknessCoeff);

    var P1 = {
        x:grave.center.x-width/2,
        y:grave.center.y-height/2
    };
    var P2 = {
        x:grave.center.x+width/2,
        y:grave.center.y-height/2
    };
    var P3 = {
        x:grave.center.x+width/2,
        y:grave.center.y+height/2
    };
    var P4 = {
        x:grave.center.x-width/2,
        y:grave.center.y+height/2
    };

    P1 = rotateAround(P1, grave.center, grave.rotation);
    P2 = rotateAround(P2, grave.center, grave.rotation);
    P3 = rotateAround(P3, grave.center, grave.rotation);
    P4 = rotateAround(P4, grave.center, grave.rotation);

    P1 = projectPoint(P1);
    P2 = projectPoint(P2);
    P3 = projectPoint(P3);
    P4 = projectPoint(P4);

    if(grave.isHovered == true)
    {
        widthList[0] += 4;
    }

    if (grave.isSelected) {
        colorList[1] = "#4d94ff";
        if (isInModificationMode) {
            drawRotationArrow(grave);
        }
    }

    if (grave.direction)
    {
        drawGraveDirection(grave);
    }

    for (i=0; i<colorList.length; i++) {
        mapCtx.beginPath();
        mapCtx.strokeStyle = colorList[i];
        mapCtx.lineWidth = widthList[i] * camera.zoom;
        mapCtx.moveTo(P1.x, P1.y);
        mapCtx.lineTo(P2.x, P2.y);
        mapCtx.lineTo(P3.x, P3.y);
        mapCtx.lineTo(P4.x, P4.y);
        mapCtx.closePath();
        mapCtx.stroke();
    }

    if(!grave.isOssuary)
    {
        if (map.displayGraveColor)
        {
            drawGraveColor(grave);
        }
        drawGraveNumber(grave);
    }

    if (modification.action == SET_GRAVE_DIRECTION)
    {
        drawGraveTriangles(grave);
    }
}

function drawGraves()
{
    for (var g = 0; g < elements.graves.length; ++g)
    {
        var grave = elements.graves[g];
        drawGrave(grave);
    }
}

function drawPolygons()
{
    for (var p = 0; p < elements.polygons.length; ++p)
    {
        var polygon = elements.polygons[p];
        drawPolygon(polygon);
    }
}

function drawRectangle(center, width, height, rotation, color="black")
{
    var center2 = projectPoint(center);
    var width2 = Math.round(width * camera.zoom);
    var height2 = Math.round(height * camera.zoom);

    mapCtx.strokeStyle = color;
    mapCtx.lineWidth = coeffWidthLine/2 * camera.zoom;

    mapCtx.save();
    mapCtx.translate(center2.x, center2.y);
    mapCtx.rotate(-rotation);
    mapCtx.beginPath();
    mapCtx.rect(-width2/2, -height2/2, width2, height2);
    mapCtx.stroke();
    mapCtx.restore();
}

function drawImage(element)
{
    if (element.info != "procedureLegend" || map.displayGraveColor)
    {
        var img = images[element.info];

        var center2 = projectPoint(element.center);

        var imgWidth = Math.round(element.size.w * camera.zoom);
        var imgHeight = Math.round(element.size.h * camera.zoom);

        mapCtx.save();
        mapCtx.translate(center2.x, center2.y);
        mapCtx.rotate(-element.rotation);
        mapCtx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        mapCtx.restore();

        // draw an arrow rotation
        if (element.isSelected)
        {
            drawRotationArrow(element);
        }
    }
}

function writeTextElement(textElement)
{
    mapCtx.textAlign = 'center';
    mapCtx.textBaseline = 'middle';
    mapCtx.lineJoin = 'round';
    var fontSize = Math.round(textElement.size.h * camera.zoom);
    mapCtx.lineWidth = coeffWidthLine*fontSize/100;
    mapCtx.font = 'normal ' + fontSize.toString() + 'px serif';

    if (textElement.type == "title")
    {
        mapCtx.fillStyle = 'black';
        mapCtx.strokeStyle = 'white';
    }
    // else standard text
    else
    {
        mapCtx.fillStyle = 'white';
        mapCtx.strokeStyle = 'black';
    }

    var center2 = projectPoint(textElement.center);

    mapCtx.save();
    mapCtx.translate(center2.x, center2.y);
    mapCtx.rotate(-textElement.rotation);
    mapCtx.strokeText(textElement.info, 0, 0);
    mapCtx.fillText(textElement.info, 0, 0);
    mapCtx.restore();

    mapCtx.lineJoin = 'miter';

    // draw a rotation arrow
    if (textElement.isSelected)
    {
        drawRotationArrow(textElement);
    }
}

function drawArrow(arrow)
{
    var lineWidth = coeffWidthLine * arrow.size.h/50;
    var width = arrow.size.w-lineWidth;
    var height = arrow.size.h-lineWidth;

    var P1 = {
        x: arrow.center.x - width/2,
        y: arrow.center.y - height/6
    };

    var P2 = {
        x: arrow.center.x + width/2 - 2/3*height,
        y: arrow.center.y - height/6
    };

    var P3 = {
        x: arrow.center.x + width/2 - 2/3*height,
        y: arrow.center.y - height/2
    };

    var P4 = {
        x: arrow.center.x + width/2,
        y: arrow.center.y
    };

    var P5 = {
        x: arrow.center.x + width/2 - 2/3*height,
        y: arrow.center.y + height/2
    };

    var P6 = {
        x: arrow.center.x + width/2 - 2/3*height,
        y: arrow.center.y + height/6
    };

    var P7 = {
        x: arrow.center.x - width/2,
        y: arrow.center.y + height/6
    };

    var pointList = [P1,P2,P3,P4,P5,P6,P7];

    mapCtx.beginPath();
    mapCtx.strokeStyle = 'black';
    mapCtx.fillStyle = 'white';
    mapCtx.lineWidth = lineWidth * camera.zoom;

    for (j = 0; j < pointList.length; j++)
    {
        var P = {
            x: pointList[j].x,
            y: pointList[j].y
        };
        P = rotateAround(P, arrow.center, arrow.rotation);
        P = projectPoint(P);

        if (j == 0)
        {
            mapCtx.moveTo(P.x, P.y);
        }
        else
            {
            mapCtx.lineTo(P.x, P.y);
        }
    }
    mapCtx.closePath();
    mapCtx.stroke();
    mapCtx.fill();
    
    if (isInModificationMode && arrow.isSelected) {
        drawRotationArrow(arrow);
    }
}

function drawInformations()
{
    for (var i = 0; i < elements.informationElements.length; ++i)
    {
        var element = elements.informationElements[i];
        switch (element.type)
        {
            case "image":
                drawImage(element);
                break;
            case "title":
            case "text":
                writeTextElement(element);
                break;
            case "arrow":
                drawArrow(element);
                break;
            case "scale":
                drawScale(element);
                break;
            default:
                console.error("It is strange, the type of the element is not recognized !");
        }

        if (element.isSelected)
        {
            var color = "#4d94ff";

            // draw selection rectangle
            drawRectangle(element.center, element.size.w, element.size.h, element.rotation, color);

            /* draw point at bottom right corner to indicate resizing action */
            if (element.type != "scale")
            {
                var P = {
                    x: element.center.x + element.size.w / 2,
                    y: element.center.y + element.size.h / 2
                };
                P = rotateAround(P, element.center, element.rotation);

                var radius = coeffWidthLine * 2;
                drawPoint(P, radius, color, true);
            }
        }
        else if (element.isHovered)
        {
            // draw selection rectangle
            drawRectangle(element.center, element.size.w, element.size.h, element.rotation);

        }
    }
}

function drawScale(scaleElement)
{
    var P = {
        "x" : scaleElement.center.x - scaleElement.size.w/2,
        "y" : scaleElement.center.y - scaleElement.size.h/2
    };

    if (scaleElement.info != null)
    {
        var P1 = {
            "x" : P.x,
            "y" : P.y + 3/2 * map.scale1m,
        };

        var P2 = {
            "x" : P1.x + map.scale1m,
            "y" : P1.y
        };

        var P3 = {
            "x" : P2.x + map.scale1m,
            "y" : P1.y
        };

        var P4 = {
            "x" : P3.x + map.scale1m,
            "y" : P1.y
        };

        var P5 = {
            "x" : P.x,
            "y" : P1.y + 11/10 * map.scale1m
        };

        /* write text "Echelle"*/

        mapCtx.textAlign = 'left';
        mapCtx.textBaseline = 'top';

        var fontSize = Math.round(map.scale1m * camera.zoom);
        var text = "Echelle :";
        mapCtx.font = 'normal ' + fontSize.toString() + 'px serif';

        mapCtx.fillStyle = 'black';

        P = projectPoint(P);

        mapCtx.fillText(text, P.x, P.y);


        /* draw the scale line */

        P1 = projectPoint(P1);
        P2 = projectPoint(P2);
        P3 = projectPoint(P3);
        P4 = projectPoint(P4);

        var lineWidth = fontSize / 2;
        mapCtx.lineWidth = lineWidth;

        mapCtx.strokeStyle = "#000000";
        mapCtx.fillStyle = "#000000";

        mapCtx.beginPath();
        mapCtx.moveTo(P1.x, P1.y);
        mapCtx.lineTo(P2.x, P2.y);
        mapCtx.stroke();

        mapCtx.strokeStyle = "#FFFFFF";
        mapCtx.beginPath();
        mapCtx.moveTo(P2.x, P2.y);
        mapCtx.lineTo(P3.x, P3.y);
        mapCtx.stroke();

        mapCtx.strokeStyle = "#000000";
        mapCtx.beginPath();
        mapCtx.moveTo(P3.x, P3.y);
        mapCtx.lineTo(P4.x, P4.y);
        mapCtx.stroke();

        mapCtx.lineWidth = 2 * camera.zoom;
        mapCtx.rect(P1.x, P1.y - lineWidth / 2, map.scale1m * 3 * camera.zoom, lineWidth);
        mapCtx.stroke();


        /* write "1m" */

        var fontSize = Math.round(map.scale1m * camera.zoom * 2 / 3);
        var text = "1 m"
        mapCtx.font = 'normal ' + fontSize.toString() + 'px serif';

        mapCtx.textBaseline = 'bottom';
        mapCtx.fillStyle = 'black';

        P5 = projectPoint(P5);
        mapCtx.fillText(text, P5.x, P5.y);
    }
    else
    {
        var P1 = {
            "x" : P.x,
            "y" : P.y + map.scale1m,
        };

        var P2 = {
            "x" : P.x,
            "y" : P.y + map.scale1m * 2,
        };

        P = projectPoint(P);
        P1 = projectPoint(P1);
        P2 = projectPoint(P2);

        /* write a warning to indicate the scale */

        mapCtx.textAlign = 'left';
        mapCtx.textBaseline = 'top';

        var fontSize = Math.round(map.scale1m * camera.zoom *2/3);
        mapCtx.font = 'normal ' + fontSize.toString() + 'px serif';
        mapCtx.fillStyle = 'red';

        var text = "Veuillez";
        mapCtx.fillText(text, P.x, P.y);

        var text = "indiquer";
        mapCtx.fillText(text, P1.x, P1.y);

        var text = "l'échelle";
        mapCtx.fillText(text, P2.x, P2.y);
    }
}

function drawFrame()
{
    var P = map.origin;
    P = projectPoint(P);

    width = Math.round(map.w * camera.zoom);
    height = Math.round(map.h * camera.zoom);

    mapCtx.strokeStyle = "black";
    mapCtx.lineWidth = image.width/150 * camera.zoom;

    mapCtx.beginPath();
    mapCtx.rect(P.x, P.y, width, height);
    mapCtx.stroke();
    mapCtx.restore();
}

function drawRectangleCenterPoint(rectangle)
{
    var radius = coeffWidthLine * rectangle.thicknessLine * 2;
    var P = projectPoint(rectangle.center);

    mapCtx.beginPath();
    mapCtx.strokeStyle = "#000000";
    mapCtx.fillStyle = "#4d94ff";
    mapCtx.lineWidth = coeffWidthLine * rectangle.thicknessLine * camera.zoom;
    mapCtx.arc(P.x, P.y, radius*camera.zoom,0, 2 * Math.PI);
    mapCtx.stroke();
    mapCtx.fill();
}

function drawRectangleElement(rectangle)
{
    var width = rectangle.size.w - (coeffWidthLine * 5/3 * rectangle.thicknessLine);
    var height = rectangle.size.h - (coeffWidthLine * 5/3 * rectangle.thicknessLine);

    var P1 = {
        x:rectangle.center.x-width/2,
        y:rectangle.center.y-height/2
    };
    var P2 = {
        x:rectangle.center.x+width/2,
        y:rectangle.center.y-height/2
    };
    var P3 = {
        x:rectangle.center.x+width/2,
        y:rectangle.center.y+height/2
    };
    var P4 = {
        x:rectangle.center.x-width/2,
        y:rectangle.center.y+height/2
    };

    var pointList= [P1, P2, P3, P4];
    var colorList = ["#000000","#FFFFFF"];
    var widthList = [coeffWidthLine*5/3*rectangle.thicknessLine, coeffWidthLine*rectangle.thicknessLine];

    if(rectangle.isHovered == true)
    {
        widthList[0] += 4;
    }

    if (rectangle.isSelected) {
        colorList[1] = "#4d94ff";
        if (isInModificationMode) {
            drawRotationArrow(rectangle);
            drawRectangleCenterPoint(rectangle);
        }
    }

    for (i = 0; i < colorList.length; i++) {
        mapCtx.beginPath();
        mapCtx.strokeStyle = colorList[i];
        mapCtx.lineWidth = widthList[i] * camera.zoom;

        for (j = 0; j < pointList.length; j++) {
            var P = {
                x: pointList[j].x,
                y: pointList[j].y
            };
            P = rotateAround(P, rectangle.center, rectangle.rotation);
            P = projectPoint(P);

            if (j == 0) {
                mapCtx.moveTo(P.x, P.y);
            }
            else {
                mapCtx.lineTo(P.x, P.y);
            }
        }
        mapCtx.closePath();
        mapCtx.stroke();
    }
}

function drawRectangles()
{
    for (var r = 0; r < elements.rectangles.length; ++r)
    {
        var rectangle = elements.rectangles[r];
        drawRectangleElement(rectangle);
    }
}

function drawARectangleColor(center, color)
{
    var width = 40;
    var height = 40;

    var P1, P2, P3, P4;

    P1 = {
        x: center.x - width / 2,
        y: center.y - height / 2
    };
    P2 = {
        x: center.x + width / 2,
        y: center.y - height / 2
    };
    P3 = {
        x: center.x + width / 2,
        y: center.y + height / 2
    };
    P4 = {
        x: center.x - width / 2,
        y: center.y + height / 2
    };

    mapCtx.beginPath();

    mapCtx.strokeStyle = "#000000";

    if (color == NO_COLOR)
    {
        mapCtx.fillStyle = "#FFFFFF";
    }
    else if (color == YELLOW)
    {
        mapCtx.fillStyle = "#fff200";
    }
    else if (color == RED)
    {
        mapCtx.fillStyle = "#ff0000";
    }
    else if (color == RED_YELLOW)
    {
        mapCtx.fillStyle = "#ff0000";
    }
    else
    {
        console.error("The color is not recognized");
    }

    if (modification.color == color) {
        mapCtx.lineWidth = 10;
    }
    else
    {
        mapCtx.lineWidth = 2;
    }

    mapCtx.moveTo(P1.x, P1.y);
    mapCtx.lineTo(P2.x, P2.y);
    mapCtx.lineTo(P3.x, P3.y);
    mapCtx.lineTo(P4.x, P4.y);
    mapCtx.closePath();
    mapCtx.stroke();
    mapCtx.fill();

    if (color == RED_YELLOW)
    {
        width = width * 2/3;
        height = height * 2/3;

        P1 = {
            x: center.x - width / 2,
            y: center.y - height / 2
        };
        P2 = {
            x: center.x + width / 2,
            y: center.y - height / 2
        };
        P3 = {
            x: center.x + width / 2,
            y: center.y + height / 2
        };
        P4 = {
            x: center.x - width / 2,
            y: center.y + height / 2
        };

        mapCtx.fillStyle = "#fff200";
        mapCtx.beginPath();
        mapCtx.moveTo(P1.x, P1.y);
        mapCtx.lineTo(P2.x, P2.y);
        mapCtx.lineTo(P3.x, P3.y);
        mapCtx.lineTo(P4.x, P4.y);
        mapCtx.closePath();
        mapCtx.fill();
    }

}

function drawRectangleColors()
{
    var colors = [NO_COLOR, YELLOW, RED, RED_YELLOW];

    for (var i = 0; i < colors.length; i++)
    {
        var C =  {
            x: mapCtx.canvas.width - 30,
            y: 50 * (i+1)
        };
        drawARectangleColor(C, colors[i]);
    }
}

function drawElements(clear=true) {
    if (clear)
    {
        mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    }

    drawGraves();
    drawRectangles();
    drawPolygons();
    drawInformations();

    if (modification.action == SET_GRAVE_COLOR)
    {
        drawRectangleColors();
    }
}

function drawAirPhoto()
{
    photoCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
    photoCtx.fillStyle = "#FFFFFF";
    photoCtx.fillRect(0, 0, photoCanvas.width, photoCanvas.height);

    if (map.displayBackground)
    {
        var img = images["airPhoto"];

        var imgWidth = Math.round(img.naturalWidth * camera.zoom);
        var imgHeight = Math.round(img.naturalHeight * camera.zoom);

        var origin = {x: 0, y: 0};
        origin = projectPoint(origin);
        photoCtx.drawImage(img, origin.x, origin.y, imgWidth, imgHeight);
    }
}