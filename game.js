const board = document.getElementById("board");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");
const tryAgainButton = document.getElementById("tryAgain");
const livesDisplay = document.getElementById("lives");
const playerNameDisplay = document.getElementById("playerName");
const leaderboardList = document.getElementById("leaderboard");

let sunflowerPositions = [];
let chosenBoxes = [];
let score = 0;
let time = 30;
let timer;
let game = true;
let lives = 3;
let shuffledItems = [];

const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;
bgMusic.play().catch(() => {
  console.log("Autoplay blocked; music will play after first click");
});

document.body.addEventListener(
  "click",
  () => {
    if (bgMusic.paused) {
      bgMusic.play();
    }
  },
  { once: true }
);

// player's username 
const savedUsername = localStorage.getItem("username") || "Guest";
playerNameDisplay.textContent = savedUsername;

// sound effects
function playSound(src) {
  const audio = new Audio(src);
  audio.play();
}

function saveToLeaderboard(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  const existing = leaderboard.find((player) => player.name === name);
  if (existing) {
    if (score > existing.score) {
      existing.score = score;
    }
  } else {
    leaderboard.push({ name, score });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  loadLeaderboard();
}

function loadLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  let unique = {};
  leaderboard.forEach((player) => {
    if (!unique[player.name] || player.score > unique[player.name]) {
      unique[player.name] = player.score;
    }
  });
  leaderboard = Object.keys(unique).map((name) => ({
    name,
    score: unique[name],
  }));

  leaderboard.sort((a, b) => b.score - a.score);

  if (leaderboardList) {
    leaderboardList.innerHTML = "";
    leaderboard.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = `${player.name}: ${player.score}`;
      leaderboardList.appendChild(li);
    });
  }

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function setSunflowers() {
  const totalBoxes = 9;
  let items = [
    "sunflower",
    "sunflower",
    "sunflower",
    "sunflower",
    "zombie",
    "zombie",
    "zombie",
    "zombie",
    "sun",
  ];
  sunflowerPositions = [];
  items = items.sort(() => Math.random() - 0.5);

  items.forEach((item, index) => {
    if (item === "sunflower") sunflowerPositions.push(index);
  });

  return items;
}

//9 boxes
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    let box = document.createElement("div");
    box.className = "box";
    box.dataset.index = i;
    box.innerHTML = `
      <div class="box-inner">
        <div class="box-front">
          <img src="images/logo1.png" style="width:100%">
        </div>
        <div class="box-back"></div>
      </div>
    `;

    // pag-click ng box
    box.addEventListener("click", function () {
      handleBoxClick(i, box);
    });
    board.appendChild(box);
  }
}

// 2 boxes kada round
function handleBoxClick(index, box) {
  if (!game) return;
  if (chosenBoxes.includes(index)) return;

  chosenBoxes.push(index);
  if (chosenBoxes.length > 2) return;

  const backFace = box.querySelector(".box-back");
  box.classList.add("flipped");

  const item = shuffledItems[index];

  // kapag sunflower nahanap
  if (item === "sunflower") {
    backFace.innerHTML =
      '<img src="images/sunflower-unscreen.gif" style="width:100%">';
    backFace.style.backgroundColor = "#90EE90";
    playSound("audios/killpop.mp3");
    score += 25;
    scoreDisplay.textContent = score;
    message.textContent = "You found a sunflower! +25 points";

  // kapag zombie ang nakuha
  } else if (item === "zombie") {
    backFace.innerHTML =
      '<img src="images/Conehead-bg.gif" style="width:60%">';
    backFace.style.backgroundColor = "#FF7F7F";
    playSound("audios/toobad.mp3");
    lives--;
    score -= 10;
    if (score < 0) score = 0;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    message.textContent = "A zombie got you! -10 points, -1 life";

    // kapag ubos na life
    if (lives <= 0) {
      message.textContent = "Game Over!";
      game = false;
      saveToLeaderboard(savedUsername, score);
      tryAgainButton.style.display = "inline-block"; // lalabas try again button
      return;
    }

  // kapag sun ang nakuha
  } else if (item === "sun") {
    backFace.innerHTML = '<img src="images/sun.gif" style="width:80%">';
    backFace.style.backgroundColor = "#FFD700";
    playSound("audios/sun.mp3");
    lives++;
    livesDisplay.textContent = lives;
    message.textContent = "You gained an extra life!";
  }

  // dalawang box lang kada round
  if (chosenBoxes.length === 2) {
    game = false;
    setTimeout(startRound, 1500);
  }
}

function startRound() {
  chosenBoxes = [];
  shuffledItems = setSunflowers();
  createBoard();
  message.textContent = "";
  livesDisplay.textContent = lives;
  time = 15; // bawat round may 15 seconds
  timerDisplay.textContent = time;
  game = true;
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(function () {
    if (!game) {
      clearInterval(timer);
      return;
    }
    time--;
    timerDisplay.textContent = time;

    // kapag time is up
    if (time <= 0) {
      clearInterval(timer);
      message.textContent = "Time's up!";
      game = false;
      saveToLeaderboard(savedUsername, score);
      tryAgainButton.style.display = "inline-block"; // lalabas try again button kapag ubos time
    }
  }, 1000);
}

tryAgainButton.addEventListener("click", () => {
  lives = 3;
  score = 0;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
  message.textContent = "";
  tryAgainButton.style.display = "none";
  startRound();
});

startRound();
