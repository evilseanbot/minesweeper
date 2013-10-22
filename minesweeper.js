
// Returns an object that contains 4 properties: startX, startY, endX, endY. They describe boundaries for a box around the squares that are adjacent to the square at x, y, including diagnols.
function getNearbySquares(x, y) {
    nearbySquares = {};
    nearbySquares.startX = Math.max(0, x-1)
    nearbySquares.endX = Math.min(MSBoard.columns-1, x+1);
    nearbySquares.startY = Math.max(0, y-1);
    nearbySquares.endY = Math.min(MSBoard.rows-1, y+1);
    return nearbySquares;
}

// Modifes the MSBoard object by recording how many mines are adjacent to every square. This is used for display purposes.
function setNearbyMines() {
    // For every square on the board:
    for (var x = 0; x < MSBoard.columns; x++) {
    	for (var y = 0; y < MSBoard.rows; y++) {

    		var ns = getNearbySquares(x, y);
            var nearbyMines = 0;

            // For every nearby square of this square.
    		for (var xCheckForMines = ns.startX; xCheckForMines <= ns.endX; xCheckForMines++) {
    			for (var yCheckForMines = ns.startY; yCheckForMines <= ns.endY; yCheckForMines++) {
    				if (MSBoard.squares[xCheckForMines][yCheckForMines].mine) {
                        nearbyMines++;
    				}
    			}
    		}
    		MSBoard.squares[x][y].nearbyMines = nearbyMines;
    	}
    }

}

// These two functions get the X and Y Coordinates of a square from its Id, which is in the format 'X-Y'
function getX(id) {
    splitIndex = id.indexOf("-");
    xString = id.substring(0, splitIndex);
    return parseInt(xString);
}

function getY(id) {
	splitIndex = id.indexOf("-");
    yString = id.substring(splitIndex+1);
	return parseInt(yString);
}

// Changes the model of the board so that a square at x, y is flagged.
function flagSquare(x, y) {
    square = MSBoard.squares[x][y];
    square.flag = !square.flag;
}

// Operates the main activity of the game, opening squares up.
function openSquare(x, y) {
    square = MSBoard.squares[x][y];
	square.open = true;


    // If the square a player opened is a mine, they lose.
    if (square.mine) {
        gameOver = true;
    }

    // Checks to see if the square has no nearby mines. If so, it will open all nearby squares. (Because they are known to be safe.)
	if (square.nearbyMines == 0) {
	    var ns = getNearbySquares(x, y);
	    for (var yToOpen = ns.startY; yToOpen <= ns.endY; yToOpen++) {
	    	for (var xToOpen = ns.startX; xToOpen <= ns.endX; xToOpen++) {
                // Try to open any nearby squares that haven't been opened yet.
	    		if (!MSBoard.squares[xToOpen][yToOpen].open) {
                    openSquare(xToOpen, yToOpen);
	    	    }
	    	}
	    }
	}
    return;
}

// Updates the appearance of squares and the start game menu based on the model.
function updateView() {
    // For every square on the board.
    console.log(MSBoard.rows);

    for (var x = 0; x < MSBoard.columns; x++) {
        for (var y = 0; y < MSBoard.rows; y++) {
            squareId = "#" + x + "-" + y;
            // Removes the dynamic classes from the squares before adding appropiate ones back to it.
            $(squareId).removeClass("closed open flagged warning");

            square = MSBoard.squares[x][y];

            // These questions determine how a square should appear.
            // If no other text is put into a square, a &nbsp; is inserted because otherwise it disturbs the grid.
            // If a square is open, it should be themed as so and also display the number of nearby mines.
            if (square.open && !square.mine) {
                $(squareId).addClass("open");
                $(squareId).html(square.nearbyMines);
            } 
            // Flags are displayed only if the square is still closed.
            else if (square.flag && !square.open) {
                $(squareId).addClass("closed");
                $(squareId).html("<img src='redFlag.png' class='boardImg flag' />&nbsp;")
            } 
            // Mines are displayed either if they're open (Either from opening one and losing or during validating) or while the cheat control is pressed.
            else if (square.mine && (square.open || cheating)) {
                $(squareId).addClass("warning");
                $(squareId).html("<img src='mine.png' class='boardImg mine' />&nbsp;")
            } 
            // The HTML is set to a blank space in case there is nothing else to put in the space. 
            else if (!square.open && !square.flag) {
                $(squareId).addClass("closed");                
                $(squareId).html("&nbsp;")
            }

        }
    }

    if (startMenuOn) {
        $("#newGameSettings").css("display", "block");
    } else {
        $("#newGameSettings").css("display", "none");        
    }

}

// Creates the visual presentation of the board, and also adds listeners to the elements added.
function createBoardView() {
	var boardHTML = "";
	for (var y = 0; y < MSBoard.rows; y++) {
		boardHTML += "<div>";
    	for (var x = 0; x < MSBoard.columns; x++) {
            boardHTML += "<div class='square' id='" + x +"-" + y +"'></div>";    		    	            			
    		
    	}
    	boardHTML += "</div>";
    }
    $("#mineSweeperBoard").html(boardHTML);

    updateView();

    $(".square").on('mousedown', function(e) {
        if (!gameOver) {
            x = getX(this.id);
        	y = getY(this.id);

            // Flags using the right button, which is variably mapped to button 2 or 3.
            switch (e.which) {
                case 1:
                    openSquare(x, y);
                    break;
                case 2:
                    flagSquare(x, y);
                    break;
                case 3:
                    flagSquare(x, y);
                    break;
            }

            updateView();
        }
    });


    // Prevents the context menu from opening on any squares, or else flagging would be very awkward.
    $(".square").bind("contextmenu",function(){
       return false;
    }); 

    // Adjusts the appearance of the game board to the current size settings.
    resizeGame();

    // The squares that occupy the corner have corner classes added to them to create rounded edges.
    $("#0-0").addClass("topLeftCorner");
    $("#" + (MSBoard.columns-1) + "-0").addClass("topRightCorner");    
    $("#0-" + (MSBoard.rows-1)).addClass("bottomLeftCorner");
    $("#" + (MSBoard.columns-1) + "-" + (MSBoard.rows-1)).addClass("bottomRightCorner");    
}

// Add the appropiate number of mines to the playing board model.
function fillBoardWithMines(numOfMines) {
    var minesPlaced = 0;

    while (minesPlaced < numOfMines) {
        x = (Math.random()*MSBoard.columns);
        y = (Math.random()*MSBoard.rows);
        x = Math.floor(x);
        y = Math.floor(y);

        var square = MSBoard.squares[x][y];

        // This algorithm is nessecary to make sure the number of mines is placed on the board by continuing when a repeated square is randomly selected.
        if (!square.mine) {
            square.mine = true;
            minesPlaced++;
        }
    }
}

// Creates the board model.
function createBoardModel(boardColumns, boardRows, numOfMines) {

    console.log("Created model for board.");

    MSBoard = {rows: boardRows, columns: boardColumns, squares: []};

    for (var x = 0; x < boardColumns; x++) {
    	MSBoard.squares[x] = [];
        for (var y = 0; y < boardColumns; y++) {
            MSBoard.squares[x][y] = {open: false, mine: false, flag: false, nearbyMines: 0}
        }
    }                

    fillBoardWithMines(numOfMines);
    setNearbyMines();
    return MSBoard;
}

function resizeGame() {
    // The size of the controls font is set by how big the control section (top 10% of the screen) stretchs out to be.
    var controlsHeight = $("#controls").height();
    var controlsFontSize = controlsHeight * 0.75;
    $("#controls").css("font-size", controlsFontSize +"px");
    $("#newGameSettings").css("font-size", controlsFontSize +"px");
    $("#newGameSettings input").css("width", controlsHeight*1.5);
    $("#newGameSettings input").css("height", controlsHeight);
    $("#newGameSettings input").css("font-size", controlsFontSize +"px");

    // The size of the squares is based on the largest square size that can fit all of the squares on the screen.
    var potentialSquareHeight = $("#potentialGameSpace").height() / MSBoard.rows;
    var potentialSquareWidth = $("#potentialGameSpace").width() / MSBoard.columns;
    var potentialSpaceHeight = $("#potentialGameSpace").height();

    var squareSize = Math.min(potentialSquareHeight, potentialSquareWidth);

    $(".square").css("height", squareSize-2);
    $(".square").css("width", squareSize-2);
    $(".square").css("font-size", squareSize-2);

    // The playing boards with is set by how big the squares are set to be. This is nessecary to have a centered playing field.
    var boardWidth = squareSize * MSBoard.columns;
    var boardHeight = squareSize * MSBoard.rows;


    $("#mineSweeperBoard").css("width", boardWidth);
    $("#mineSweeperBoard").css("height", boardHeight);

    // The playing boards top margin is created to be able to see the controls and the board at the same time. While somewhat complex, this avoids some flaws of simpler solutions.
    $("#mineSweeperBoard").css("margin-top", Math.max(potentialSpaceHeight/8, 50) );
}

// Checks to see whether you have revealed all safe squares or not, and makes you win or lose the game accordingly.
function validate() {
    var allSafeSquaresOpen = true;

    for (var x = 0; x < MSBoard.columns; x++) {
        for (var y = 0; y < MSBoard.rows; y++) {
            square = MSBoard.squares[x][y];
            if (!square.open && !square.mine) {
                allSafeSquaresOpen = false
            }
            square.open = true;
        }
    }

    updateView();

    if (allSafeSquaresOpen) {
        alert("You won!")
        gameOver = true;
    } else {
        alert("Mines were left. You lost.")
        gameOver = true;
    }
}

// This is used on the settings on the new game menu to keep values within their designed ranges.
function restrictInputToBounds(inputElement, min, max) {
    var value = inputElement.val();

    if (isNaN(value)) {
        value = min;
    } 

    value = Math.max(min, value);
    value = Math.min(max, value);

    inputElement.val(value);
}

var MSBoard = {};
var gameOver = false;
var startMenuOn = true;
var cheating = false;

$(document).ready(function() {

    console.log("Document is loaded!");

    // Creates the model for the game.
    MSBoard = createBoardModel(8, 8, 10);

    // Creates the view based on the playing board.
    createBoardView();

    // Attaches a new game menu opening function to the new game control.
    $("#newGameMenu").click(function() {
        startMenuOn = true;
        updateView();
    });

    // When start game is pressed off the new game menu, a new board is created with the input settings.
    $("#startGame").click(function() {
        gameOver = false;
        startMenuOn = false;
        var boardColumns = $("#boardColumns").val();
        var boardRows = $("#boardRows").val(); 
        var numOfMines = $("#numOfMines").val();
        MSBoard = createBoardModel(boardColumns, boardRows, numOfMines);
        createBoardView();        
    });


    // When the cheat control is pressed down, the mines become visible due to a setting in updateView.
    $("#cheat").mousedown(function() {
        cheating = true;
        updateView();
    });

    // When the mouse button is released from cheat control, cheat mode clears.
    $("#cheat").mouseup(function() {
        cheating = false;
        updateView();
    });

    // This case is nessecary for when the mouse is removed from the cheat button before being released.
    $("#cheat").mouseout(function() {
        cheating = false;
        updateView();
    });

    $("#validate").click(validate); 


    // These three listeners create the dynamic button appearance.
    $(".button").mousedown(function() {
        $("#" + this.id).removeClass("unpressedButton");
        $("#" + this.id).addClass("pressedButton");
    });

    $(".button").mouseup(function() {
        $("#" + this.id).removeClass("pressedButton");
        $("#" + this.id).addClass("unpressedButton");
    });

    $(".button").mouseout(function() {
        $("#" + this.id).removeClass("pressedButton");
        $("#" + this.id).addClass("unpressedButton");
    });

    // These three listeners keep the input settings on the new game menu restricted to certain values.
    $("#boardRows").change(function() {
        restrictInputToBounds($(this), 1, 20);
    });

    $("#boardColumns").change(function() {
        restrictInputToBounds($(this), 1, 20);
    });

    $("#numOfMines").change(function() {
        var maximumMines = $("#boardRows").val() * $("#boardColumns").val();
        restrictInputToBounds($(this), 1, maximumMines);
    });

    $( window ).resize(function() {
        resizeGame();
    });
});
