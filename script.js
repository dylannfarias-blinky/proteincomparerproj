
document.getElementById("year").textContent = new Date().getFullYear();

const SHEET_URL = "https://sheetdb.io/api/v1/9aa5ss3hdm7su";
let bars = [];
let smoothies = [];

async function fetchData() {
  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error("Bad response from server");
    const data = await res.json();

    bars = data.filter(row => row.type === "bar");
    smoothies = data.filter(row => row.type === "sm");

    renderLists();
    populateFirstSecondSelects();
  } catch (err) {
    console.error("Error fetching sheet:", err);
    alert("Could not load product data. Check SheetDB URL and CORS settings.");
  }
}

function renderLists() {
  const barsList = document.getElementById("barsList");
  const smoothiesList = document.getElementById("smoothiesList");

  if (barsList) {
    barsList.innerHTML = bars.length
      ? bars.map(b =>
          `<div class="product-card"><strong>${b.name || "Unnamed"}</strong><br>${b.brand || ""} - ${b.protein || 0}g protein</div>`
        ).join("")
      : "<p>No bars found.</p>";
  }

  if (smoothiesList) {
    smoothiesList.innerHTML = smoothies.length
      ? smoothies.map(s =>
          `<div class="product-card"><strong>${s.name || "Unnamed"}</strong><br>${s.brand || ""} - ${s.protein || 0}g protein</div>`
        ).join("")
      : "<p>No smoothies found.</p>";
  }
}

function populateFirstSecondSelects() {
  const typeSelect = document.getElementById("typeSelect");
  const firstSelect = document.getElementById("firstSelect");
  const secondSelect = document.getElementById("secondSelect");

  function updateOptions() {
    const type = typeSelect.value;
    let firstOptions = [];
    let secondOptions = [];

    if (type === "bar-sm") {
      firstOptions = bars;
      secondOptions = smoothies;
    } else if (type === "bar-bar") {
      firstOptions = secondOptions = bars;
    } else if (type === "sm-sm") {
      firstOptions = secondOptions = smoothies;
    }

    firstSelect.innerHTML = '<option value="">Select first product</option>' +
      firstOptions.map((p, i) => `<option value="${p._id || i}">${p.name || "Unnamed"} (${p.brand || ""})</option>`).join("");

    secondSelect.innerHTML = '<option value="">Select second product</option>' +
      secondOptions.map((p, i) => `<option value="${p._id || i}">${p.name || "Unnamed"} (${p.brand || ""})</option>`).join("");

    updateComparison();
  }

  typeSelect.addEventListener("change", updateOptions);
  firstSelect.addEventListener("change", updateComparison);
  secondSelect.addEventListener("change", updateComparison);

  updateOptions();
}

function updateComparison() {
  const firstId = document.getElementById("firstSelect").value;
  const secondId = document.getElementById("secondSelect").value;
  const type = document.getElementById("typeSelect").value;

  let firstArray = (type === "sm-sm") ? smoothies : bars;
  let secondArray = (type === "bar-sm") ? smoothies : ((type === "sm-sm") ? smoothies : bars);

  const first = firstArray.find((p, i) => (p._id || i).toString() === firstId);
  const second = secondArray.find((p, i) => (p._id || i).toString() === secondId);

  document.getElementById("firstCalories").textContent = first?.calories ?? "–";
  document.getElementById("firstProtein").textContent = first?.protein ? first.protein + "g" : "–";
  document.getElementById("firstSugar").textContent = first?.sugar ?? "–";
  document.getElementById("firstFat").textContent = first?.fat ?? "–";
  document.getElementById("firstPrice").textContent = first?.price ? "$" + first.price : "–";

  document.getElementById("secondCalories").textContent = second?.calories ?? "–";
  document.getElementById("secondProtein").textContent = second?.protein ? second.protein + "g" : "–";
  document.getElementById("secondSugar").textContent = second?.sugar ?? "–";
  document.getElementById("secondFat").textContent = second?.fat ?? "–";
  document.getElementById("secondPrice").textContent = second?.price ? "$" + second.price : "–";
}

// ---------- SEARCH FEATURE ----------
const suggestionsBox = document.getElementById("suggestions");

function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  }
}

document.getElementById("searchBtn").addEventListener("click", runSearch);

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    runSearch();
  }
});

document.getElementById("searchInput").addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    suggestionsBox.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();

    const matches = data.filter(p =>
      (p.flavor && p.flavor.toLowerCase().includes(query)) ||
      (p.name && p.name.toLowerCase().includes(query))
    );

    if (matches.length) {
      suggestionsBox.innerHTML = matches
        .map(p => `
          <div class="suggestion-item" data-flavor="${p.flavor || p.name}">
            ${p.flavor || p.name} (${p.brand || ""})
          </div>
        `)
        .join("");
    } else {
      suggestionsBox.innerHTML = "<div class='suggestion-item'>No matches</div>";
    }

    document.querySelectorAll(".suggestion-item").forEach(item => {
      item.addEventListener("click", () => {
        const flavor = item.getAttribute("data-flavor");
        if (flavor) {
          window.location.href = `search.html?query=${encodeURIComponent(flavor)}`;
        }
      });
    });
  } catch (err) {
    console.error("Error fetching suggestions:", err);
  }
});

document.addEventListener("click", (e) => {
  if (!document.getElementById("hero").contains(e.target)) {
    suggestionsBox.innerHTML = "";
  }
});

fetchData();
