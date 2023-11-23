var graves;
var polygons;
var rectangles;
var informationElements;

var elements;
var map;

var imageSources = {
    airPhoto: "data/photo_aerienne.jpg",
    procedureLegend: "images/legende_PDR.png",
    logo: "images/logo_Ad_Vitam.png",
    compass: "images/boussole.png",
    faucet: "images/robinet.png",
    bin : "images/poubelle.png"
};

var images = {};

// air photo
var image = {
    'width': null,
    'height': null
};

var camera = {
    "center": {
        "x": 0,
        "y": 0
    },
    "zoom": 1
};

var photoCanvas = document.getElementById("photoCanvas");
var photoCtx = photoCanvas.getContext("2d");

var mapCanvas = document.getElementById("mapCanvas");
var mapCtx = mapCanvas.getContext("2d");

var coeffWidthLine;
var selectionDistTolerance;

const TOP_LEFT_CORNER = 1;
const TOP_RIGHT_CORNER = 2;
const BOTTOM_RIGHT_CORNER = 3;
const BOTTOM_LEFT_CORNER = 4;
const TOP_SIDE = 12;
const RIGHT_SIDE = 23;
const BOTTOM_SIDE = 34;
const LEFT_SIDE = 41;

const VERTICAL = 0;
const NWSE_DIAGONAL = 1;
const HORIZONTAL = 2;
const NESW_DIAGONAL = 3;

/* modification action */
const NO_ACTION = 0;

const MOVE = 2;
const RESIZE = 3;
const ROTATE = 4;
const SET_GRAVE_DIRECTION = 5;
const SET_GRAVE_COLOR = 6;

const COPY = 9;
const DELETE = 10;

const ADD_GRAVE = 11;
const ADD_POLYGON = 12;
const ADD_RECTANGLE = 13;
const ADD_IMAGE = 15;
const ADD_TEXT = 16;
const ADD_ARROW = 17;

const SET_SCALE = 20;
const MEASURE = 21;

/* grave colors */
const NO_COLOR = 0;
const YELLOW = 1;
const RED = 2;
const RED_YELLOW = 3;



/* 0 : map not modifiable
   1: map modifiable
 */
var isInModificationMode = 1;
var modification = {
    mode: isInModificationMode,
    action: NO_ACTION
};
var selectedElement = null;
var hoveredElement = null;