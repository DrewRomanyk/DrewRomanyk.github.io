// GAME STATUS
var NOT_PLAYING = -1;
var PLAYING = 0;
var DEFEAT = 1;
var VICTORY = 2;

// GAME DIFFICULTY
var EASY = 1;
var MEDIUM = 2;
var EXPERT = 3;

var MINE = -1;
var difficulty = EASY;
var minesweeperBoard;
var revealClickMode = true;

var main = function () {
    $('.button-collapse').sideNav();
    $('#easy').click(function() {
        difficulty = EASY;
    });
    $('#medium').click(function() {
        difficulty = MEDIUM;
    });
    $('#expert').click(function() {
        difficulty = EXPERT;
    });
    $('#startGame').click(function () {
        minesweeperBoard = new Board();
        switch (difficulty) {
            case EASY: 
                minesweeperBoard.init(9,9,10);
                break;
            case MEDIUM:
                minesweeperBoard.init(16,16,40);
                break;
            case EXPERT:
                minesweeperBoard.init(30,16,99);
                break;
        }
    });
};

$(document).ready(main);

// METHODS

// CELL OBJECT
function Cell(row, column) {
    var self = this;
    this.row = row;
    this.column = column;
    this.value = 0;
    this.isRevealed = false;
    this.isFlagged = false;

    this.imgButton = $('<img id="cell-' + row + '-' + column + '"  src="https://raw.githubusercontent.com/DrewRomanyk/MineSweeper-Android/master/app/src/main/res/drawable-hdpi/ic_cell_unknown_light.png"></img>');
    this.tappedCell = (function() {
        if(minesweeperBoard.gameStatus === PLAYING || minesweeperBoard.gameStatus === NOT_PLAYING){
            if(revealClickMode) {
                self.revealCell();
            }
            minesweeperBoard.checkifVictorious(self);
        }
    });
    this.revealCell = (function() {
        if(minesweeperBoard.firstRound && !self.isFlagged) {
            minesweeperBoard.setupFirstRound(self);
            minesweeperBoard.updateRevealedCell(self);
        } else if(!self.isFlagged && !self.isMine() && !self.isRevealed) {
            minesweeperBoard.updateRevealedCell(self);
        } else if(self.isMine() && !self.isFlagged) {
            minesweeperBoard.gameOver(DEFEAT, self);
        }
    });
    this.imgButton.click(self.tappedCell);
}

Cell.prototype.isMine = function() {
    return this.value === MINE;
}

// BOARD OBJECT
function Board() {
    this.rows = 0;
    this.columns = 0;
    this.cellsInGame = 0;
    this.minesInGame = 0;
    this.flaggedMines = 0;
    this.flaggedCells = 0;
    this.revealedCells = 0;
    this.cell = new Array();
    
    this.firstRound = true;
    this.gameStatus = NOT_PLAYING;
}

Board.prototype.init = function(newRows, newCols, newMines) {
    this.rows = newRows;
    this.columns = newCols;
    this.cellsInGame = newRows * newCols;
    this.minesInGame = newMines;
    this.clearCurrentBoards();
    this.createCells();
}

Board.prototype.clearCurrentBoards = function() {
    $('#boardFrame').children().remove();
}

Board.prototype.createCells = function() {
    var boardFrame = $('#boardFrame');
    this.cell = new Array(this.rows);
    for(var r = 0; r < this.rows; r++) {
        var boardRowFrame = $('<tr></tr>');
        this.cell[r] = new Array(this.columns);
        for(var c = 0; c < this.columns; c++) {
            this.cell[r][c] = new Cell(r,c);
            var boardCellFrame = $('<td></td>');
            this.cell[r][c].imgButton.appendTo(boardCellFrame);
            boardCellFrame.appendTo(boardRowFrame);
        }
        boardRowFrame.appendTo(boardFrame);
    }
}

Board.prototype.setupFirstRound = function(tgtCell) {
    this.firstRound = false;
    this.gameStatus = PLAYING;
    this.createMines(tgtCell.row, tgtCell.column);
    this.updateCellValues();
}

Board.prototype.createMines = function(placedRow, placedColumn) {
    var placedMines = 0;
    
    while(placedMines < this.minesInGame) {
        var randomR = Math.floor(Math.random() * this.rows);
        var randomC = Math.floor(Math.random() * this.columns);
        
        // check if random r and c are valid spot for mine
        var validSpot = true;
        for (var r = placedRow - 1; r <= placedRow + 1; r++) {
            for (var c = placedColumn - 1; c <= placedColumn + 1; c++) {
                if (this.inbounds(r, c) && (r === randomR && c === randomC)) {
                    validSpot = false;
                }
            }
        }

        // if valid, then add as mine
        if(validSpot && !this.cell[randomR][randomC].isMine()) {
            placedMines++;
            this.cell[randomR][randomC].value = MINE;
        }
    }
}

Board.prototype.updateCellValues = function() {
    for (var r = 0; r < this.cell.length; r++) {
        for (var c = 0; c < this.cell[0].length; c++) {
            // if is mine, update all non mine neighbors up by one
            if (this.cell[r][c].isMine()) {
                for (var nr = r - 1; nr <= r + 1; nr++) {
                    for (var nc = c - 1; nc <= c + 1; nc++) {
                        if (this.inbounds(nr, nc) && !this.cell[nr][nc].isMine()) {
                            this.cell[nr][nc].value++;
                        }
                    }
                }
            }
        }
    }
}

Board.prototype.updateRevealedCell = function(tgtCell) {
    this.revealedCells++;
    tgtCell.isRevealed = true;
    jQuery(tgtCell.imgButton).attr('src',"https://raw.githubusercontent.com/DrewRomanyk/MineSweeper-Android/master/app/src/main/res/drawable-hdpi/ic_cell_" + tgtCell.value + "_light.png" );
    
    if(tgtCell.value === 0) {
        this.revealNeighborCells(tgtCell);
    }
}

Board.prototype.revealNeighborCells = function(tgtCell) {
    for (var r = tgtCell.row - 1; r <= tgtCell.row + 1; r++) {
            for (var c = tgtCell.column - 1; c <= tgtCell.column + 1; c++) {
                if (this.inbounds(r, c) && 
                    !(tgtCell.row === r && 
                      tgtCell.column === c)) {
                    this.cell[r][c].revealCell();
                }
            }
        }
}

Board.prototype.inbounds = function(row, column) {
    return (0 <= row && row < this.cell.length && 0 <= column && column < this.cell[0].length);
}

Board.prototype.victoryConditions = function() {
    return (this.flaggedMines === this.minesInGame && 
            this.cellsInGame === (this.flaggedMines + this.revealedCells)) || 
            (this.cellsInGame === (this.minesInGame + this.revealedCells));
}

Board.prototype.checkifVictorious = function(tgtCell) {
    if(this.victoryConditions()) {
        this.gameOver(VICTORY, tgtCell);
    }
}

Board.prototype.gameOver = function(gameStatus, tgtCell) {
    this.gameStatus = gameStatus;
    switch (gameStatus) {
        case DEFEAT:
            alert("YOU LOST! :(");
            break;
        case VICTORY:
            alert("YOU WON! :)");
            break;
    }
}