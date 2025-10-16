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

// helper: strip HTML tags
function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return tmp.textContent || tmp.innerText || "";
}

// helper: truncate without ellipsis
function shortText(text, max = 120) {
  if (!text) return "";
  const s = stripHtml(text).trim();
  return s.length > max ? s.slice(0, max) : s;
}

// parse date safely; returns timestamp or null
function parseDateSafe(d) {
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}

// fetch + sort (newest first by date, fallback to numeric id)
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    articles = Array.isArray(data) ? data.slice() : [];

    articles.sort((a, b) => {
      const ta = parseDateSafe(a.date);
      const tb = parseDateSafe(b.date);
      if (ta !== null && tb !== null) return tb - ta; // newest first
      if (ta !== null) return -1;
      if (tb !== null) return 1;
      // fallback to numeric id
      const ia = parseInt(a.id, 10) || 0;
      const ib = parseInt(b.id, 10) || 0;
      return ib - ia;
    });

    filteredArticles = articles.slice();
    renderArticles();
  })
  .catch(err => console.error("Error loading articles:", err));

// render according to currentPage and filteredArticles
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
    const thumbHtml = a.thumbnail ? `<img src="${a.thumbnail}" alt="${escapeHtml(a.title)}" class="article-thumb">` : "";
    const summary = shortText(a.content, 120); // use content field
    const meta = `<p class="meta">By ${escapeHtml(a.author || "Unknown")} - ${escapeHtml(a.date || "")}</p>`;

    return `
      <article class="article-card" data-category="${escapeHtml(a.category || "")}">
        ${thumbHtml}
        <div class="article-content">
          <h3><a href="article.html?id=${encodeURIComponent(a.id)}">${escapeHtml(a.title)}</a></h3>
          ${meta}
          <p>${escapeHtml(summary)}</p>
          <div class="article-footer">
            <a href="article.html?id=${encodeURIComponent(a.id)}" class="btn">Read More</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  loadMoreBtn.style.display = end < filteredArticles.length ? "block" : "none";
}

// Load more
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  renderArticles();
});

// Category clicks
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const cat = (link.dataset.category || "All").toString();
    currentCategory = cat;
    filterArticles();
  });
});

// Search
searchInput.addEventListener("input", () => {
  filterArticles();
});

// filter + reset page
function filterArticles() {
  const q = (searchInput.value || "").toLowerCase().trim();
  const cat = (currentCategory || "All").toString().toLowerCase();

  filteredArticles = articles.filter(article => {
    const matchesCategory = (cat === "all") || ((article.category || "").toString().toLowerCase() === cat);
    const title = (article.title || "").toString().toLowerCase();
    const content = stripHtml(article.content || "").toLowerCase();
    const matchesSearch = title.includes(q) || content.includes(q);
    return matchesCategory && matchesSearch;
  });

  currentPage = 1;
  renderArticles();
}

// small helper to escape text inside HTML
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
