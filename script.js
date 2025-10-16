const articlesContainer = document.getElementById("articles");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");
const noResultsMsg = document.getElementById("no-results");

let articles = [];
let filteredArticles = [];
const articlesPerPage = 5;
let currentPage = 1;
let currentCategory = "All";

// ✅ strip HTML maar behoud <br> als newline
function stripHtml(html) {
  if (!html) return "";
  let clean = html.replace(/<br\s*\/?>/gi, "\n"); // <br> → newline
  const tmp = document.createElement("div");
  tmp.innerHTML = clean;
  return tmp.textContent || tmp.innerText || "";
}

// ✅ korte tekst met “...”
function shortText(text, max = 120) {
  if (!text) return "";
  const s = stripHtml(text).trim();
  if (s.length > max) {
    // voeg "..." toe op het einde
    return s.slice(0, max).trim() + "...";
  }
  return s;
}

// ✅ veilige parse van datum
function parseDateSafe(d) {
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}

// ✅ Artikelen laden en sorteren
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    articles = Array.isArray(data) ? data.slice() : [];

    // sorteer op datum (nieuwste eerst), anders op id
    articles.sort((a, b) => {
      const ta = parseDateSafe(a.date);
      const tb = parseDateSafe(b.date);
      if (ta !== null && tb !== null) return tb - ta;
      if (ta !== null) return -1;
      if (tb !== null) return 1;
      const ia = parseInt(a.id, 10) || 0;
      const ib = parseInt(b.id, 10) || 0;
      return ib - ia;
    });

    filteredArticles = articles.slice();
    renderArticles();
  })
  .catch(err => console.error("Error loading articles:", err));

// ✅ Artikelen renderen
function renderArticles() {
  const end = currentPage * articlesPerPage;
  const toDisplay = filteredArticles.slice(0, end);

  if (toDisplay.length === 0) {
    articlesContainer.innerHTML = "";
    noResultsMsg.style.display = "block";
    loadMoreBtn.style.display = "none";
    return;
  } else {
    noResultsMsg.style.display = "none";
  }

  articlesContainer.innerHTML = toDisplay.map(a => {
    const thumbHtml = a.thumbnail
      ? `<img src="${a.thumbnail}" alt="${escapeHtml(a.title)}" class="article-thumb">`
      : "";
    const summary = shortText(a.content, 120).replace(/\n/g, "<br>"); // br behouden
    const meta = `<p class="meta">By ${escapeHtml(a.author || "Unknown")} - ${escapeHtml(a.date || "")}</p>`;

    return `
      <article class="article-card" data-category="${escapeHtml(a.category || "")}">
        ${thumbHtml}
        <div class="article-content">
          <h3><a href="article.html?id=${encodeURIComponent(a.id)}">${escapeHtml(a.title)}</a></h3>
          ${meta}
          <p>${summary}</p>
          <div class="article-footer">
            <a href="article.html?id=${encodeURIComponent(a.id)}" class="btn">Read More</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  loadMoreBtn.style.display = end < filteredArticles.length ? "block" : "none";
}

// ✅ Load More
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  renderArticles();
});

// ✅ Categorieën
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    currentCategory = (link.dataset.category || "All").toString();
    filterArticles();
  });
});

// ✅ Zoeken
searchInput.addEventListener("input", () => {
  filterArticles();
});

// ✅ Filteren
function filterArticles() {
  const q = (searchInput.value || "").toLowerCase().trim();
  const cat = (currentCategory || "All").toLowerCase();

  filteredArticles = articles.filter(article => {
    const matchesCategory = cat === "all" || (article.category || "").toLowerCase() === cat;
    const title = (article.title || "").toLowerCase();
    const content = stripHtml(article.content || "").toLowerCase();
    const matchesSearch = title.includes(q) || content.includes(q);
    return matchesCategory && matchesSearch;
  });

  currentPage = 1;
  renderArticles();
}

// ✅ HTML escaper
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
