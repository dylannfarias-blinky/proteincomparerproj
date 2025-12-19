document.getElementById("year").textContent = new Date().getFullYear();


const SHEET_URL = "https://sheetdb.io/api/v1/9aa5ss3hdm7su";
let bars = [];
let smoothies = [];


// ---------------- FETCH DATA ----------------
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
    alert("Could not load product data.");
  }
}


// ---------------- RENDER LISTS ----------------
function renderLists() {
  const barsList = document.getElementById("barsList");
  const smoothiesList = document.getElementById("smoothiesList");


  if (barsList) {
    barsList.innerHTML = bars.map(b => `
      <div class="product-card carousel-card">
        <img class="product-img"
             src="${b.image || 'https://via.placeholder.com/300x300?text=Protein+Bar'}"
             alt="${b.name}">
        <strong>${b.name}</strong><br>
        ${b.brand}<br>
        <span>${b.protein}g protein</span>
      </div>
    `).join("");
  }


  if (smoothiesList) {
    smoothiesList.innerHTML = smoothies.map(s => `
      <div class="product-card carousel-card">
        <img class="product-img"
             src="${s.image || 'https://via.placeholder.com/300x300?text=Smoothie'}"
             alt="${s.name}">
        <strong>${s.name}</strong><br>
        ${s.brand}<br>
        <span>${s.protein}g protein</span>
      </div>
    `).join("");
  }
}






// ---------------- COMPARISON TOOL ----------------
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


    firstSelect.innerHTML = `<option value="">Select first product</option>` +
      firstOptions.map((p, i) =>
        `<option value="${i}">${p.name || "Unnamed"} (${p.brand || ""})</option>`
      ).join("");


    secondSelect.innerHTML = `<option value="">Select second product</option>` +
      secondOptions.map((p, i) =>
        `<option value="${i}">${p.name || "Unnamed"} (${p.brand || ""})</option>`
      ).join("");


    updateComparison();
  }


  typeSelect.addEventListener("change", updateOptions);
  firstSelect.addEventListener("change", updateComparison);
  secondSelect.addEventListener("change", updateComparison);


  updateOptions();
}


function updateComparison() {
  const type = document.getElementById("typeSelect").value;
  const firstId = document.getElementById("firstSelect").value;
  const secondId = document.getElementById("secondSelect").value;


  let firstArray = type === "sm-sm" ? smoothies : bars;
  let secondArray =
    type === "bar-sm" ? smoothies : type === "sm-sm" ? smoothies : bars;


  const first = firstArray[firstId];
  const second = secondArray[secondId];


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


// ---------------- SEARCH FEATURE ----------------
function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  }
}


document.getElementById("searchBtn").addEventListener("click", runSearch);


document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    runSearch();
  }
});


// Live suggestions
const suggestionsBox = document.getElementById("suggestions");
const liveResults = document.getElementById("liveResults");


document.getElementById("searchInput").addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase().trim();


  if (!query) {
    suggestionsBox.innerHTML = "";
    liveResults.innerHTML = "";
    return;
  }


  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();


    const matches = data.filter(p =>
      (p.flavor && p.flavor.toLowerCase().includes(query)) ||
      (p.name && p.name.toLowerCase().includes(query))
    );


    liveResults.innerHTML = matches.length
      ? matches.slice(0, 6).map(p => `
          <div onclick="location.href='search.html?query=${encodeURIComponent(p.flavor || p.name)}'">
            <strong>${p.name}</strong> — ${p.flavor || ""}
          </div>
        `).join("")
      : `<div class="no-results">No matches found</div>`;


  } catch (err) {
    console.error("Error fetching suggestions:", err);
  }
});


document.addEventListener("click", (e) => {
  if (!document.getElementById("hero").contains(e.target)) {
    suggestionsBox.innerHTML = "";
    liveResults.innerHTML = "";
  }
});


fetchData();
// CONTACT FORM INTERACTIVITY
const contactForm = document.getElementById("contactForm");
const loadingSpinner = document.getElementById("loadingSpinner");
const successPopup = document.getElementById("successPopup");
const closePopup = document.getElementById("closePopup");


if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    loadingSpinner.style.display = "block";      // show spinner
    document.getElementById("submitBtn").disabled = true;
  });
}


if (closePopup) {
  closePopup.addEventListener("click", () => {
    successPopup.style.display = "none";
  });
}


// Detect when FormSubmit redirects back
if (window.location.search.includes("success=true")) {
  successPopup.style.display = "flex";
}



