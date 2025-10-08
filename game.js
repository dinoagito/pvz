const board = document.getElementById("board");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart");
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

document.body.addEventListener("click", () => {
    if (bgMusic.paused) {
        bgMusic.play();
    }
}, { once: true });

const savedUsername = localStorage.getItem("username") || "Guest";
playerNameDisplay.textContent = savedUsername;

function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}

function saveToLeaderboard(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // checkcheck kung ang name ng player already exists
    const existing = leaderboard.find(player => player.name === name);
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

    // no duplicates names then keep highest score only
    let unique = {};
    leaderboard.forEach(player => {
        if (!unique[player.name] || player.score > unique[player.name]) {
            unique[player.name] = player.score;
        }
    });
    leaderboard = Object.keys(unique).map(name => ({ name, score: unique[name] }));

    leaderboard.sort((a, b) => b.score - a.score);

    leaderboardList.innerHTML = "";
    leaderboard.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name}: ${player.score}`;
        leaderboardList.appendChild(li);
    });

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

// 9 boxes: 1 sun, 4 sunflowers, and 4 zombies
function setSunflowers() {
    const totalBoxes = 9;
    let items = ["sunflower", "sunflower", "sunflower", "sunflower", "zombie", "zombie", "zombie", "zombie", "sun"];
    sunflowerPositions = [];

    // shuffle the sun, sunflowers, and zombies
    items = items.sort(() => Math.random() - 0.5);

    items.forEach((item, index) => {
        if (item === "sunflower") sunflowerPositions.push(index);
    });

    return items;
}

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

        box.addEventListener("click", function () {
            handleBoxClick(i, box);
        });
        board.appendChild(box);
    }
}

function handleBoxClick(index, box) {
    if (!game) return;
    if (chosenBoxes.includes(index)) return;

    chosenBoxes.push(index);

    // para hindi magka-extra clicks if already chosen 2 boxes
    if (chosenBoxes.length > 2) return;

    const backFace = box.querySelector(".box-back");
    box.classList.add("flipped");

    // shuffle
    const item = shuffledItems[index];

    if (item === "sunflower") {
        backFace.innerHTML = '<img src="images/sunflower-unscreen.gif" style="width:100%">';
        backFace.style.backgroundColor = "#90EE90";
        playSound("audios/killpop.mp3");

        // +25 points for sunflower
        score += 25;
        scoreDisplay.textContent = score;
        message.textContent = "You found a sunflower! +25 points";
    } else if (item === "zombie") {
        backFace.innerHTML = '<img src="images/conehead-bg.gif" style="width:60%">';
        backFace.style.backgroundColor = "#FF7F7F";
        playSound("audios/toobad.mp3");
        lives--;

        // -10 points for zombie
        score -= 10;
        if (score < 0) score = 0;
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;

        message.textContent = "A zombie got you! -10 points, -1 life";

        if (lives <= 0) {
            message.textContent = "Game Over!";
            game = false;
            saveToLeaderboard(savedUsername, score);
            return;
        }

    } else if (item === "sun") {
        backFace.innerHTML = '<img src="images/sun.gif" style="width:80%">';
        backFace.style.backgroundColor = "#FFD700";
        playSound("audios/plants-vs-zombies-sun-pickup.mp3");
        lives++;
        livesDisplay.textContent = lives;
        message.textContent = "You gained an extra life!";
    }

    // 2 clicks only, then start next round
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

    // para hindi magreset yung lives
    livesDisplay.textContent = lives; 
    time = 15; 
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
        if (time <= 0) {
            clearInterval(timer);
            message.textContent = "Time's up.";
            game = false;
            saveToLeaderboard(savedUsername, score);
        }
    }, 1000);
}

restartButton.addEventListener("click", function () {
    score = 0;
    scoreDisplay.textContent = score;
    startRound();
});

startRound();
