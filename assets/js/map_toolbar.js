
function initToolbar() {
    modification.action = NO_ACTION;
    document.body.style.cursor = "auto";

    var buttons = document.getElementsByClassName("btn");

    for(var i = 0; i < buttons.length; i++) {
        buttons[i].style.cursor = "pointer";
    }

}

document.getElementById("toolbar").addEventListener('click', e => {
    deselectElement();
    drawElements();
});

document.getElementById("deleteButton").addEventListener('click', e => {
    // new click
    if (!(modification.action == DELETE))
    {
        modification.action = DELETE;
        document.body.style.cursor = "not-allowed";
        document.getElementById("deleteButton").style.cursor = "not-allowed";

    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("drawGraveButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_GRAVE))
    {
        modification.action = ADD_GRAVE;
        document.body.style.cursor = "crosshair";
        document.getElementById("drawGraveButton").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("drawPolygonButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_POLYGON))
    {
        modification.action = ADD_POLYGON;
        modification.pointList = [];
        document.body.style.cursor = "crosshair";
        document.getElementById("drawPolygonButton").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("drawRectangleButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_RECTANGLE))
    {
        modification.action = ADD_RECTANGLE;
        document.body.style.cursor = "crosshair";
        document.getElementById("drawRectangleButton").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("compass").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_IMAGE))
    {
        modification.action = ADD_IMAGE;
        modification.element = "compass";
        document.body.style.cursor = "crosshair";
        document.getElementById("compass").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("faucet").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_IMAGE))
    {
        modification.action = ADD_IMAGE;
        modification.element = "faucet";
        document.body.style.cursor = "crosshair";
        document.getElementById("faucet").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("bin").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_IMAGE))
    {
        modification.action = ADD_IMAGE;
        modification.element = "bin";
        document.body.style.cursor = "crosshair";
        document.getElementById("bin").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("addTextButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_TEXT))
    {
        modification.action = ADD_TEXT;
        document.body.style.cursor = "crosshair";
        document.getElementById("addTextButton").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("addArrowButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == ADD_ARROW))
    {
        modification.action = ADD_ARROW;
        document.body.style.cursor = "crosshair";
        document.getElementById("addArrowButton").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("copyButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == COPY))
    {
        modification.action = COPY;
        document.body.style.cursor = "copy";
        document.getElementById("copyButton").style.cursor = "copy";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("displayBackground").addEventListener('click', e =>
{
    var display = document.getElementById("displayBackground");

    if (display.checked) {
        map.displayBackground = true;
    }
    else
    {
        map.displayBackground = false;
    }
    refresh();

});

document.getElementById("displayGraveColor").addEventListener('click', e =>
{
    var display = document.getElementById("displayGraveColor");

    if (display.checked) {
        map.displayGraveColor = true;
    }
    else
    {
        map.displayGraveColor = false;
    }
    refresh();

});


document.getElementById("setGraveColorButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == SET_GRAVE_COLOR))
    {
        modification.action = SET_GRAVE_COLOR;
        modification.color = null;

        document.getElementById("displayGraveColor").checked = true;
        map.displayGraveColor = true;

    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("setGraveDirectionButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == SET_GRAVE_DIRECTION))
    {
        modification.action = SET_GRAVE_DIRECTION;
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("setScaleButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == SET_SCALE))
    {
        modification.action = SET_SCALE;
        modification.startPoint = null;
        document.body.style.cursor = "crosshair";
        document.getElementById("setScaleButton").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("measureButton").addEventListener('click', e =>
{
    // new click
    if (!(modification.action == MEASURE))
    {
        modification.action = MEASURE;
        modification.startPoint = null;
        document.body.style.cursor = "crosshair";
        document.getElementById("measureButton").style.cursor = "crosshair";
    }
    // click again
    else
    {
        initToolbar();
    }
});

document.getElementById("saveButton").addEventListener('click', e =>
{
    downloadJSONFile("plan.json", map);
});

document.getElementById("downloadImageButton").addEventListener('click', e =>
{
    openCanvasWindow();
});

document.getElementById("closeButton").addEventListener('click', e =>
{
    window.close();
});

document.getElementById("defaultCursorButton").addEventListener('click', e =>
{
    initToolbar();
});