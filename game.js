let questions = [];
let idx = 0;
let time = 0;
let timerInt = null;
let lang = localStorage.getItem("lang") || "nl";
let scenario = localStorage.getItem("scenario") || "riddles_jurassic.json";
let endScreenData = {};

function showQuestion() {
  const q = questions[idx];
  document.getElementById("intro").innerHTML = q.intro?.[lang] || "";
  document.getElementById("desc").innerHTML = q.desc?.[lang] || "";
  document.getElementById("question").innerHTML = q.question?.[lang] || "";
  document.getElementById("hint").innerText = "";
  document.getElementById("answer").value = "";

  // Timer per vraag
  time = q.time ? Number(q.time) : 0;
  if (timerInt) clearInterval(timerInt);
  if (time) {
    document.getElementById("timer").innerText = `⏱️ ${Math.floor(time/60)}:${(time%60).toString().padStart(2, "0")}`;
    timerInt = setInterval(() => {
      time--;
      document.getElementById("timer").innerText = `⏱️ ${Math.floor(time/60)}:${(time%60).toString().padStart(2, "0")}`;
      if (time <= 0) { clearInterval(timerInt); endScreen(false); }
    }, 1000);
  } else {
    document.getElementById("timer").innerText = "";
  }

  // Afbeelding
// Afbeelding bij de vraag
if (q.image) {
  const imgEl = document.getElementById("qimg");
  imgEl.src = q.image;
  imgEl.classList.remove("hidden");
} else {
  document.getElementById("qimg").classList.add("hidden");
}

// Achtergrond van de pagina instellen (indien opgegeven)
if (q.background) {
  document.body.style.backgroundImage = `url('${q.background}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundPosition = "center center";
  document.body.style.transition = "background-image 0.5s ease-in-out";
}

  

  // Buttons (overlays)
 const btnDiv = document.getElementById("buttons");
btnDiv.innerHTML = "";

// Extra knoppen per vraag (bijv. overlay)
(q.buttons?.[lang] || []).forEach((btn, bidx) => {
  const b = document.createElement("button");
  b.textContent = btn.label;
  b.className = "btn bg-gray-300 text-black font-bold px-3 py-1 rounded shadow active:scale-95";
  b.onclick = () => handleButtonAction(btn);
  btnDiv.appendChild(b);
});

// ➕ Voeg standaard Hint-knop toe (indien er een hint beschikbaar is)
if (q.hint?.[lang]) {
  const hintBtn = document.createElement("button");
  hintBtn.textContent = lang === "nl" ? "Hint" : "Hint";
  hintBtn.className = "btn bg-blue-400 text-black font-bold px-3 py-1 rounded shadow active:scale-95 ml-2";
  hintBtn.onclick = () => {
    document.getElementById("hint").innerText = q.hint?.[lang] || "";
  };
  btnDiv.appendChild(hintBtn);
}

}
function checkAnswer() {
  const q = questions[idx];
  const input = document.getElementById("answer").value.trim().toLowerCase();
  const hintBox = document.getElementById("hint");
  hintBox.innerText = ""; // Reset hint weergave

  // Normaliseer antwoorden
  let answers = [];
  if (Array.isArray(q.answer)) {
    answers = q.answer.map(a => a.trim().toLowerCase());
  } else if (typeof q.answer === "string") {
    answers = q.answer.split(",").map(a => a.trim().toLowerCase());
  }

  // Juist antwoord?
  if (answers.includes(input)) {
    idx++;
    if (idx >= questions.length) {
      endScreen(true);
    } else {
      showQuestion();
    }
  } else {
    // ❌ Fout antwoord: melding
    const msg = lang === "nl" ? "Dat is niet correct. Er gaat 1 minuut van de tijd af." : "That is incorrect. 1 minute deducted.";
    alert(msg);

    // ⏱️ Trek tijd af (indien actief)
    if (q.time && time > 60) {
      time -= 60;
    } else if (q.time && time > 0) {
      time = 0;
      clearInterval(timerInt);
      endScreen(false);
    }

    // ❗ Hint wordt NIET getoond automatisch
    // Speler kan zelf Hint-knop gebruiken
  }
}



function handleButtonAction(btn) {
  const action = btn.action;
  if (action === "overlay") {
    if (btn.content.endsWith(".html")) {
  fetch(btn.content)
    .then(res => res.text())
    .then(html => {
      document.getElementById("overlay-content").innerHTML = html;
      document.getElementById("overlay").classList.remove("hidden");
    })
    .catch(err => {
      document.getElementById("overlay-content").innerHTML = "⚠️ Kan overlay niet laden.";
      document.getElementById("overlay").classList.remove("hidden");
    });
} else {
  // Slimme overlay-loader op basis van content-type
const overlayEl = document.getElementById("overlay-content");
document.getElementById("overlay").classList.remove("hidden");

if (btn.content.endsWith(".html")) {
  fetch(btn.content)
    .then(res => res.text())
    .then(html => overlayEl.innerHTML = html)
    .catch(() => overlayEl.innerHTML = "⚠️ Kan HTML-overlay niet laden.");
} else if (btn.content.endsWith(".jpg") || btn.content.endsWith(".jpeg") || btn.content.endsWith(".png") || btn.content.endsWith(".gif")) {
  overlayEl.innerHTML = `<img src="${btn.content}" class="w-full rounded shadow-lg max-h-[60vh] mx-auto" />`;
} else if (btn.content.endsWith(".mp4")) {
  overlayEl.innerHTML = `<video src="${btn.content}" controls autoplay class="w-full rounded shadow-lg max-h-[60vh] mx-auto"></video>`;
} else {
  overlayEl.innerHTML = btn.content;
}

  document.getElementById("overlay").classList.remove("hidden");
}
    document.getElementById("overlay").classList.remove("hidden");
  } else if (action === "hint") {
    alert(btn.content);
  } else if (action === "answer") {
    document.getElementById("answer").value = btn.content;
  } else if (action === "goto") {
    const goToIndex = parseInt(btn.content);
    if (!isNaN(goToIndex) && goToIndex >= 0 && goToIndex < questions.length) {
      idx = goToIndex;
      showQuestion();
    }
  } else {
    console.warn("Onbekende actie:", action);
  }
}

function closeOverlay() {
  document.getElementById("overlay").classList.add("hidden");
}

function endScreen(win) {
  clearInterval(timerInt);
  const text = endScreenData?.[lang]?.text || (win ? "Je hebt gewonnen!" : "Je hebt verloren");
  const img = endScreenData?.image || "";
  document.body.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-90 text-white fade-in text-center p-6">
      <h1 class="text-4xl font-bold mb-8">${win ? "🎉" : "🔒"} ${text}</h1>
      ${img ? `<img src="${img}" class="mb-6 max-h-80 rounded shadow-xl" />` : ""}
      <button onclick="window.location.href='index.html'" class="btn bg-yellow-500 px-4 py-2 font-bold rounded shadow">Opnieuw spelen</button>
    </div>
  `;
}

fetch(scenario)
  .then(r => r.json())
  .then(data => {
    if (Array.isArray(data)) {
      questions = data;
      endScreenData = {};
    } else {
      questions = data.questions || [];
      endScreenData = data.endScreen || {};
    }
    idx = 0;
    showQuestion();
  });
