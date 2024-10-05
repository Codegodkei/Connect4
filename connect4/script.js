const board = document.getElementById('board');
const message = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const buttons = document.querySelectorAll('.column-button');

let currentPlayer = 'red';
let gameBoard = Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => null));
let isGameOver = false;
const DEPTH_LIMIT = 6; // Increase the depth limit for a stronger AI

function createBoard() {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            board.appendChild(cell);
        }
    }
}

function resetBoard() {
    currentPlayer = 'red';
    isGameOver = false;
    gameBoard = Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => null));
    board.innerHTML = '';
    createBoard();
    message.innerText = '';
    buttons.forEach(button => button.addEventListener('click', handleButtonClick));
    setTimeout(makeAIMove,500);
}

function checkWin() {
    // Check rows
    for (let row = 0; row < 6; row++) { 
        for (let col = 0; col <= 3; col++) {
            if (
                gameBoard[row][col] === currentPlayer &&
                gameBoard[row][col + 1] === currentPlayer &&
                gameBoard[row][col + 2] === currentPlayer &&
                gameBoard[row][col + 3] === currentPlayer
            ) {
                return true;
            }
        }
    }

    // Check columns
    for (let row = 0; row <= 2; row++) {
        for (let col = 0; col < 7; col++) {
            if (
                gameBoard[row][col] === currentPlayer &&
                gameBoard[row + 1][col] === currentPlayer &&
                gameBoard[row + 2][col] === currentPlayer &&
                gameBoard[row + 3][col] === currentPlayer
            ) {
                return true;
            }
        }
    }

    // Check diagonals (bottom left to top right)
    for (let row = 0; row <= 2; row++) {
        for (let col = 0; col <= 3; col++) {
            if (
                gameBoard[row][col] === currentPlayer &&
                gameBoard[row + 1][col + 1] === currentPlayer &&
                gameBoard[row + 2][col + 2] === currentPlayer &&
                gameBoard[row + 3][col + 3] === currentPlayer
            ) {
                return true;
            }
        }
    }

    // Check diagonals (top left to bottom right)
    for (let row = 3; row < 6; row++) {
        for (let col = 0; col <= 3; col++) {
            if (
                gameBoard[row][col] === currentPlayer &&
                gameBoard[row - 1][col + 1] === currentPlayer &&
                gameBoard[row - 2][col + 2] === currentPlayer &&
                gameBoard[row - 3][col + 3] === currentPlayer
            ) {
                return true;
            }
        }
    }

    return false;
}

function checkDraw() {
    return gameBoard.every(row => row.every(cell => cell !== null));
}

function findAvailableRow(col) {
    for (let row = 5; row >= 0; row--) {
        if (gameBoard[row][col] === null) {
            return row;
        }
    }
    return -1;
}

function handleButtonClick(event) {
    if (isGameOver) return;

    const col = event.target.dataset.col;
    if (col === undefined) return;

    const row = findAvailableRow(parseInt(col, 10));
    if (row === -1) return;

    makeMove(row, col);
    if (!isGameOver) {
        setTimeout(makeAIMove, 500); // Delay AI move for better UX
    }
}

function makeMove(row, col) {
    gameBoard[row][col] = currentPlayer;
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cell.style.backgroundColor = currentPlayer;

    if (checkWin()) {
        message.innerText = `${currentPlayer.toUpperCase()} wins!`;
        isGameOver = true;
        buttons.forEach(button => button.removeEventListener('click', handleButtonClick));
    } else if (checkDraw()) {
        message.innerText = 'It\'s a draw!';
        isGameOver = true;
        buttons.forEach(button => button.removeEventListener('click', handleButtonClick));
    } else {
        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
    }
}

function makeAIMove() {
    if (isGameOver) return;

    const bestMove = getBestMove();
    const row = findAvailableRow(bestMove);
    if (row !== -1) {
        makeMove(row, bestMove);
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = 0;
    for (let col = 0; col < 7; col++) {
        const row = findAvailableRow(col);
        if (row !== -1) {
            gameBoard[row][col] = currentPlayer;
            const score = minimax(gameBoard, DEPTH_LIMIT, false, -Infinity, Infinity);
            gameBoard[row][col] = null;
            if (score > bestScore) {
                bestScore = score;
                move = col;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing, alpha, beta) {
    if (checkWin()) {
        return isMaximizing ? -1 : 1;
    }
    if (checkDraw() || depth === 0) {
        return evaluateBoard(board);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let col = 0; col < 7; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                board[row][col] = 'yellow';
                const eval = minimax(board, depth - 1, false, alpha, beta);
                board[row][col] = null;
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let col = 0; col < 7; col++) {
            const row = findAvailableRow(col);
            if (row !== -1) {
                board[row][col] = 'red';
                const eval = minimax(board, depth - 1, true, alpha, beta);
                board[row][col] = null;
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return minEval;
    }
}

function evaluateBoard(board) {
    let score = 0;
    // Evaluation logic: prioritize center column and potential win paths
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (board[row][col] === 'yellow') {
                score += evaluatePosition(board, row, col, 'yellow');
            } else if (board[row][col] === 'red') {
                score -= evaluatePosition(board, row, col, 'red');
            }
        }
    }
    return score;
}

function evaluatePosition(board, player) {
    let score = 0;
    
    // Check horizontal lines
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col <= 3; col++) {
            score += evaluateLine(board, row, col, 0, 1, player);
        }
    }

    // Check vertical lines
    for (let row = 0; row <= 2; row++) {
        for (let col = 0; col < 7; col++) {
            score += evaluateLine(board, row, col, 1, 0, player);
        }
    }

    // Check diagonal lines (bottom-left to top-right)
    for (let row = 0; row <= 2; row++) {
        for (let col = 0; col <= 3; col++) {
            score += evaluateLine(board, row, col, 1, 1, player);
        }
    }

    // Check diagonal lines (top-left to bottom-right)
    for (let row = 3; row < 6; row++) {
        for (let col = 0; col <= 3; col++) {
            score += evaluateLine(board, row, col, -1, 1, player);
        }
    }

    return score;
}

function evaluateLine(board, startRow, startCol, rowDir, colDir, player) {
    let score = 0;
    let count = 0;

    for (let i = 0; i < 4; i++) {
        const row = startRow + i * rowDir;
        const col = startCol + i * colDir;

        if (board[row] && board[row][col] === player) {
            count++;
        } else if (board[row] && board[row][col] === null) {
            // Empty space, can be a potential spot for future moves
            count++;
        } else {
            // Blocked by opponent
            count = 0;
            break;
        }
    }

    // Adjust score based on number of connected pieces
    if (count === 4) {
        score += 1000; // Winning line
    } else if (count === 3) {
        score += 100; // Potential win line
    }

    return score;
}


createBoard();
buttons.forEach(button => button.addEventListener('click', handleButtonClick));
resetBtn.addEventListener('click', resetBoard);
