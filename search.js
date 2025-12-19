// Update year in footer
document.getElementById("year").textContent = new Date().getFullYear();


// Back to home button
document.getElementById("homeBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});


const SHEET_URL = "https://sheetdb.io/api/v1/9aa5ss3hdm7su";


async function fetchResults() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query")?.toLowerCase() || "";
  document.getElementById("searchTitle").textContent = `Results for "${query}"`;


  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error("Error fetching data");


    const data = await res.json();


    const matches = data.filter(p =>
      (p.flavor && p.flavor.toLowerCase().includes(query)) ||
      (p.name && p.name.toLowerCase().includes(query))
    );


    const grid = document.getElementById("resultsGrid");


    if (matches.length) {
      grid.innerHTML = matches.map(p => `
        <div class="result-card">
          <img class="result-img"
            src="${p.image || 'https://via.placeholder.com/300x300?text=Product'}"
            alt="${p.name}">
         
          <div class="result-name">${p.name || "Unnamed"}</div>
          <div class="result-brand">${p.brand || ""}</div>


          <div class="badge-row">
            <div class="badge">🔥 ${p.calories || "–"} cal</div>
            <div class="badge">💪 ${p.protein || 0}g protein</div>
            <div class="badge">🍬 ${p.sugar || "–"} sugar</div>
            <div class="badge">🥑 ${p.fat || "–"} fat</div>
            <div class="badge">$${p.price || "–"}</div>
            <div class="badge type-badge">
              ${p.type === "bar" ? "Protein Bar" : "Smoothie"}
            </div>
          </div>
        </div>
      `).join("");
    } else {
      grid.innerHTML = "<p>No results found.</p>";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("resultsGrid").innerHTML =
      "<p>Error loading results. Please try again.</p>";
  }
}


fetchResults();



