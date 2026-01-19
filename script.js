const articlesContainer = document.getElementById("articles");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");
const noResultsMsg = document.getElementById("no-results");
const articlesContainerGDN = document.getElementById("articlesGDN");

// Detecteer author page
const isAuthorPage = articlesContainerGDN !== null;

let articles = [];
let filteredArticles = [];
const articlesPerPage = 5;
let currentPage = 1;
let currentCategory = "All";

/* ================= HELPERS ================= */

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
  const sliced =
    plain.length > maxChars
      ? plain.slice(0, maxChars).trim() + "..."
      : plain;

  return escapeHtml(sliced).replace(/\n/g, "<br>");
}

function parseDateSafe(d) {
  if (!d) return null;
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}

/* ================= SEARCH VIA URL ================= */

const currentPath = window.location.pathname;
const urlParams = new URLSearchParams(window.location.search);
let initialSearch = "";

if (currentPath.includes("/search/")) {
  initialSearch = decodeURIComponent(
    currentPath.split("/gdn/search/")[1] || ""
  ).replace(/\/$/, "");
}

if (!initialSearch && urlParams.has("q")) {
  initialSearch = urlParams.get("q");
}

/* ================= FETCH ARTICLES ================= */

fetch("/gdn/articles.json")
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

    if (!isAuthorPage) {
      filteredArticles = articles.slice();

      if (initialSearch) {
        searchInput.value = initialSearch;
        applyFiltersAndReset();
      } else {
        renderArticles();
      }
    }
  })
  .catch(err => {
    console.error("Error loading articles.json:", err);
    if (articlesContainer) {
      articlesContainer.innerHTML = `
        <p style="text-align:center">
          Failed to load articles.
          <button onclick="location.reload()">Reload</button>
        </p>`;
    }
  });

/* ================= RENDER HOMEPAGE ================= */

function renderArticles() {
  if (!articlesContainer) return;

  const end = currentPage * articlesPerPage;
  const toDisplay = filteredArticles.slice(0, end);

  articlesContainer.innerHTML = toDisplay
    .map(a => `
      <article class="article-card" data-category="${escapeHtml(a.category)}">
        <img src="/gdn/assets/articlethumbnail/${a.id}.png" alt="${escapeHtml(a.title)}">
        <h3><a href="/gdn/article?id=${a.id}">${escapeHtml(a.title)}</a></h3>
        <p>By ${escapeHtml(a.author)} - ${escapeHtml(a.date)}</p>
        <p>${makeSummaryFromContent(a.content || a.description)}</p>
        <a href="/gdn/article?id=${a.id}" class="read-more">Read More</a>
      </article>
    `)
    .join("");

  noResultsMsg.style.display =
    filteredArticles.length === 0 ? "block" : "none";

  loadMoreBtn.style.display =
    end < filteredArticles.length ? "block" : "none";
}

/* ================= LOAD MORE ================= */

if (loadMoreBtn && !isAuthorPage) {
  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderArticles();
  });
}

/* ================= CATEGORY FILTER ================= */

if (!isAuthorPage) {
  categoryLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      currentCategory = (link.dataset.category || "All");
      applyFiltersAndReset();
    });
  });
}

/* ================= SEARCH ================= */

if (searchInput && !isAuthorPage) {
  searchInput.addEventListener("input", applyFiltersAndReset);
}

/* ================= FILTER LOGIC (FIXED) ================= */

function applyFiltersAndReset() {
  if (isAuthorPage) return;

  const q = (searchInput.value || "").toLowerCase().trim();
  const cat = currentCategory.toLowerCase();

  filteredArticles = articles.filter(article => {
    const matchesCategory =
      cat === "all" ||
      (article.category || "").toLowerCase() === cat;

    const title = (article.title || "").toLowerCase();
    const author = (article.author || "").toLowerCase();
    const date = (article.date || "").toLowerCase();
    const content = htmlToTextKeepBr(
      article.content || article.description || ""
    ).toLowerCase();

    const matchesSearch =
      !q ||
      title.includes(q) ||
      author.includes(q) ||
      content.includes(q) ||
      date.includes(q);

    return matchesCategory && matchesSearch;
  });

  currentPage = 1;
  renderArticles();
}

/* ================= AUTHOR PAGE ================= */

window.addEventListener("DOMContentLoaded", () => {
  if (!articlesContainerGDN) return;

  const wait = setInterval(() => {
    if (!articles.length) return;
    clearInterval(wait);

    const gdnArticles = articles.filter(
      a => (a.author || "").toLowerCase() === "gdn"
    );

    articlesContainerGDN.innerHTML = gdnArticles.length
      ? gdnArticles.map(a => `
          <article class="article-card">
            <img src="/gdn/assets/articlethumbnail/${a.id}.png">
            <h3><a href="/gdn/article?id=${a.id}">${escapeHtml(a.title)}</a></h3>
            <p>By ${escapeHtml(a.author)} - ${escapeHtml(a.date)}</p>
            <p>${makeSummaryFromContent(a.content || a.description)}</p>
          </article>
        `).join("")
      : "<p>No articles found from GDN.</p>";
  }, 50);
});

/* ================= COOKIES ================= */

function cookiesAccepted() {
  return localStorage.getItem("cookies_accepted") === "true";
}

window.addEventListener("load", () => {
  const banner = document.getElementById("cookie-banner");
  if (!cookiesAccepted()) banner.classList.remove("hidden");

  document.getElementById("accept-cookies").onclick = () => {
    localStorage.setItem("cookies_accepted", "true");
    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark")
    );
    banner.classList.add("hidden");
  };

  document.getElementById("decline-cookies").onclick = () =>
    banner.classList.add("hidden");
});

/* ================= DARK MODE (UNIVERSEEL) ================= */

const toggle = document.getElementById("darkModeToggle");

if (cookiesAccepted() && localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

toggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (cookiesAccepted()) {
    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark")
    );
  }
});
