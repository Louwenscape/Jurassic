let langKey = localStorage.getItem("lang") || "nl";

// 🔧 Auto-render scenario's
function renderScenarios(scenarios) {
  const container = document.getElementById('scenarios');
  container.innerHTML = "";

  scenarios.forEach(s => {
    const div = document.createElement("div");

    div.className = "scenario-card rounded-xl p-4 shadow-xl hover:shadow-yellow-500 transition cursor-pointer fade-in";
    div.style.backgroundColor = "#2e3b2f"; // donkergroen kaartkleur
    div.style.color = "#ffffff";
    div.style.border = "2px solid #ccaa44";

    div.innerHTML = `
      <div class="mx-auto mb-3 h-24 w-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow bg-black flex items-center justify-center">
  <img src="${s.img}" alt="scenario icon" class="object-cover h-full w-full" />
</div>
      <h2 class="text-2xl font-bold mb-2 text-[#ccaa44]">${s.title?.[langKey] || s.title?.nl}</h2>
      <p class="mb-2 text-sm text-gray-200">${s.desc?.[langKey] || s.desc?.nl}</p>
      <button class="bg-[#ccaa44] hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded shadow active:scale-95 mt-2">
        ${langKey === 'nl' ? 'Start spel' : 'Start game'}
      </button>
    `;

    div.querySelector("button").onclick = () => {
      localStorage.setItem("lang", langKey);
      localStorage.setItem("scenario", s.file);
      window.location.href = s.page || "game.html";
    };

    container.appendChild(div);
  });
}

// 🔁 Taalwisselaars
document.getElementById("lang-nl").onclick = () => {
  langKey = "nl";
  localStorage.setItem("lang", "nl");
  load();
};

document.getElementById("lang-en").onclick = () => {
  langKey = "en";
  localStorage.setItem("lang", "en");
  load();
};

// 🔃 Scenario's ophalen
function load() {
  fetch("scenarios.json")
    .then(res => res.json())
    .then(data => renderScenarios(data));
}

load();
