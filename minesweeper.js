var MSBoard = {};
var gameOver = false;
var startMenuOn = true;
var cheating = false;

function getNearbySquares(x, y) {
    nearbySquares = {};
    nearbySquares.startX = Math.max(0, x-1)
    nearbySquares.endX = Math.min(MSBoard.width-1, x+1);
    nearbySquares.startY = Math.max(0, y-1);
    nearbySquares.endY = Math.min(MSBoard.height-1, y+1);
    return nearbySquares;
}

function setNearbyMines() {
    // For every square on the board:
    for (var x = 0; x < MSBoard.width; x++) {
    	for (var y = 0; y < MSBoard.height; y++) {

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

function flagSquare(x, y) {
    square = MSBoard.squares[x][y];
    square.flag = !square.flag;
}

function openSquare(x, y) {
    square = MSBoard.squares[x][y];
	square.open = true;

    if (square.mine) {
        gameOver = true;
    }

    // Checks to see if the square has no nearby mines. If so, it will open all nearby squares.
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

function updateView() {
    for (var x = 0; x < MSBoard.width; x++) {
        for (var y = 0; y < MSBoard.height; y++) {
            squareId = "#" + x + "-" + y;
            $(squareId).removeClass("closed open flagged warning");

            square = MSBoard.squares[x][y];

            if (square.open) {
                $(squareId).addClass("open");
                $(squareId).html(square.nearbyMines);
            } else {
                $(squareId).addClass("closed");                
            }

            if (square.flag && !square.open) {
                $(squareId).html("<img src='redFlag.png' class='boardImg flag' />&nbsp;")
            } else if (square.mine && (square.open || cheating)) {
                $(squareId).addClass("warning");
                $(squareId).html("<img src='mine.png' class='boardImg mine' />&nbsp;")
            } else if ( square.open && !square.mine ) {
                $(squareId).html(square.nearbyMines)                
            } else {
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

function createBoardView() {
	var boardHTML = "";
	for (var y = 0; y < MSBoard.height; y++) {
		boardHTML += "<div>";
    	for (var x = 0; x < MSBoard.width; x++) {
            boardHTML += "<div class='square' id='" + x +"-" + y +"'></div>";    		    	            			
    		
    	}
    	boardHTML += "</div>";
    }
    $("#mineSweeperBoard").html(boardHTML);

    updateView();

    $(".square").click(function(e) {
        console.log("clicked on!")
    });


    $(".square").on('mousedown', function(e) {
        console.log("clicked on!")


        if (!gameOver) {
            x = getX(this.id);
        	y = getY(this.id);

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

    $(".square").bind("contextmenu",function(){
       return false;
    }); 

    resizeGame();

    $("#0-0").addClass("topLeftCorner");
    $("#" + (MSBoard.width-1) + "-0").addClass("topRightCorner");    
    $("#0-" + (MSBoard.height-1)).addClass("bottomLeftCorner");
    $("#" + (MSBoard.width-1) + "-" + (MSBoard.height-1)).addClass("bottomRightCorner");    
}

function fillBoardWithMines(numOfMines) {
    var minesPlaced = 0;

    while (minesPlaced < numOfMines) {
        x = (Math.random()*MSBoard.width);
        y = (Math.random()*MSBoard.height);
        x = Math.floor(x);
        y = Math.floor(y);

        var square = MSBoard.squares[x][y];

        if (!square.mine) {
            square.mine = true;
            minesPlaced++;
        }
    }
}

function createBoardModel(boardWidth, boardHeight, numOfMines) {

	// Creates the board model.

    MSBoard = {height: boardHeight, width: boardWidth, squares: []};

    for (var x = 0; x < boardWidth; x++) {
    	MSBoard.squares[x] = [];
        for (var y = 0; y < boardHeight; y++) {
            MSBoard.squares[x][y] = {open: false, mine: false, flag: false, nearbyMines: 0}
        }
    }                

    fillBoardWithMines(numOfMines);
    setNearbyMines();
    return MSBoard;
}

function resizeGame() {
    var controlsHeight = $("#controls").height();
    var controlsFontSize = controlsHeight * 0.75;
    $("#controls").css("font-size", controlsFontSize +"px");
    $("#newGameSettings").css("font-size", controlsFontSize +"px");
    $("#newGameSettings input").css("width", controlsHeight*1.5);
    $("#newGameSettings input").css("height", controlsHeight);
    $("#newGameSettings input").css("font-size", controlsFontSize +"px");


    //$("#fullHeightContainer").height = $("body").height();

    // Make the icon buttons square:
    $(".iconButton").css("width", $(".iconButton").css("height"));

    var potentialSquareHeight = $("#potentialGameSpace").height() / MSBoard.height;
    var potentialSquareWidth = $("#potentialGameSpace").width() / MSBoard.width;
    var potentialSpaceHeight = $("#potentialGameSpace").height();

    var squareSize = Math.min(potentialSquareHeight, potentialSquareWidth);

    var boardWidth = squareSize * MSBoard.width;
    var boardHeight = squareSize * MSBoard.height;

    $(".square").css("height", squareSize-2);
    $(".square").css("width", squareSize-2);
    $(".square").css("font-size", squareSize-2);

    $("#mineSweeperBoard").css("width", boardWidth);
    $("#mineSweeperBoard").css("height", boardHeight);
    $("#mineSweeperBoard").css("margin-top", Math.max(potentialSpaceHeight/8, 50) );
}

function validate() {
    var allSafeSquaresOpen = true;

    for (var x = 0; x < MSBoard.width; x++) {
        for (var y = 0; y < MSBoard.height; y++) {
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
    } else {
        alert("Mines were left. You lost.")
        gameOver = true;
    }
}

function restrictInputToBounds(inputElement, min, max) {
    var value = inputElement.val();

    if (isNaN(value)) {
        value = min;
    } 

    value = Math.max(min, value);
    value = Math.min(max, value);

    inputElement.val(value);
}

$(document).ready(function() {

    MSBoard = createBoardModel(8, 8, 10);
    createBoardView();

    $("#newGameMenu").click(function() {
        startMenuOn = true;
        updateView();
    });

    $("#fullHeightContainer").click(function() {
        console.log("background clicked!");
    });

    $("#startGame").click(function() {
        gameOver = false;
        startMenuOn = false;
        var boardWidth = $("#boardWidth").val();
        var boardHeight = $("#boardHeight").val(); 
        var numOfMines = $("#numOfMines").val();
        MSBoard = createBoardModel(boardWidth, boardHeight, numOfMines);
        createBoardView();        
    });

    $("#cheat").mousedown(function() {
        cheating = true;
        updateView();
    });

    $("#cheat").mouseup(function() {
        cheating = false;
        updateView();
    });

    $("#cheat").mouseout(function() {
        cheating = false;
        updateView();
    });

    $("#validate").click(validate); 

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

    $("#boardHeight").change(function() {
        restrictInputToBounds($(this), 1, 20);
    });

    $("#boardWidth").change(function() {
        restrictInputToBounds($(this), 1, 20);
    });

    $("#numOfMines").change(function() {
        var maximumMines = $("#boardHeight").val() * $("#boardWidth").val();
        restrictInputToBounds($(this), 1, maximumMines);
    });



    $( window ).resize(function() {
        resizeGame();
    });
});
