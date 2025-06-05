
let riddles = JSON.parse(localStorage.getItem("riddles") || "[]");

function renderRiddles() {
  const list = document.getElementById("riddle-list");
  list.innerHTML = "";
  riddles.forEach((r, i) => {
    const item = document.createElement("li");
    item.className = "bg-gray-700 p-4 rounded flex justify-between items-center";
    item.draggable = true;
    item.ondragstart = e => {
      e.dataTransfer.setData("text/plain", i);
    };
    item.ondragover = e => e.preventDefault();
    item.ondrop = e => {
      const from = parseInt(e.dataTransfer.getData("text/plain"));
      const to = i;
      const item = riddles.splice(from, 1)[0];
      riddles.splice(to, 0, item);
      saveAndRender();
    };
    item.innerHTML = `
      <div>
        <p class="font-bold">${r.question}</p>
        <p class="text-sm italic text-gray-300">${r.intro || ""}</p>
      </div>
      <div class="space-x-2">
        <button onclick="editRiddle(${i})" class="bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded">✏️</button>
        <button onclick="deleteRiddle(${i})" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded">🗑️</button>
      </div>`;
    list.appendChild(item);
  });
}

function saveAndRender() {
  localStorage.setItem("riddles", JSON.stringify(riddles));
  renderRiddles();
}

function editRiddle(index) {
  const r = riddles[index];
  document.getElementById("edit-index").value = index;
  document.getElementById("question").value = r.question;
  document.getElementById("answer").value = r.answer;
  document.getElementById("hint").value = r.hint;
  document.getElementById("intro").value = r.intro || "";
  document.getElementById("description").value = r.description || "";
  document.getElementById("image").value = r.image || "";
  document.getElementById("background").value = r.background || "";
}

document.getElementById("riddle-form").addEventListener("submit", e => {
  e.preventDefault();
  const question = document.getElementById("question").value;
  const answer = document.getElementById("answer").value;
  const hint = document.getElementById("hint").value;
  const intro = document.getElementById("intro").value;
  const description = document.getElementById("description").value;
  const image = document.getElementById("image").value;
  const background = document.getElementById("background").value;
  const newRiddle = { question, answer, hint, intro, description, image, background };
  const index = document.getElementById("edit-index").value;
  if (index === "") riddles.push(newRiddle);
  else riddles[index] = newRiddle;
  e.target.reset();
  document.getElementById("edit-index").value = "";
  saveAndRender();
});

function deleteRiddle(i) {
  if (confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) {
    riddles.splice(i, 1);
    saveAndRender();
  }
}

function exportRiddles() {
  const blob = new Blob([JSON.stringify(riddles, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "riddles.json";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("importFile").addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = evt => {
    riddles = JSON.parse(evt.target.result);
    saveAndRender();
  };
  reader.readAsText(file);
});

renderRiddles();
