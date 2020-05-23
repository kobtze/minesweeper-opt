'use strict'

function safeClick() {
    if (gGame.safeClicks > 0) {
        var safeCells = [];
        for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard[i].length; j++) {
                if (gBoard[i][j].isShown) continue;
                if (gBoard[i][j].isMine) continue;
                if (gBoard[i][j].isMarked) continue;
                var currCell = {
                    rowIdx: i,
                    colIdx: j
                }
                safeCells.push(currCell);
            }
        }
        console.log(safeCells);
        // debugger;
        var chosenCell = safeCells[getRandomInt(0, safeCells.length)];
        console.log(chosenCell);
        // Mark cell in DOM
        var elCell = document.querySelector(`.cell${chosenCell.rowIdx}-${chosenCell.colIdx}`)
        elCell.classList.add('safe');
        setTimeout(function (){elCell.classList.remove('safe'); }, 1000); 

        // Update model:
        gGame.safeClicks--
        // Update DOM:
        var elSafeClick = document.querySelector('.safe-click');
        if (gGame.safeClicks === 2) {
            elSafeClick.innerText = `${SAFE_CLICK} ${SAFE_CLICK}`;
        } else if (gGame.safeClicks === 1) {
            elSafeClick.innerText = SAFE_CLICK;
        } else if (gGame.safeClicks === 0) {
            elSafeClick.innerText = '';
        }
    }
}

function betterSafeClick() {
    //
    if (gGame.safeClicks > 0) {
        var safeCells = [];
        for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard[i].length; j++) {
                if (gBoard[i][j].isShown) continue;
                if (gBoard[i][j].isMine) continue;
                if (gBoard[i][j].isMarked) continue;
                // This time give me only '0' cells:
                // if (gBoard[i][j].minesAroundCount !== 0) continue;
                var currCell = {
                    rowIdx: i,
                    colIdx: j
                }
                safeCells.push(currCell);
            }
        }
        // console.log(safeCells);
        // debugger;
        var chosenCell = safeCells[getRandomInt(0, safeCells.length)];
        console.log(chosenCell);
        // To make it more exciting, call expandShown!
        expandShown(gBoard, chosenCell.rowIdx, chosenCell.colIdx);
        // Update model:
        gBoard[chosenCell.rowIdx][chosenCell.colIdx].isShown = true;
        gGame.showCount++
        gGame.safeClicks--
        // Update DOM:
        var elCell = document.querySelector(`.cell${chosenCell.rowIdx}-${chosenCell.colIdx}`)
        elCell.innerText = gBoard[chosenCell.rowIdx][chosenCell.colIdx].minesAroundCount;
        var elSafeClick = document.querySelector('.safe-click');
        if (gGame.safeClicks === 2) {
            elSafeClick.innerText = `${SAFE_CLICK} ${SAFE_CLICK}`;
        } else if (gGame.safeClicks === 1) {
            elSafeClick.innerText = SAFE_CLICK;
        } else if (gGame.safeClicks === 0) {
            elSafeClick.innerText = '';
        }
    }
}

function renderScores(level) {
    // first get the relevant records from localStorage:
    var currLevelRecords = [];
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith(level))
            currLevelRecords.push({ record: localStorage.getItem(localStorage.key(i)), name: localStorage.key(i) });
    }
    currLevelRecords.sort(function (a, b) {
        return a.record - b.record;
    });

    var strHTML = '<table><tbody>';
    for (var i = 0; i < currLevelRecords.length; i++) {
        var name = currLevelRecords[i].name.split('-',)[1];
        // Create table row:
        strHTML += '<tr>';
        // first row is rank:
        strHTML += `<td class="rank">${i + 1}.</td>`;
        // second is name:
        strHTML += `<td class="name">${name}</td>`;
        // third is time:
        strHTML += `<td class="record">${currLevelRecords[i].record}</td></tr>`
    }
    strHTML += '</tbody></table>';
    var elLevelScore = document.querySelector('.level-score');
    elLevelScore.innerHTML = strHTML;
}