function addInformationElement(type, info, P, size, rotation=0)
{
    var element = {
        "category": "informationElements",
        "type": type,
        "info": info,
        "center":
            {
                "x": P.x,
                "y": P.y
            },
        "size":
            {
                "w": size.w,
                "h": size.h
            },
        "rotation": rotation
    };
    informationElements.push(element);
    selectElement(element);
}

function addImage(name, P)
{
    var img = images[name];

    var size = {
        "w": img.naturalWidth * map.scale1m / 200,
        "h": img.naturalHeight * map.scale1m / 200
    };

    if (name == "compass") {
        size.w *= 8;
        size.h *= 8;
    }
    else if (name == "logo" || name == "procedureLegend") {
        size.w *= 4;
        size.h *= 4;
    }

    addInformationElement("image", name, P, size);
}

function getTextSize(text, fontSize)
{
    mapCtx.font = 'normal ' + fontSize.toString() + 'px serif';
    var textWidth = mapCtx.measureText(text).width;

    return {
        "w": textWidth,
        "h": fontSize
    };
}

function addText(text, P, fontSize=map.scale1m)
{
    addInformationElement("text", text, P, getTextSize(text,fontSize));
}

function addArrow(P, width, height)
{
    var size = {
        "w": width,
        "h": height
    };
    addInformationElement("arrow", null, P, size);
}

function addTitle()
{
    var fontSize = Math.round(image.width / 10);
    var text = "Cimetière de ...";
    //var text = "Cimetière de " + map.name;
    text = text.toUpperCase();

    var P = {
        "x": image.width - map.w/2,
        "y": -fontSize/2 - map.scale1m
    };

    addInformationElement("title", text, P, getTextSize(text,fontSize));
}

// Calculate dimensions of the scale element
function getScaleElementSize()
{
    var fontSize = Math.round(map.scale1m);
    mapCtx.font = 'normal ' + fontSize.toString() + 'px serif';
    var text = "Echelle :";
    var textWidth = mapCtx.measureText(text).width;

    var size = {
        "w": Math.max(textWidth, 3 * map.scale1m),
        "h": 13/5 * map.scale1m
    };

    return size;
}

function updateScaleElement()
{
    var scaleElement = getScaleElement();
    scaleElement.info = map.scale1m;
    scaleElement.size = getScaleElementSize();
}

function addScale()
{
    var size = getScaleElementSize();

    var P = {
        "x" : -size.w/2 - map.scale1m,
        "y" : image.height - 1000
    };

    addInformationElement("scale", null, P, size);
}

function getScaleElement()
{
    var scaleElement;
    for (var i = 0; i < informationElements.length; ++i)
    {
        var element = informationElements[i];

        if (element.type == "scale")
        {
            scaleElement = element;
            break;
        }
    }
    return scaleElement;
}

function addProcedureLegend()
{
    var P = {
        "x" : -image.width / 4,
        "y" : map.h -image.height / 2
    };
    addImage("procedureLegend", P);
}

function addLogo()
{
    var img = images["logo"];

    var P = {
        "x" : -(img.naturalWidth * map.scale1m / 200)*2 - map.scale1m,
        "y" : image.height -(img.naturalHeight * map.scale1m / 200)*2 - map.scale1m
    };
    addImage("logo", P);
}

function testPointOnInformationElement(P, element)
{
    return testPointOnRectangle(P, element.center, element.size.w, element.size.h, element.rotation);
}

function testPointOnResizingPoint(P, element)
{
    var C = {
        x: element.center.x + element.size.w/2,
        y: element.center.y + element.size.h/2
    };
    C = rotateAround(C, element.center, element.rotation);

    var radius = coeffWidthLine * 3;

    return testPointInCircle(P, C, radius);
}

function copyInformationElement(element)
{
    var copiedElement = {
        "category": "informationElements",
        "type": element.type,
        "info": element.info,
        "center": {
            "x": element.center.x,
            "y": element.center.y
        },
        "size": {
            "w": element.size.w,
            "h": element.size.h
        },
        "rotation": element.rotation
    }

    return copiedElement;
}