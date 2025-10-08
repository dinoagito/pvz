const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;

const storedTime = localStorage.getItem("musicTime");
if (storedTime) {
    bgMusic.currentTime = parseFloat(storedTime);
}

bgMusic.play().catch(err => console.log("Autoplay blocked:", err));

// nagsesave time music if lipat/close page
window.addEventListener("beforeunload", () => {
    localStorage.setItem("musicTime", bgMusic.currentTime);
});

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
});


