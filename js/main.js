'use strict'

const FLAG = '🚩';
const MINE = '💣';
const LIFE = '💓';
const SMILEY_NORMAL = '😀';
const SMILEY_LOST = '🤯';
const SMILEY_WIN = '😎'
const SAFE_CLICK = '💂';
const BAD_FLAG = '👎';


var gBoard = [];
var gLevel = {
    size: 4,
    mines: 2
};
var gMines;
var gGame = {
    intervalId: 0
};

function initGame() {
    // Model:
    clearInterval(gGame.intervalId);
    gGame = {
        isOn: false,
        cellsCount: null,
        showCount: 0,
        markedCount: 0,
        timeStarted: null,
        secsPassed: 0,
        intervalId: 0,
        lives: 3,
        safeClicks: 3
    };
    gBoard = buildBoard()
    gBoard = setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    renderScores(gLevel.size);
    // DOM:
    var elMarksLeft = document.querySelector('.marks-left');
    elMarksLeft.innerText = gLevel.mines;
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = SMILEY_NORMAL;
    var elStopwatch = document.querySelector('.stopwatch');
    elStopwatch.innerText = 0;
    var elLives = document.querySelector('.lives');
    elLives.innerText = `${LIFE} ${LIFE} ${LIFE}`
    var elSafeClick = document.querySelector('.safe-click');
    elSafeClick.innerText = `${SAFE_CLICK} ${SAFE_CLICK} ${SAFE_CLICK}`

};

function adjustLevel(level) {
    const levels = [
        { size: 4, mines: 2 }, // Beginner
        { size: 8, mines: 12 }, // Advanced
        { size: 12, mines: 30 } // Expert
    ];

    if (level === 0) {
        gLevel = levels[0];
        initGame();
    } else if (level === 1) {
        gLevel = levels[1];
        initGame();
    } else if (level === 2) {
        gLevel = levels[2];
        initGame();
    }
}

function locateMines() {
    // Clear gMines so we have a clean array to begin with:
    gMines = [];
    // Mines count corresponds to the global setting:
    var count = gLevel.mines;
    for (let i = 0; i < count; i++) {
        // Generate a random location
        var randI = getRandomInt(0, gLevel.size - 1);
        var randJ = getRandomInt(0, gLevel.size - 1);
        if (!gMines.includes(`${randI},${randJ}`)) {
            // Only if current i,j isn't *ALREADY* a mine: 
            // Push generated mine:
            gMines.push(`${randI},${randJ}`);
        } else {
            // If current (i,j) is a mine indeed:
            // Run again:
            --i;
        }
    }
    return gMines;
};

function buildBoard() {
    var size = gLevel.size;
    var mines = locateMines();
    var board = [];
    for (var i = 0; i < size; i++) {
        // Create row:
        board.push([]);
        for (var j = 0; j < size; j++) {
            // Create cells inside row
            // Default cells are NOT mines
            board[i][j] = {
                // setMinesNegCount() will later be used below:
                minesAroundCount: -1,
                isShown: false,
                // If gMines includes (i,j) it is a MINE:
                isMine: (mines.includes(`${i},${j}`)) ? true : false,
                isMarked: false
            }
        }
    }
    return board;
};

function setMinesNegsCount(board) {
    // Loop on gBoard:
    for (let i = 0; i < board.length; i++) {
        // Loop on rows:
        for (let j = 0; j < board[i].length; j++) {
            // Calculate the value for each cell
            // loop on negs:                
            board[i][j].minesAroundCount = countNegs(board, i, j);
        }
    }
    return board;
};

function countNegs(board, rowIdx, colIdx) {
    var negsXCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) negsXCount++;
        }
    }
    return negsXCount;
}

function renderBoard(board) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        // Create table row:
        strHTML += '<tr>';
        for (var j = 0; j < board.length; j++) {
            // For now there are only 2 options (X/O):
            var cell;
            if (board[i][j].isShown) {
                var minesAroundCount = board[i][j].minesAroundCount;
                if (board[i][j].isMine) {
                    cell = MINE;
                } else if (minesAroundCount !== 0) {
                    cell = minesAroundCount;
                } else {
                    cell = '';
                }
            } else {
                cell = '';
            }
            var className = 'cell cell' + i + '-' + j;
            var cellClicked = 'cellClicked(this, event, ' + i + ',' + j + ')'

            // Create table cell:
            strHTML += '<td class="' + className + '" onmousedown="' + cellClicked + '"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elMat = document.querySelector('.minesweeper-mat');
    elMat.innerHTML = strHTML;
};

function cellClicked(elCell, event, i, j) {
    // debugger;
    console.log(event.button);
    // If RightClicked call cellMarked:
    if (event.button === 2) return cellMarked(elCell, i, j);

    // If LeftClick Proceed as usual:
    else if (event.button === 0) {
        // debugger;
        // If game has already finished (game off & all mines were exposed) don't run:
        if ((!gGame.isOn) && gGame.showCount === gLevel.size * gLevel.size - gLevel.mines || gBoard[i][j].isMarked || gBoard[i][j].isShown) {
            console.log('you\'re clicks mean nothing to me');
            return;
        }

        // If this is the first click: 
        if (!gGame.isOn && gGame.showCount === 0) {
            // If the cell is a mine or number other then 0:
            if (gBoard[i][j].isMine || gBoard[i][j].minesAroundCount !== 0) {
                // REGENERATE BOARD!
                gBoard = buildBoard();
                gBoard = setMinesNegsCount(gBoard);
                return cellClicked(elCell, event, i, j)
            } else {
                // Start game
                gGame.isOn = true;
                // Start timer:
                gGame.timeStarted = new Date();
                gGame.intervalId = setInterval(function () {
                    gGame.secsPassed = Math.floor((new Date() - gGame.timeStarted) / 1000);
                    var elStopwatch = document.querySelector('.stopwatch');
                    elStopwatch.innerText = gGame.secsPassed;
                }, 1000);
            }
        }
        // If cell is a mine:
        if (gBoard[i][j].isMine) {
            // If lives is bigger then 1 decrease lives--
            if (gGame.lives > 1) return livesDecrease()
            // else continue to the bad news:
            else {
                console.log('game over!');
                // Model:
                gGame.isOn = false;
                clearInterval(gGame.intervalId);
                // DOM:
                elCell.innerText = MINE;
                var elSmiley = document.querySelector('.smiley');
                elSmiley.innerText = SMILEY_LOST;                    // *ALL* mines revealed:
                for (let i = 0; i < gBoard.length; i++) {
                    for (let j = 0; j < gBoard[i].length; j++) {
                        // Update model:
                        var currCell = gBoard[i][j];
                        var elCurrCell = document.querySelector(`.cell${i}-${j}`);
                        if (currCell.isMine && !currCell.isMarked) {
                            // Update DOM:
                                elCurrCell.innerText = MINE; 
                        } else if (currCell.isMarked && !currCell.isMine) {
                            elCurrCell.innerText = BAD_FLAG;
                        }

                    }
                }
            }
        }
        // If cell is not a mine (SWEET!)
        else {
            // Model:
            gBoard[i][j].isShown = true;
            gGame.showCount++
            // DOM: Show mines around count:
            // if 0 show blank cell, else show the number
            elCell.innerText = (gBoard[i][j].minesAroundCount === 0) ? '' : gBoard[i][j].minesAroundCount;
            var num = gBoard[i][j].minesAroundCount;
            elCell.classList.add(`nac${num}`);

            // *EXCITING*: if cell is 0 call expandShown:
            if (gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, i, j);

            // If all 'clean' cells were exposed > VICTORY!:
            if (gGame.showCount === gLevel.size * gLevel.size - gLevel.mines && gGame.markedCount === gLevel.mines) {
                console.log('victory!', gGame.secsPassed, 'seconds');
                // Model:
                gGame.isOn = false;
                var elSmiley = document.querySelector('.smiley');
                elSmiley.innerText = SMILEY_WIN;
                clearInterval(gGame.intervalId);
                // Keep record:
                setTimeout(function () {keepScore(gGame.secsPassed)}, 1000); 

            }
        }
    }
    console.log('Show count: ', gGame.showCount);
    console.log('Lives: ', gGame.lives);
};

function cellMarked(elCell, i, j) {
    // If the cell is already exposed return:
    if (gBoard[i][j].isShown) return;
    else if (!gBoard[i][j].isMarked) {
        // If not marked flag in model:
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        // Flag in DOM:
        elCell.innerText = FLAG;
        // if this is the last cell to mark:
        if (gGame.showCount === gLevel.size * gLevel.size - gLevel.mines && gGame.markedCount === gLevel.mines) {
            console.log('victory!', gGame.secsPassed, 'seconds');
            // Model:
            gGame.isOn = false;
            var elSmiley = document.querySelector('.smiley');
            elSmiley.innerText = SMILEY_WIN;
            clearInterval(gGame.intervalId);
            // Keep record:
            setTimeout(function () {keepScore(gGame.secsPassed)}, 1000); 
        }

    } else {
        // If marked unflag in model:
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        // Unflag in DOM:
        elCell.innerText = '';
    }
    var marksLeft = gLevel.mines - gGame.markedCount;
    var elMarksLeft = document.querySelector('.marks-left');
    elMarksLeft.innerText = marksLeft;
};

function checkGameOver() {

};

function expandShown(board, rowIdx, colIdx) {
    // debugger;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            // If current cell is already exposed continue:
            if (gBoard[i][j].isShown) continue;
            // Update is shown in model:
            gBoard[i][j].isShown = true;
            gGame.showCount++
            // Update in DOM:
            var elCurrCell = document.querySelector(`.cell${i}-${j}`);
            var num = gBoard[i][j].minesAroundCount;
            elCurrCell.classList.add(`nac${num}`);

            // elCurrCell.innerText = gBoard[i][j].minesAroundCount;
            // if 0 show blank cell, else show the number
            elCurrCell.innerText = (gBoard[i][j].minesAroundCount === 0) ? '' : gBoard[i][j].minesAroundCount;

            // Phase 2: If a cell minesArouncCount is 0 call expandShown on that cell (recursion!)
            if (gBoard[i][j].minesAroundCount === 0) expandShown(board, i, j);
        }
    }
};

function livesDecrease() {
    // model:
    gGame.lives--
    console.log('Lives: ', gGame.lives);
    // DOM:
    var elLives = document.querySelector('.lives');
    elLives.innerText = (gGame.lives === 2) ? `${LIFE} ${LIFE}` : `${LIFE}`;
}

function renderCell(elCell, i, j) {
    // this will allow better control over the design + less repetitive code:
}

function keepScore(secs) {
    // localStorage.clear();
    var level = gLevel.size
    var name = prompt('Name?')
    if (name) {
        localStorage.setItem(`${level}-${name}`, secs)
    }
}
