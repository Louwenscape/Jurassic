let currentData = [];
let currentScenario = "";
let currentLang = "nl";

document.addEventListener("DOMContentLoaded", () => {
  loadScenarios();
});

function setLang(lang) {
  currentLang = lang;
  document.getElementById("btn-nl").classList.toggle("active", lang === "nl");
  document.getElementById("btn-en").classList.toggle("active", lang === "en");
  renderQuestions();
}

function loadScenarios() {
  const select = document.getElementById("scenarioSelect");
  fetch("scenarios.json").then(res => res.json()).then(scenarios => {
    select.innerHTML = "";
    scenarios.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
    opt.textContent = typeof name === "string" ? name : name?.file || "onbekend.json";
      select.appendChild(opt);
    });
    select.onchange = () => loadScenario(select.value);
    if (scenarios.length) loadScenario(scenarios[0]);
  });
}

function loadScenario(name) {
  currentScenario = name;
  fetch(name).then(res => res.json()).then(json => {
    currentData = json.questions || json;
    document.getElementById("endTextNl").value = json.endScreen?.nl?.text || "";
    document.getElementById("endTextEn").value = json.endScreen?.en?.text || "";
    document.getElementById("endImage").value = json.endScreen?.image || "";
    renderQuestions();
  });
}

function renderQuestions() {
  const container = document.getElementById("questions");
  container.innerHTML = "";
  currentData.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "question-card draggable";
    card.draggable = true;
    card.ondragstart = e => e.dataTransfer.setData("text/plain", i);
    card.ondrop = e => {
      e.preventDefault();
      const from = +e.dataTransfer.getData("text");
      const to = i;
      const item = currentData.splice(from, 1)[0];
      currentData.splice(to, 0, item);
      renderQuestions();
    };
    card.ondragover = e => e.preventDefault();

    card.innerHTML = `
      <div class="mb-2">
        <label class="block text-sm">Vraag (${currentLang.toUpperCase()})</label>
        <input class="w-full p-1 rounded" value="${q.question?.[currentLang] || ""}" 
          onchange="updateField(${i}, 'question', this.value)">
      </div>
      <div class="mb-2">
        <label class="block text-sm">Beschrijving (${currentLang.toUpperCase()})</label>
        <textarea class="w-full p-1 rounded" onchange="updateField(${i}, 'desc', this.value)">${q.desc?.[currentLang] || ""}</textarea>
      </div>
      <div class="mb-2">
        <label class="block text-sm">Intro (${currentLang.toUpperCase()})</label>
        <textarea class="w-full p-1 rounded" onchange="updateField(${i}, 'intro', this.value)">${q.intro?.[currentLang] || ""}</textarea>
      </div>
      <div class="mb-2">
        <label class="block text-sm">Hint (${currentLang.toUpperCase()})</label>
        <input class="w-full p-1 rounded" value="${q.hint?.[currentLang] || ""}" 
          onchange="updateField(${i}, 'hint', this.value)">
      </div>
      <div class="mb-2">
        <label class="block text-sm">Antwoorden (komma-gescheiden)</label>
        <input class="w-full p-1 rounded" value="${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer || ""}" 
          onchange="updateAnswers(${i}, this.value)">
      </div>
      <div class="mb-2">
        <label class="block text-sm">Tijd per vraag (seconden, leeg = geen tijd)</label>
        <input class="w-full p-1 rounded" value="${q.time || ""}" 
          onchange="currentData[${i}].time = this.value">
      </div>
      <div class="mb-2">
        <label class="block text-sm">Afbeelding</label>
        <input class="w-full p-1 rounded" value="${q.image || ""}" 
          onchange="currentData[${i}].image = this.value">
      </div>
      <div class="mb-2">
        <label class="block text-sm">Achtergrond</label>
        <input class="w-full p-1 rounded" value="${q.background || ""}" 
          onchange="currentData[${i}].background = this.value">
      </div>
      <div class="mb-2">
        <label class="block text-sm font-semibold">🔘 Extra knoppen (${currentLang.toUpperCase()})</label>
        <div id="buttons-${i}" class="space-y-2">
          ${(q.buttons?.[currentLang] || []).map((btn, b) => `
            <div class="bg-gray-800 p-2 rounded">
              <input class="text-sm p-1 mb-1 w-full" placeholder="Label" value="${btn.label}" onchange="updateButton(${i}, ${b}, 'label', this.value)">
              <input class="text-sm p-1 mb-1 w-full" placeholder="Actie (overlay/hint/answer)" value="${btn.action}" onchange="updateButton(${i}, ${b}, 'action', this.value)">
              <textarea class="text-sm p-1 w-full" placeholder="Inhoud (html of tekst)" onchange="updateButton(${i}, ${b}, 'content', this.value)">${btn.content}</textarea>
            </div>`).join("")}
        </div>
        <button onclick="addButton(${i})" class="mt-1 px-2 py-1 bg-blue-700 rounded text-sm">+ knop toevoegen</button>
      </div>
      <button onclick="removeQuestion(${i})" class="mt-2 px-3 py-1 bg-red-700 rounded">❌ Verwijder vraag</button>
    `;
    container.appendChild(card);
  });
}

function updateField(i, key, value) {
  currentData[i][key] = currentData[i][key] || {};
  currentData[i][key][currentLang] = value;
}

function updateAnswers(i, value) {
  const list = value.split(",").map(s => s.trim()).filter(Boolean);
  currentData[i].answer = list;
}

function updateButton(i, b, field, value) {
  currentData[i].buttons = currentData[i].buttons || { nl: [], en: [] };
  currentData[i].buttons[currentLang][b][field] = value;
}

function addButton(i) {
  currentData[i].buttons = currentData[i].buttons || { nl: [], en: [] };
  currentData[i].buttons[currentLang].push({ label: "", action: "", content: "" });
  renderQuestions();
}

function addQuestion() {
  currentData.push({
    question: {}, intro: {}, hint: {}, desc: {}, answer: [],
    background: "", image: "", buttons: { nl: [], en: [] }
  });
  renderQuestions();
}

function removeQuestion(i) {
  if (confirm("Verwijder deze vraag?")) {
    currentData.splice(i, 1);
    renderQuestions();
  }
}

function saveScenario() {
  const endScreen = {
    nl: { text: document.getElementById("endTextNl").value },
    en: { text: document.getElementById("endTextEn").value },
    image: document.getElementById("endImage").value
  };
  const scenarioData = { questions: currentData, endScreen };
  const a = document.createElement("a");
  const blob = new Blob([JSON.stringify(scenarioData, null, 2)], { type: "application/json" });
  a.href = URL.createObjectURL(blob);
  a.download = currentScenario;
  a.click();
}

function createScenario() {
  const naam = prompt("Naam voor nieuwe scenario (bijv. riddles_piraat.json):");
  if (naam) {
    currentScenario = naam;
    currentData = [];
    renderQuestions();
  }
}
function importScenario(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const content = JSON.parse(e.target.result);
      currentData = content.questions || content;
      document.getElementById("endTextNl").value = content.endScreen?.nl?.text || "";
      document.getElementById("endTextEn").value = content.endScreen?.en?.text || "";
      document.getElementById("endImage").value = content.endScreen?.image || "";
      renderQuestions();
    } catch (err) {
      alert("Ongeldig JSON-bestand");
    }
  };
  reader.readAsText(file);
}
