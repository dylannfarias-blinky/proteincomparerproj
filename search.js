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

    const resultsList = document.getElementById("resultsList");
    if (matches.length) {
      resultsList.innerHTML = matches.map(p => `
        <div class="product-card">
          <strong>${p.name || "Unnamed"}</strong><br>
          ${p.brand || ""} - ${p.protein || 0}g protein<br>
          Flavor: ${p.flavor || "Unknown"}<br>
          Type: ${p.type === "bar" ? "Protein Bar" : "Smoothie"}
        </div>
      `).join("");
    } else {
      resultsList.innerHTML = "<p>No results found for that flavor.</p>";
    }

  } catch (err) {
    console.error(err);
    document.getElementById("resultsList").innerHTML = "<p>Error loading results. Please try again.</p>";
  }
}

fetchResults();
