const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;

const storedTime = localStorage.getItem("musicTime");
if (storedTime) {
    bgMusic.currentTime = parseFloat(storedTime);
}

window.addEventListener("load", () => {
    bgMusic.play().catch((err) => console.log("Autoplay blocked:", err));
    loadLeaderboard();
});

document.body.addEventListener(
    "click",
    () => {
      if (bgMusic.paused) {
        bgMusic.play().catch((err) => console.log("Still blocked:", err));
      }
    },
    { once: true }
);

// kapag lilipat/close page, save yung time ng music
window.addEventListener("beforeunload", () => {
    localStorage.setItem("musicTime", bgMusic.currentTime);
});

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
});

function loadLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // no duplicate names, highest score lang
    let cleaned = {};
    for (let i = 0; i < leaderboard.length; i++) {
      let player = leaderboard[i];
      if (!cleaned[player.name] || player.score > cleaned[player.name]) {
        cleaned[player.name] = player.score;
      }
    }

    leaderboard = [];
    for (let name in cleaned) {
      leaderboard.push({ name: name, score: cleaned[name] });
    }

    // highest - lowest ng scores
    leaderboard.sort((a, b) => b.score - a.score);

    const board = document.getElementById("leaderboard");
    board.innerHTML = "";

    for (let i = 0; i < leaderboard.length; i++) {
      let player = leaderboard[i];
      let li = document.createElement("li");
      li.innerHTML = `
        <span class="name">${player.name}</span>
        <span class="score">${player.score}</span>
      `;
      board.appendChild(li);
    }
  // localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

// add scores
function addScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // ichecheck kung existing na yung player
    let found = false;
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].name === name) {
        found = true;
        if (score > leaderboard[i].score) {
          leaderboard[i].score = score;
        }
      }
    }

    if (!found) {
      leaderboard.push({ name: name, score: score });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function resetLeaderboard() {
    localStorage.removeItem("leaderboard");
    loadLeaderboard();
}
