
$(document).ready(function () {
    //Canvas stuff
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();
    
    var paused = false;

    //Lets save the cell width in a variable for easy control
    var cw = 60;
    var mineDensity = 0.1;
    var minefield;  // mines stored here
    
    // width ond height as cells
    var xCells = Math.floor(w / cw);
    var yCells = Math.floor(h / cw);
    
    var playField = init2DArray(xCells, yCells);  // field to be painted
    var spreadTemp = [];

    var emptyCellCount = xCells * yCells;
    var mineCount = 0;
    
    // field codes
    // M = Mine
    // E = Untouched
    // 0 = visited, no mines
    // Any number between 1 and 9 = Mines nearby
    // F = Flagged

    function init(restart)
    {
        if (restart) {
            xCells = Math.floor(w / cw);
            yCells = Math.floor(h / cw);
            
            playField = init2DArray(xCells, yCells);  // field to be painted
            spreadTemp = [];

            paused = false;

            emptyCellCount = xCells * yCells;
            mineCount = 0;
        }

        makefield();
        console.log("x:", xCells);
        console.log("y:", yCells);
        //update stuff every 10ms
        if (typeof game_loop != "undefined")
            clearInterval(game_loop);
        game_loop = setInterval(paint, 100);
        
        paint();
    }
    init(false);

    //Paint all the things!!
    function paint()
    {
        // don't paint if game is paused
        if (paused) return;
        
        
        //Fill with white and create black outline
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, w, h);

        // paint gamefield
        for (var x = 0; x < xCells; x++) {
            for (var y = 0; y < yCells; y++) {
                if (playField[x][y] === "E") {
                    paint_cell(x, y, "#009F06");
                } else if (playField[x][y] === 0) {
                    paint_cell(x, y, "#04E00A");
                } else if (playField[x][y] > 0 || playField[x][y] < 10) {
                    paint_cell(x, y, "#04E00A");
                    drawText(playField[x][y], (x*cw + cw/2), (y*cw + cw/2), ((cw/2) + "px Arial"));
                } else if (playField[x][y] === "F") {
                    paint_cell(x, y, "#FFCC00");
                }
            }
        }
//paintMines();
        // paint cell borders
        paintCellBorders();
        
    }

    function paint_cell(x, y, color)
    {
        color = color || "blue";
        ctx.fillStyle = color;
        ctx.fillRect(x * cw, y * cw, cw, cw);
        ctx.strokeStyle = "white";
        ctx.strokeRect(x * cw, y * cw, cw, cw);
    }

    function makefield() {
        minefield = init2DArray(xCells, yCells);
        
        for (var x = 0; x < xCells; x++) {
            for (var y = 0; y < yCells; y++) {
                if (Math.random() < mineDensity) {
                    minefield[x][y] = "M";
                    mineCount++;
                }
            }
        }
    }

    function getMouseXY(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function getClickedCell(evt) {
        var mousePoint = getMouseXY(evt);
        return {
            x: Math.floor(mousePoint.x / cw),
            y: Math.floor(mousePoint.y / cw)
        };
    }
    
    function countNearbyMines(x, y) {
        var minecount = 0;
        // top
        if (isMineCell(x, y-1)) minecount++;
        // bottom
        if (isMineCell(x, y+1)) minecount++;
        // left
        if (isMineCell(x-1, y)) minecount++;
        // bottom
        if (isMineCell(x+1, y)) minecount++;
        // topleft
        if (isMineCell(x-1, y-1)) minecount++;
        // topright
        if (isMineCell(x+1, y-1)) minecount++;
        // bottomleft
        if (isMineCell(x-1, y+1)) minecount++;
        // bottomright
        if (isMineCell(x+1, y+1)) minecount++;
        return minecount;
    }

    function getNeighbourNumCells(x, y) {
        var neigbours = [];
        // top
        if (countNearbyMines(x, y-1) !== 0) neigbours.push({ x: x, y: y-1 });
        // bottom
        if (countNearbyMines(x, y+1) !== 0) neigbours.push({ x: x, y: y+1 });
        // left
        if (countNearbyMines(x-1, y) !== 0) neigbours.push({ x: x-1, y: y });
        // bottom
        if (countNearbyMines(x+1, y) !== 0) neigbours.push({ x: x+1, y: y });
        // topleft
        if (countNearbyMines(x-1, y-1) !== 0) neigbours.push({ x: x-1, y: y-1 });
        // topright
        if (countNearbyMines(x+1, y-1) !== 0) neigbours.push({ x: x+1, y: y-1 });
        // bottomleft
        if (countNearbyMines(x-1, y+1) !== 0) neigbours.push({ x: x-1, y: y+1 });
        // bottomright
        if (countNearbyMines(x+1, y+1) !== 0) neigbours.push({ x: x+1, y: y+1 });
        return neigbours;
    }
    
    function getEmptyNeigbours(x, y) {
        var neigbours = [];
        // top
        if (isEmptyCell(x, y-1)) neigbours.push({ x: x, y: y-1 });
        // bottom
        if (isEmptyCell(x, y+1)) neigbours.push({ x: x, y: y+1 });
        // left
        if (isEmptyCell(x-1, y)) neigbours.push({ x: x-1, y: y });
        // bottom
        if (isEmptyCell(x+1, y)) neigbours.push({ x: x+1, y: y });
        
        return neigbours;
    }
    
    function isValidCell(x, y) {
        if (x < 0 || x > xCells-1) return 0;  // x out of bounds
        if (y < 0 || y > yCells) return 0;  // y out of bounds
        return 1;
    }
    
    function isMineCell(x, y) {
        if (!isValidCell(x, y)) return 0;
        if (minefield[x][y] === "M") return 1;
        else return 0;
    }
    
    function isEmptyCell(x, y) {
        if (!isValidCell(x, y)) return 0;
        if (
                playField[x][y] === "E"
                && !isMineCell(x, y)
                && countNearbyMines(x, y) === 0
            ) { 
            return 1; 
        }
        else return 0;
    }
    
    function drawLine(x1, y1, x2, y2, color) {
        color = color || "black";
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    function drawText(text, x, y, font, color) {
        font = font || ( (cw/2) + "px Arial" );
        color = color || "black";
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text, x, y);
    }
    
    function paintCellBorders() {
        for (var x = 0; x < w; x += cw) {
            drawLine(x, 0, x, h);
        }
        for (var y = 0; y < h; y += cw) {
            drawLine(0, y, w, y);
        }
    }
    
    function init2DArray(w,h) {
        var arr = [];
        var row;
        for (var i = 0; i < w; i++) {
            row = [];
            for (var j = 0; j < h; j++) {
                row.push("E");
            }
            arr.push(row);
        }
        return arr;
    }
    
    function paintMines() {
        // paint mines
        for (var x = 0; x < xCells; x++) {
            for (var y = 0; y < yCells; y++) {
                if (minefield[x][y] === "M") {
                    paint_cell(x, y, "red");
                }
            }
        }
    }

    var spreadNearToMines = function () {
        spreadTemp.forEach(function(cell) {
            var numCells = getNeighbourNumCells(cell.x, cell.y);
            if (numCells.length !== 0) {
                numCells.forEach(function(numcellToSpreadTo) {
                    if (isValidCell(numcellToSpreadTo.x, numcellToSpreadTo.y)) {
                        var mCount = countNearbyMines(numcellToSpreadTo.x, numcellToSpreadTo.y);
                        playField[numcellToSpreadTo.x][numcellToSpreadTo.y] = mCount;
                    }
                });
            }
        });
    }
    
    var spreadEmptyArea = function (x, y) {
        // invalid cases
        if (!isValidCell(x, y)) return 0;       // can't spread there
        if (!playField[x][y] === "E") return 0; // can't spread there
        
        spreadTemp.push({x: x, y: y});

        // mark this cell visited
        playField[x][y] = 0;
        
        var validNeigbours = getEmptyNeigbours(x, y);

        var i;
        validNeigbours.forEach(function(neigbour) {
            console.log("Spreading to X:", neigbour.x, "Y:", neigbour.y);
            
            spreadEmptyArea(neigbour.x, neigbour.y);
        });

        return 1;
    }

    function countAllUnvisitedCells() {
        var count = 0;
        for (var x = 0; x < xCells; x++) {
            for (var y = 0; y < yCells; y++) {
                if (playField[x][y] === "E" || playField[x][y] === "F") {
                    count++;
                }
            }
        }
        return count;
    }
    
    function toggleFlag(x, y) {
        if (playField[x][y] === "F") {
            playField[x][y] = "E";
        } else if (playField[x][y] === "E") {
            playField[x][y] = "F";
        }
    }
    
    function isFlagged(x, y) {
        if (playField[x][y] === "F") return 1;
        return 0;
    }
    
    function gameOver(x, y) {
        // game over
        // do something about it
        console.log("BOOOM!!\nYou stepped at mine and blew into million pieces.\nGame over.");
        
        // show all mines
        paintMines();
        // paint cell we stepped to black
        paint_cell(x, y, "black");
        
        paintCellBorders();

        // game over texts
        drawText("BOOM!", (w/2) - 140, (h/2) + 0, "60px \"Comic Sans MS\"", "#ff3399" );
        drawText("Game Over!", (w/2) - 180, (h/2) + 60, "60px \"Comic Sans MS\"", "#ff3399" );
    }

    function victory() {
        paused = true;
        console.log("Victory!");
        drawText("--- VICTORY ---", (w/2) - 220, (h/2) + 10, "60px \"Comic Sans MS\"", "orange" );
        return;
    }

    function checkVictory() {
        emptyCellCount = countAllUnvisitedCells();
        if (emptyCellCount == mineCount) {
            paint();
            victory();
        }
    }
    
    // mouse events
    canvas.addEventListener("click", function(evt) {
        var pos = getClickedCell(evt);
        console.log("P:", pos);
        console.log("CLICKED AT: (" + pos.x + ", " + pos.y + ")\n mines nearby: " + countNearbyMines(pos.x, pos.y));

        // do what is needed to do
        if (isFlagged(pos.x, pos.y)) {
            // flagged cell, pass
        }
        else if (isMineCell(pos.x, pos.y)) {
            // don't allow to change mine position we stepped into
            if (!paused) gameOver(pos.x, pos.y);
            paused = true;
            
        } else {
            var minescount = countNearbyMines(pos.x, pos.y);
            if (minescount === 0) {
                playField[pos.x][pos.y] = 0;
                
                // spread empty area
                spreadTemp = [];
                spreadEmptyArea(pos.x, pos.y);
                spreadNearToMines();
                //console.log("Make it to spread automatically")
                
            } else if (minescount > 0 && minescount < 10) {
                playField[pos.x][pos.y] = minescount;
            } else {
                playField[pos.x][pos.y] = 0;
            }

            checkVictory();
        }
    });
    
    // rightclick to toggle flags
    canvas.addEventListener("contextmenu", function(evt) {
        evt.preventDefault();
        var pos = getClickedCell(evt);
        toggleFlag(pos.x, pos.y);

        // return false to keep thing working
        return false;
    });

    $("#submitnappi").click(function(evt) {
        evt.preventDefault();
        // get all the inputs into an array.
        var $inputs = $('#optionsform :input');

        // not sure if you wanted this, but I thought I'd add it.
        // get an associative array of just the values.
        var values = {};
        $inputs.each(function() {
            values[this.name] = $(this).val();
        });
        if (values.density) {
            mineDensity = parseFloat(values.density);
        }
        if (values.size) {
            if ( 6 < values.size && values.size <= 100) {
                cw = parseFloat(values.size);
                console.log("CW", cw);
            }
        }

        init(true);
    });

});
