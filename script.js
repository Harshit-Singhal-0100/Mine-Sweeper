let numRows = 9;
let numCols = 9;
let numMines = 10;
let board = [];
let gameOver = false;
let timer = 0;
let timerInterval = null;
let score = 0;

const gameBoard = document.getElementById("game-board");
const numRowsInput = document.getElementById("num-rows");
const numColsInput = document.getElementById("num-cols");
const numMinesInput = document.getElementById("num-mines");
const startGameButton = document.getElementById("start-game");
const restartButton = document.getElementById("restart");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const backgroundMusic = document.getElementById("background-music");
const clickSound = document.getElementById("click-sound");
const explosionSound = document.getElementById("explosion-sound");

startGameButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
darkModeToggle.addEventListener("click", toggleDarkMode);

function preloadAudio() {
  backgroundMusic.volume = 0.1; 
  clickSound.volume = 0.2; 
  explosionSound.volume = 0.8; 

  backgroundMusic.preload = 'auto';
  clickSound.preload = 'auto';
  explosionSound.preload = 'auto';
}

function initializeGame() {
  preloadAudio(); 
  board = [];
  for (let row = 0; row < numRows; row++) {
    board[row] = [];
    for (let col = 0; col < numCols; col++) {
      board[row][col] = {
        isMine: false,
        isRevealed: false,
        count: 0
      };
    }
  }

  let mines = 0;
  while (mines < numMines) {
    const randomRow = Math.floor(Math.random() * numRows);
    const randomCol = Math.floor(Math.random() * numCols);
    if (!board[randomRow][randomCol].isMine) {
      board[randomRow][randomCol].isMine = true;
      mines++;
    }
  }

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (!board[row][col].isMine) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const iloc = row + dx;
            const jloc = col + dy;
            if (iloc >= 0 && iloc < numRows && jloc >= 0 && jloc < numCols && board[iloc][jloc].isMine) {
              count++;
            }
          }
        }
        board[row][col].count = count;
      }
    }
  }
}

function startGame() {
  numRows = parseInt(numRowsInput.value);
  numCols = parseInt(numColsInput.value);
  numMines = parseInt(numMinesInput.value);

  if (numRows < 5 || numCols < 5) {
    alert("Grid size must be at least 5x5");
    return;
  }

  if (numMines < 1 || numMines > (numRows * numCols) / 2) {
    alert("Number of mines must be between 1 and half of the grid size");
    return;
  }

  gameOver = false;
  timer = 0;
  score = 0;
  initializeGame();
  render();
  startTimer();
  backgroundMusic.play(); // Start background music
}

function restartGame() {
  gameOver = false;
  timer = 0;
  score = 0;
  initializeGame();
  render();
  startTimer();
  backgroundMusic.play(); // Start background music
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function revealTile(row, col) {
  if (gameOver || board[row][col].isRevealed) {
    return;
  }

  board[row][col].isRevealed = true;

  if (board[row][col].isMine) {
    explosionSound.currentTime = 0;
    explosionSound.play();
    gameOver = true;
    revealAllMines();
    alert("Game Over");
    stopTimer();
    return;
  } else {
    clickSound.currentTime = 0;
    clickSound.play();
    score++;
  }

  if (board[row][col].count === 0) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (row + dx >= 0 && row + dx < numRows && col + dy >= 0 && col + dy < numCols) {
          revealTile(row + dx, col + dy);
        }
      }
    }
  }

  render();
}

function revealAllMines() {
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (board[row][col].isMine) {
        board[row][col].isRevealed = true;
      }
    }
  }
  render();
}

function render() {
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";

      if (board[row][col].isRevealed) {
        tile.classList.add("revealed");
        if (board[row][col].isMine) {
          tile.classList.add("bomb");
          tile.innerText = "💣";
        } else if (board[row][col].count > 0) {
          tile.innerText = board[row][col].count;
        }
      }

      tile.addEventListener("click", () => {
        revealTile(row, col);
      });

      gameBoard.appendChild(tile);
    }
  }
}
