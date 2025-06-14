let questions = [];
let idx = 0;
let time = 0;
let timerInt = null;
let lang = localStorage.getItem("lang") || "nl";
let scenario = localStorage.getItem("scenario") || "riddles_jurassic.json";
let endScreenData = {};

function setLanguage(value) {
  localStorage.setItem("lang", value);
  lang = value;
}



let typewriterTimeouts = [];

function clearTypewriter() {
  typewriterTimeouts.forEach(t => clearTimeout(t));
  typewriterTimeouts = [];
}

function typeText(element, text, speed = 20, callback) {
  clearTypewriter(); // Cancel any previous typing

  if (typeof text !== "string") text = String(text);
  const lines = text.split("\n");

  element.innerHTML = "";
  let currentLine = 0;
  let currentChar = 0;

  function typeLine() {
    if (currentLine >= lines.length) {
      if (callback) callback();
      return;
    }

    if (currentChar < lines[currentLine].length) {
      element.innerHTML += lines[currentLine].charAt(currentChar);
      currentChar++;
      const timeout = setTimeout(typeLine, speed);
      typewriterTimeouts.push(timeout);
    } else {
      element.innerHTML += "<br>";
      currentLine++;
      currentChar = 0;
      const timeout = setTimeout(typeLine, speed);
      typewriterTimeouts.push(timeout);
    }
  }

  typeLine();
}





function showQuestion() {


  const q = questions[idx];
  const block = document.getElementById("question-block");
block.classList.remove("visible"); // reset
block.classList.add("fade-in-delay"); // ensure it fades

setTimeout(() => {
  block.classList.add("visible");
}, 1500); // fade-in delay

  document.getElementById("desc").innerHTML = (q.desc?.[lang] || "").replace(/\n/g, "<br>");
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
      showIntroThenQuestion();
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
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlay-content");

  if (btn.action === "overlay") {
    if (btn.content.endsWith(".html")) {
      fetch(btn.content)
        .then(res => res.text())
        .then(html => {
          overlayContent.innerHTML = html;
          overlay.classList.remove("hidden");

          // ✅ Fix accordion buttons with animated toggle
          overlayContent.querySelectorAll("[onclick*='toggleAccordion']").forEach(button => {
            const match = button.getAttribute("onclick").match(/'([^']+)'/);
            if (!match) return;
            const targetId = match[1];
            const contentEl = document.getElementById(targetId);

            button.removeAttribute("onclick"); // prevent default
            button.addEventListener("click", () => {
              if (!contentEl) return;
              const expanded = !contentEl.classList.contains("hidden");
              contentEl.style.maxHeight = expanded ? "0px" : contentEl.scrollHeight + "px";
              contentEl.classList.toggle("hidden");

              // animate height
              contentEl.style.transition = "max-height 0.4s ease";
            });
          });
        })
        .catch(() => {
          overlayContent.innerHTML = "<p class='text-red-400'>⚠️ Kon overlay niet laden.</p>";
          overlay.classList.remove("hidden");
        });
    } else if (btn.content.match(/\.(jpg|png|jpeg|gif)$/)) {
      overlayContent.innerHTML = `<img src="${btn.content}" class="w-full rounded shadow" />`;
      overlay.classList.remove("hidden");
    } else if (btn.content.endsWith(".mp4")) {
      overlayContent.innerHTML = `<video src="${btn.content}" controls autoplay class="w-full rounded"></video>`;
      overlay.classList.remove("hidden");
    } else {
      overlayContent.innerHTML = btn.content;
      overlay.classList.remove("hidden");
    }
  }

  else if (btn.action === "hint") {
    const q = questions[idx];
    document.getElementById("hint").innerText = q.hint?.[lang] || "";
  }

  else if (btn.action === "answer") {
    document.getElementById("answer").value = btn.content;
  }

  else if (btn.action === "goto") {
    const target = parseInt(btn.content);
    if (!isNaN(target) && target >= 0 && target < questions.length) {
      idx = target;
      showIntroThenQuestion();
    }
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
    showIntroThenQuestion();
  });

function showIntroThenQuestion() {
  const q = questions[idx];
  console.log("Intro raw object:", q.intro);
console.log("Intro resolved string:", q.intro?.[lang]);
const introText = q.intro?.[lang] || "";


  console.log("Introtekst geladen:", introText);


  document.getElementById("game-container").classList.add("hidden");

  if (!introText.trim()) {
    showQuestion();
    return;
  }

  // achtergrond instellen
  if (q.background) {
    document.body.style.backgroundImage = `url('${q.background}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center center";
  }

  const introPage = document.getElementById("intro-page");
  const introContent = document.getElementById("intro-content");

  introPage.classList.remove("hidden", "visible");
  setTimeout(() => introPage.classList.add("visible"), 100);
introContent.innerHTML = "";

 typeText(introContent, introText, 20); // typemachine zonder vertraging op knop
 
  document.querySelector(".bg-black.bg-opacity-80").classList.add("hidden");
}

function startRealQuestion() {
  document.getElementById("intro-page").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");
  showQuestion();
}


function startFirstQuestion() {
  document.getElementById("answer-section").classList.remove("hidden");
  showQuestion(); // toont dan idx 0 zoals normaal
}
