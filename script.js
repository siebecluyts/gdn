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

// --- helpers ---
// behoud <br> als newline, verwijder andere HTML
function htmlToTextKeepBr(html) {
  if (!html) return "";
  let s = String(html).replace(/<br\s*\/?>/gi, "\n");
  const tmp = document.createElement("div");
  tmp.innerHTML = s;
  return tmp.textContent || tmp.innerText || "";
}

// veilige escape voor tonen in HTML (maar reintroduce <br> after escaping)
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// maak korte samenvatting uit content (behoud nieuwe regels), voeg "..." als afgekapt
function makeSummaryFromContent(htmlContent, maxChars = 120) {
  const plain = htmlToTextKeepBr(htmlContent).trim();
  if (plain.length <= maxChars) {
    return escapeHtml(plain).replace(/\n/g, "<br>");
  }
  const sliced = plain.slice(0, maxChars).trim() + "...";
  return escapeHtml(sliced).replace(/\n/g, "<br>");
}

// parse date safely
function parseDateSafe(d) {
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}

// --- load en sorteer artikelen ---
// --- load en sorteer artikelen ---
// --- load en sorteer artikelen ---
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    articles = Array.isArray(data) ? data.slice() : [];

    // sorteer artikelen: nieuwste datum eerst
    articles.sort((a, b) => {
      const ta = parseDateSafe(a.date); // null als geen datum
      const tb = parseDateSafe(b.date);

      if (ta !== null && tb !== null) return tb - ta; // nieuwste eerst
      if (ta !== null) return -1; // a heeft datum, b niet → a eerst
      if (tb !== null) return 1;  // b heeft datum, a niet → b eerst

      // fallback naar numerieke id
      const ia = Number(a.id) || 0;
      const ib = Number(b.id) || 0;
      return ib - ia;
    });

    filteredArticles = articles.slice();
    currentPage = 1;
    renderArticles();
  })
  .catch(err => {
    console.error("Error loading articles.json:", err);
    articlesContainer.innerHTML = "<p style='text-align:center'>Failed to load articles.</p>";
  });

// parse date safely
function parseDateSafe(d) {
  if (!d) return null;
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}


// --- render ---
function renderArticles() {
  const end = currentPage * articlesPerPage;
  const toDisplay = filteredArticles.slice(0, end);

  articlesContainer.innerHTML = toDisplay
    .map(a => `
      <article class="article-card" data-category="${a.category}">
        ${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.title}" class="article-thumb">` : ""}
        <h3>${escapeHtml(a.title)}</h3>
        <p>${makeSummaryFromContent(a.content || a.description)}</p>
        <a href="article.html?id=${a.id}" class="read-more">Read More</a>
      </article>
    `)
    .join("");

  noResultsMsg.style.display = filteredArticles.length === 0 ? "block" : "none";
  loadMoreBtn.style.display = end < filteredArticles.length ? "block" : "none";
}

// --- Load more button ---
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  renderArticles();
});

// --- filters & search ---
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    currentCategory = (link.dataset.category || "All").toString();
    applyFiltersAndReset();
  });
});

searchInput.addEventListener("input", () => {
  applyFiltersAndReset();
});

function applyFiltersAndReset() {
  const q = (searchInput.value || "").toLowerCase().trim();
  const cat = (currentCategory || "All").toString().toLowerCase();

  filteredArticles = articles.filter(article => {
    const matchesCategory = cat === "all" || ((article.category || "").toString().toLowerCase() === cat);
    const title = (article.title || "").toString().toLowerCase();
    const content = htmlToTextKeepBr(article.content || article.description || "").toLowerCase();
    const matchesSearch = title.includes(q) || content.includes(q);
    return matchesCategory && matchesSearch;
  });

  currentPage = 1;
  renderArticles();
}
