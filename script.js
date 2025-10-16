// script.js (vervang volledige inhoud)
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
  // convert <br> and <br/> to \n first
  let s = String(html).replace(/<br\s*\/?>/gi, "\n");
  // use DOM to remove other tags
  const tmp = document.createElement("div");
  tmp.innerHTML = s;
  return tmp.textContent || tmp.innerText || "";
}

// veilige escape voor tonen in HTML (maar we will reintroduce <br> after escaping)
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
  const plain = htmlToTextKeepBr(htmlContent).trim();      // plain text but with \n where <br> were
  if (plain.length <= maxChars) {
    // geen afkapping nodig — escape en convert \n terug to <br>
    return escapeHtml(plain).replace(/\n/g, "<br>");
  }
  // afkappen en ... toevoegen
  const sliced = plain.slice(0, maxChars).trim() + "...";
  return escapeHtml(sliced).replace(/\n/g, "<br>");
}

// parse date safely
function parseDateSafe(d) {
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}

// --- load en sorteer artikelen ---
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    articles = Array.isArray(data) ? data.slice() : [];

    // sorteer: datum (nieuwste eerst). Als datum ontbreekt of onjuist -> fallback naar numeric id
    articles.sort((a, b) => {
      const ta = parseDateSafe(a.date);
      const tb = parseDateSafe(b.date);
      if (ta !== null && tb !== null) return tb - ta; // newest first
      if (ta !== null) return -1;
      if (tb !== null) return 1;
      const ia = parseInt(a.id, 10) || 0;
      const ib = parseInt(b.id, 10) || 0;
      return ib - ia;
    });

    console.log("Articles loaded — sorted top IDs:", articles.slice(0, 8).map(x => x.id));

    filteredArticles = articles.slice();
    currentPage = 1;
    renderArticles();
  })
  .catch(err => {
    console.error("Error loading articles.json:", err);
    articlesContainer.innerHTML = "<p style='text-align:center'>Failed to load articles.</p>";
  });

// --- render ---
function getShortDescription(desc, maxLength = 100) {
  if (!desc) return "";
  // replace <br> met newline voor telling
  const text = desc.replace(/<br\s*\/?>/gi, "\n");
  if (text.length <= maxLength) return desc;
  let short = text.slice(0, maxLength);
  // terug naar <br> als die er waren
  short = short.replace(/\n/g, "<br>");
  return short + "...";
}

// In renderArticles()
articlesContainer.innerHTML = toDisplay
  .map(a => `
    <article class="article-card" data-category="${a.category}">
      ${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.title}" class="article-thumb">` : ""}
      <h3>${a.title}</h3>
      <p>${getShortDescription(a.description)}</p>
      <a href="article.html?id=${a.id}" class="read-more">Read More</a>
    </article>
  `).join("");
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
    const content = htmlToTextKeepBr(article.content || "").toLowerCase();
    const matchesSearch = title.includes(q) || content.includes(q);
    return matchesCategory && matchesSearch;
  });

  currentPage = 1;
  renderArticles();
}
