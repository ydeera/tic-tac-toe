
const players = { first: '🐢', last: '🐇' };
let isGameStart = false;
let gameBoard;
let humanMark = players.first;
let aiMark = players.last;

const onPlay = document.querySelector('.onplay p');
const initialText = "Let's play !";

onPlay.addEventListener('click', gameStart);

function gameStart() {
  gameBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  cells.forEach((cell) => (cell.textContent = ''));
  isGameStart = true;
  onPlay.textContent = initialText;
  onPlay.parentElement.classList.add('hidden');
  addRound();
  if (aiMark == players.first) aiPlay();
}
function reset() {
  onPlay.parentElement.classList.remove('hidden');
  isGameStart = false;
}

const characters = document.querySelectorAll('.character');
characters.forEach((ch) => ch.addEventListener('click', togglePlayer));

function togglePlayer() {
  reset();
  const mark = this.textContent == players.first ? players.last : players.first;
  humanMark = mark;
  this.textContent = humanMark;
  characters.forEach((ch) => {
    if (ch !== this) {
      aiMark = humanMark == players.first ? players.last : players.first;
      ch.textContent = aiMark;
      ch.classList.remove('selected');
    }
    this.classList.add('selected');
  });
}

const levels = document.querySelectorAll('#level p');
levels.forEach((level) => level.addEventListener('click', changeLevel));

let level = 25; //default mode: easy
const setGameLevel = (value) => {
  level = value;
};
const getGameLevel = () => {
  return level;
};
function changeLevel() {
  const siblings = Array.from(this.parentElement.children);
  siblings.forEach((e) => {
    if (e !== this) {
      e.classList.remove('clicked');
    }
  });
  this.classList.add('clicked');
  const text = this.textContent.toLowerCase();
  if (text === 'easy') {
    //25% minimax,75% random
    setGameLevel(25);
  } else if (text === 'medium') {
    //50% minimax,50% random
    setGameLevel(50);
  } else if (text === 'hard') {
    //75% minimax,25% random
    setGameLevel(75);
  } else {
    //100% minimax
    setGameLevel(100);
  }
  reset();
}

const cells = document.querySelectorAll('.btns');
cells.forEach((btn) => btn.addEventListener('click', humanPlay));

function humanPlay() {
  if (!isGameStart || this.textContent) return;
  this.textContent = humanMark;
  setBoardField(this, humanMark);

  if (checkWinner(gameBoard, humanMark)) {
    setTerminalInfo(humanMark);
    addScore();
    reset();
  }

  checkDraw();

  aiPlay();
}

const getAllEmptySpots = (currBoard) => {
  return currBoard.filter((i) => i !== players.first && i !== players.last);
};

function aiPlay() {
  const availSpots = getAllEmptySpots(gameBoard);
  if (!availSpots.length) return;
  const level = getGameLevel();
  const value = Math.floor(Math.random() * (100 + 1));
  let idx;
  if (value <= level) {
    idx = minimax(gameBoard, aiMark).index;
  } else {
    //get random indexes from availSpots
    idx = availSpots[Math.floor(Math.random() * availSpots.length)];
  }
  cells[idx].textContent = aiMark;
  setBoardField(cells[idx], aiMark);

  if (checkWinner(gameBoard, aiMark)) {
    setTerminalInfo(aiMark);
    reset();
  }
  checkDraw();
}

function checkDraw() {
  const availSpots = getAllEmptySpots(gameBoard);
  if (!availSpots.length) {
    setTerminalInfo('');
    reset();
  }
  return;
}

function addScore() {
  const score = document.querySelector('#score');
  score.textContent = sessionStorage.getItem('score') || 0;
  const scoreNum = parseInt(score.textContent) + 1;
  sessionStorage.setItem('score', scoreNum);
  score.textContent = scoreNum;
}

function addRound() {
  const round = document.querySelector('#round');
  round.textContent = sessionStorage.getItem('round') || 0;
  const roundNum = parseInt(round.textContent) + 1;
  sessionStorage.setItem('round', roundNum);
  round.textContent = roundNum;
}

function setBoardField(cell, mark) {
  const idx = cell.dataset.index;
  gameBoard[idx] = mark;
}

function setTerminalInfo(mark) {
  if (mark == players.first) {
    onPlay.textContent = `${players.first} wins! Slow is fast 🎉`;
  } else if (mark == players.last) {
    onPlay.textContent = `${players.last} wins! Cherish your innate abilities 🎉`;
  } else {
    onPlay.textContent = "🎉It's a draw!🎉";
  }
}

const checkWinner = (currBoard, currMark) => {
  if (
    (currBoard[0] === currMark &&
      currBoard[1] === currMark &&
      currBoard[2] === currMark) ||
    (currBoard[3] === currMark &&
      currBoard[4] === currMark &&
      currBoard[5] === currMark) ||
    (currBoard[6] === currMark &&
      currBoard[7] === currMark &&
      currBoard[8] === currMark) ||
    (currBoard[0] === currMark &&
      currBoard[3] === currMark &&
      currBoard[6] === currMark) ||
    (currBoard[1] === currMark &&
      currBoard[4] === currMark &&
      currBoard[7] === currMark) ||
    (currBoard[2] === currMark &&
      currBoard[5] === currMark &&
      currBoard[8] === currMark) ||
    (currBoard[0] === currMark &&
      currBoard[4] === currMark &&
      currBoard[8] === currMark) ||
    (currBoard[2] === currMark &&
      currBoard[4] === currMark &&
      currBoard[6] === currMark)
  ) {
    return true;
  } else {
    return false;
  }
};

const minimax = (currBoard, currMark) => {
  const availSpots = getAllEmptySpots(currBoard);

  if (checkWinner(currBoard, humanMark)) {
    return { score: -1 };
  } else if (checkWinner(currBoard, aiMark)) {
    return { score: 1 };
  } else if (availSpots.length == 0) {
    return { score: 0 };
  }

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = currBoard[availSpots[i]];
    currBoard[availSpots[i]] = currMark;
    if (currMark == aiMark) {
      const result = minimax(currBoard, humanMark);
      move.score = result.score;
    } else {
      const result = minimax(currBoard, aiMark);
      move.score = result.score;
    }
    currBoard[availSpots[i]] = move.index;
    moves.push(move);
  }

  let bestMove;
  if (currMark === aiMark) {
    let bestSCore = -100;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestSCore) {
        bestSCore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestSCore = 100;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestSCore) {
        bestSCore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
};
