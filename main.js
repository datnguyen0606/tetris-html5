
var ANIM_DURATION = 150;
var FRAME_DELAY = 10;

var WIDTH = 300;
var HEIGHT = 480;

var cubeW = 30;
var cubeH = 30;
var cubeUnit = 28;
var cubeBorder = 2;

var score = 0;

var keys = {
    down: false,
    right: false,
    left: false,
    up: false
};

var COLORS = [];
var colors_number = 10;
var colors_index = 0;

var default_topLeft = {row: 0, col: 4};

var PIECES = [
    {
        rotations: [
            [[0,1],
             [0,1],
             [1,1]],
            [[1,0,0],
             [1,1,1]],
            [[1,1],
             [1,0],
             [1,0]],
            [[1,1,1],
             [0,0,1]]
        ],
        default_topLeft: default_topLeft
    },
    {
        rotations: [
            [[1,0],
             [1,0],
             [1,1]],
            [[1,1,1],
             [1,0,0]],
            [[1,1],
             [0,1],
             [0,1]],
            [[0,0,1],
             [1,1,1]]
        ],
        default_topLeft: default_topLeft
    },
    {
        rotations: [
            [[1,1],
             [1,1]]            
        ],
        default_topLeft: default_topLeft
    },
    {
        rotations: [
            [[0,1,0,0],
             [0,1,0,0],
             [0,1,0,0],
             [0,1,0,0]],
            [[0,0,0,0],
             [1,1,1,1],
             [0,0,0,0],
             [0,0,0,0]]
        ],
        default_topLeft: default_topLeft
    },
    {
        rotations: [
            [[1,1,0],
             [0,1,1]],
            [[0,1],
             [1,1],
             [1,0]]
        ],
        default_topLeft: default_topLeft
    },
    {
        rotations: [
            [[0,1,1],
             [1,1,0]],
            [[1,0],
             [1,1],
             [0,1]]
        ],
        default_topLeft: default_topLeft
    },
    {
        rotations: [
            [[0,1,0],
             [1,1,1]],
            [[1,0],
             [1,1],
             [1,0]],
            [[1,1,1],
             [0,1,0]],
            [[0,1],
             [1,1],
             [0,1]] 
        ],
        default_topLeft: default_topLeft
    }
];


var canvas, ctx;
var current_piece = null;
var next_piece = null;
var container = new Array(16);
var maxRow = 16;
var maxCol = 10;

var down_speed = 1000;
var ended = false;

var random_seed = 4;
function getRandomInt (min, max) {
    var temp = max * random_seed - 1;
    temp = Math.floor(Math.random() * (temp - min + 1)) + min;
    return temp % max;
    //return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPiece() {
    var idx = getRandomInt(0, PIECES.length);
    var p = PIECES[idx];
    var shape_idx = getRandomInt(0, p.rotations.length);
    var color = getNextColor();
    var piece = {
        idx: idx,
        shape_idx: shape_idx,
        shape: p.rotations[shape_idx],
        topLeft: p.default_topLeft,
        nextPos: p.default_topLeft,
        color: color
    };
    return piece;
}

function mappingPosition(row, col) {
    return [col*cubeW, row*cubeH];
}

function init_container() {
    for (var i=0; i < maxRow; i++) {
        container[i] = new Array(maxCol);
        for (var j=0; j < maxCol; j++) {
            container[i][j] = "";
        }
    }
}

function init_colors(depth) {
    COLORS = [];
    var h,s,l,a;
    var pie = 360/(depth-0.5);
    for(var i=0; i<depth; ++i) {
        h = i*pie;
        s = 90;
        l = 50;
        a = 1.0;
        COLORS.push([h,s,l,a]);
    }
}

function checkPossibleShape(shape) {
    var curr_col, curr_row;    
    for (var row=0; row < shape.length; row++) {
        for (var col=0; col < shape[row].length; col++) {
            if (shape[row][col] == 1) {
                curr_col = col + current_piece.topLeft.col;
                curr_row = row + current_piece.topLeft.row;
                if (curr_col < 0 || curr_col >= maxCol || curr_row >= maxRow) {                
                    // out of range
                    return false;
                }
                if (container[curr_row][curr_col] != "") {
                    // space is taken by something else
                    return false;
                } 
            }
        }
    }
    return true;
}

function getNextColor() {
    var c = COLORS[colors_index];
    colors_index = (colors_index + 1) % colors_number;
    c = "hsla("+c[0]+","+c[1]+"%,"+(c[2]-30)+"%,"+c[3]+")";
    return c;
}

function getNextShape() {
    var p = PIECES[current_piece.idx];
    var shape_idx = (current_piece.shape_idx + 1) % p.rotations.length;
    var shape = p.rotations[shape_idx];

    if (checkPossibleShape(shape)) {
        current_piece.shape = shape;
        current_piece.shape_idx = shape_idx;
    }    
}

function drawLayer() {
    ctx.beginPath();
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'rgba(23,23,23,1)';
    ctx.fill();
}

function drawGame() {
    var pos;
    for (var i=0; i < maxRow; i++) {
        for (var j=0; j < maxCol; j++) {
            if (container[i][j] != "") {
                // draw it
                pos = mappingPosition(i, j);
                drawCubic(pos[0], pos[1], container[i][j]);
            }
        }
    }
}

function drawCubic(x, y, color) {
    ctx.beginPath();
    ctx.rect(x, y, cubeUnit, cubeUnit);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = cubeBorder;
    ctx.stroke();
}

function drawNextPiece(piece) {
    if (piece == null)
        return
    nextCube_ctx.clearRect(0, 0, nextCube.width, nextCube.height);

    var shape = piece.shape;
    var pos;

    for (var row=0; row < shape.length; row++) {
        for (var col=0; col < shape[row].length; col++) {
            if (shape[row][col] == 1) {
                pos = mappingPosition(row + 1, col + 1);

                nextCube_ctx.beginPath();
                nextCube_ctx.rect(pos[0], pos[1], cubeUnit, cubeUnit);
                nextCube_ctx.fillStyle = piece.color;
                nextCube_ctx.fill();
                nextCube_ctx.lineWidth = cubeBorder;
                nextCube_ctx.stroke();
            }
        }
    }
}

function drawPiece(piece) {
    if (piece == null)
        return
    var shape = piece.shape;
    var pos;

    for (var row=0; row < shape.length; row++) {
        for (var col=0; col < shape[row].length; col++) {
            if (shape[row][col] == 1) {
                if (row < 0) {
                    continue;
                }
                pos = mappingPosition(row + piece.topLeft.row, col + piece.topLeft.col);
                drawCubic(pos[0], pos[1], piece.color);
            }
        }
    }
}

function detectEndGame() {
    // simple checking: check the current piece
    var curr_col, curr_row;    
    for (var row=0; row < current_piece.shape.length; row++) {
        for (var col=0; col < current_piece.shape[row].length; col++) {
            if (current_piece.shape[row][col] == 1) {
                curr_col = col + current_piece.topLeft.col;
                curr_row = row + current_piece.topLeft.row;

                if (container[curr_row][curr_col] != "") {                  
                    return true;
                }
            }            
        }
    }
}

function detectCompletedRows() {
    var isFilled = false;
    var icount = 0;
    var completedRows = [];
    for (var row=maxRow-1; row > -1; row--) {
        icount = 0;
        for (var col=0; col < maxCol; col++) {
            if (container[row][col] != "") {
                icount++;
            }
        }
        if (icount == maxCol) {
            completedRows.push(row);
        }        
    }
    return completedRows;
}

function updateScore(num) {
    switch (num) {
        case 1:
            score += 2;
            break;
        case 2:
            score += 4;
            break;
        case 3:
            score += 7;
            break;
        case 4:
            score += 10;
            break;
    }
    document.getElementById("score").innerHTML = score
}

function clearRows() {
    rows = detectCompletedRows();
    if (rows.length == 0) {
        return;
    }

    var last_row = rows[rows.length-1];
    container.splice(last_row, rows.length);

    for (var i=0; i < rows.length; i++) {
        container.splice(0, 0, new Array(maxCol));
        for (var j=0; j < maxCol; j++) {
            container[0][j] = "";
        }
    }

    updateScore(rows.length);
}

function landingPiece() {
    var curr_col, curr_row;    
    for (var row=0; row < current_piece.shape.length; row++) {
        for (var col=0; col < current_piece.shape[row].length; col++) {
            if (current_piece.shape[row][col] == 1) {
                curr_col = col + current_piece.topLeft.col;
                curr_row = row + current_piece.topLeft.row;
                container[curr_row][curr_col] = current_piece.color;
            }
        }
    }
    
    current_piece = null;

    current_piece = next_piece;
    next_piece = getRandomPiece();
    drawNextPiece(next_piece);

    clearRows();    
    reDraw();
}
/*
  Note: 'row' will be a 'y-axis' in container array
*/
function checkCollision() {
    var curr_col, curr_row;    
    for (var row=0; row < current_piece.shape.length; row++) {
        for (var col=0; col < current_piece.shape[row].length; col++) {
            if (current_piece.shape[row][col] == 1) {
                curr_col = col + current_piece.nextPos.col;
                curr_row = row + current_piece.nextPos.row;
                
                if (curr_col < 0 || curr_col >= maxCol) {                
                    // out of height range
                    return true;
                }
                if (curr_row >= maxRow) {
                    // the cube lands on the ground, add the piece to the container
                    // continue to generate new piece, and clear the lines if it's neccessary
                    landingPiece();
                    return true;               
                }
                if (container[curr_row][curr_col] != "") {
                    // space is taken by something else                    
                    if (current_piece.topLeft.row+1 == current_piece.nextPos.row &&
                            current_piece.topLeft.col == current_piece.nextPos.col) {
                        landingPiece();
                    }                    
                    return true;
                }
            }            
        }
    }
    return false;
}

function move(state) {
    switch (state) {
        case 'right':
            current_piece.nextPos = {
                row: current_piece.topLeft.row,
                col: current_piece.topLeft.col + 1
            };
            break;
        case 'left':
            current_piece.nextPos = {
                row: current_piece.topLeft.row,
                col: current_piece.topLeft.col - 1
            };
            break;
        case 'down':
            current_piece.nextPos = {
                row: current_piece.topLeft.row + 1,
                col: current_piece.topLeft.col
            };
            break;
        case 'rotate':
            getNextShape();
            break;
        default:
            return;
    }

    if ( !checkCollision() ) {
        current_piece.topLeft = current_piece.nextPos;
    }
}

window.requestAnimFrame = (function(callback) {
  return function (callback) {
    window.setTimeout(callback, down_speed);
  };
}) ();

function reDraw() {    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLayer();
    drawGame();
    if (current_piece != null) {
        drawPiece(current_piece);
    }
}

function running() {
    if (is_pause) {
        return;
    }
    if (detectEndGame()) {
        ended = true;
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLayer();
    drawGame();    
    if (current_piece != null) {
        move('down');
        drawPiece(current_piece);
    }

    requestAnimFrame(function() {
        running();
    }); 
}

var is_pause = false;
function pause() {
    document.getElementById("pause").style.display = 'none';
    document.getElementById("resume").style.display = 'inline-block';
    is_pause = true;
}
function resume() {
    document.getElementById("pause").style.display = 'inline-block';
    document.getElementById("resume").style.display = 'none';
    is_pause = false;
    running();
}

function start() {
    document.getElementById("start").style.display = 'none';
    document.getElementById("pause").disabled = false;
    document.getElementById("stop").style.display = 'inline-block';

    current_piece = getRandomPiece();
    next_piece = getRandomPiece();
    
    drawNextPiece(next_piece);
    drawPiece(current_piece);

    requestAnimFrame(function() {
        running();
    });
}

function stop() {
    location.reload();
}

function init()
{
    canvas = document.getElementById('mycanvas');
    ctx = canvas.getContext('2d');

    nextCube = document.getElementById("nextCube");
    nextCube_ctx = nextCube.getContext('2d');

    init_colors(colors_number);
    init_container();
    drawLayer();
    //start();
}

init();

document.addEventListener('keydown', function(e) {key_handler(e, true)}, false);
//document.addEventListener('keydown', function(e) {key_handler(e, false)}, false);

function key_handler(event, status) {
    if (ended || is_pause) {
        return false;
    }
    switch(event.keyCode) {
        case 40://DOWN ARROW
            keys.down = status;
            move('down');
            break;
        case 39://RIGHT ARROW
            keys.right = status;
            move('right');
            break;
        case 37://LEFT ARROW
            keys.left = status;
            move('left');      
            break;
        case 38://UP ARROW
            keys.up = status;
            move('rotate');
            break;
        default:
            return true;
    }
    reDraw();
    event.preventDefault();
    return false;
}