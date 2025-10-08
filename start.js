const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;

const storedTime = localStorage.getItem("musicTime");
if (storedTime) {
    bgMusic.currentTime = parseFloat(storedTime);
}

document.addEventListener(
    "click",
    () => {
      if (bgMusic.paused) {
        bgMusic.play().catch((err) => console.log("Autoplay blocked:", err));
      }
    },
    { once: true }
);

// nagsesave time music if lipat/close page
window.addEventListener("beforeunload", () => {
    localStorage.setItem("musicTime", bgMusic.currentTime);
});

document.getElementById("playBtn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    if (username === "") {
      alert("Enter a username first.");
      return;
    }
    localStorage.setItem("username", username);
    window.location.href = "game.html";
});

document.getElementById("instructionsBtn").addEventListener("click", () => {
    window.location.href = "instruction.html";
});

document.getElementById("leaderboardBtn").addEventListener("click", () => {
    window.location.href = "leaderboard.html";
});
