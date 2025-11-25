const articlesContainer = document.getElementById("articles");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");
const noResultsMsg = document.getElementById("no-results");
const articlesContainerGDN = document.getElementById("articlesGDN");

// Detecteer of we op een author page zitten
const isAuthorPage = document.getElementById("articlesGDN") !== null;

let articles = [];
let filteredArticles = [];
const articlesPerPage = 5;
let currentPage = 1;
let currentCategory = "All";

// --- helpers ---
function htmlToTextKeepBr(html) {
  if (!html) return "";
  let s = String(html).replace(/<br\s*\/?>/gi, "\n");
  const tmp = document.createElement("div");
  tmp.innerHTML = s;
  return tmp.textContent || tmp.innerText || "";
}

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function makeSummaryFromContent(htmlContent, maxChars = 120) {
  const plain = htmlToTextKeepBr(htmlContent).trim();
  if (plain.length <= maxChars) {
    return escapeHtml(plain).replace(/\n/g, "<br>");
  }
  const sliced = plain.slice(0, maxChars).trim() + "...";
  return escapeHtml(sliced).replace(/\n/g, "<br>");
}

function parseDateSafe(d) {
  if (!d) return null;
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}

// --- Detecteer zoektermen via /search/... of ?q=... ---
const currentPath = window.location.pathname;
const urlParams = new URLSearchParams(window.location.search);
let initialSearch = "";

// Detecteer /search/<term>
if (currentPath.includes("/search/")) {
  initialSearch = decodeURIComponent(currentPath.split("/gdn/search/")[1] || "").replace(/\/$/, "");
}

// Detecteer ?q=<term>
if (!initialSearch && urlParams.has("q")) {
  initialSearch = urlParams.get("q");
}

// --- Load & sorteer artikelen ---
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    articles = Array.isArray(data) ? data.slice() : [];

    // sorteer nieuwste eerst
    articles.sort((a, b) => {
      const ta = parseDateSafe(a.date);
      const tb = parseDateSafe(b.date);

      if (ta && tb) return tb - ta;
      if (ta) return -1;
      if (tb) return 1;

      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    // Normale homepage
    if (!isAuthorPage) {
      filteredArticles = articles.slice();
      if (initialSearch) {
        if (searchInput) searchInput.value = initialSearch;
        applyFiltersAndReset();
      } else {
        renderArticles();
      }
    }
  })
  .catch(err => {
    console.error("Error loading articles.json:", err);
    if (articlesContainer) {
      articlesContainer.innerHTML =
        "<p style='text-align:center'>Failed to load articles. <button onclick='window.location.href=\"/gdn\";'>Reload articles</button></p>";
    }
  });

// --- Render (homepage) ---
function renderArticles() {
  if (!articlesContainer) return;

  const end = currentPage * articlesPerPage;
  const toDisplay = filteredArticles.slice(0, end);

  articlesContainer.innerHTML = toDisplay
    .map(a => `
      <article class="article-card" data-category="${a.category}">
        ${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.title}" class="article-thumb">` : ""}
        <h3><a href="/gdn/article?id=${a.id}">${escapeHtml(a.title)}</a></h3>
        <p>By ${escapeHtml(a.author)} - ${escapeHtml(a.date)}</p>
        <p>${makeSummaryFromContent(a.content || a.description)}</p>
        <a href="/gdn/article?id=${a.id}" class="read-more">Read More</a>
      </article>
    `)
    .join("");

  if (noResultsMsg) noResultsMsg.style.display = filteredArticles.length === 0 ? "block" : "none";
  if (loadMoreBtn) loadMoreBtn.style.display = end < filteredArticles.length ? "block" : "none";
}

// --- Load more ---
if (loadMoreBtn && !isAuthorPage) {
  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderArticles();
  });
}

// --- Category filters ---
if (!isAuthorPage) {
  categoryLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      currentCategory = (link.dataset.category || "All").toString();
      applyFiltersAndReset();
    });
  });
}

// --- Search ---
if (searchInput && !isAuthorPage) {
  searchInput.addEventListener("input", () => {
    applyFiltersAndReset();
  });
}

function applyFiltersAndReset() {
  if (isAuthorPage) return;

  const q = (searchInput?.value || "").toLowerCase().trim();
  const cat = (currentCategory || "All").toString().toLowerCase();

  filteredArticles = articles.filter(article => {
    const matchesCategory =
      cat === "all" || ((article.category || "").toLowerCase() === cat);

    const title = (article.title || "").toLowerCase();
    const content = htmlToTextKeepBr(article.content || article.description || "").toLowerCase();
    const matchesSearch = title.includes(q) || content.includes(q);

    return matchesCategory && matchesSearch;
  });

  currentPage = 1;
  renderArticles();
}

// --- AUTHOR PAGE (GDN) ---
window.addEventListener("DOMContentLoaded", () => {
  if (!articlesContainerGDN) return; // niet op author page

  const checkReady = setInterval(() => {
    if (articles.length > 0) {
      clearInterval(checkReady);

      const gdnArticles = articles.filter(a =>
        (a.author || "").toLowerCase() === "gdn"
      );

      articlesContainerGDN.innerHTML = gdnArticles
        .map(a => `
          <article class="article-card">
            ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumb">` : ""}
            <h3><a href="/gdn/article?id=${a.id}">${escapeHtml(a.title)}</a></h3>
            <p>By ${escapeHtml(a.author)} - ${escapeHtml(a.date)}</p>
            <p>${makeSummaryFromContent(a.content || a.description)}</p>
            <a href="/gdn/article?id=${a.id}" class="read-more">Read More</a>
          </article>
        `)
        .join("");

      if (gdnArticles.length === 0) {
        articlesContainerGDN.innerHTML = "<p>No articles found from GDN.</p>";
      }
    }
  }, 50);
});
