const articlesContainer = document.getElementById("articles");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");
const noResultsMsg = document.getElementById("no-results");

let articles = [];
let filteredArticles = [];
let articlesPerPage = 5;
let currentPage = 1;
let currentCategory = "All";

// ✅ Artikelen laden
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    articles = data;
    filteredArticles = articles;
    renderArticles();
  })
  .catch(err => console.error("Error loading articles:", err));

// ✅ Artikelen tonen
function renderArticles() {
  const start = 0;
  const end = currentPage * articlesPerPage;
  const toDisplay = filteredArticles.slice(0, end);

  // HTML genereren
  articlesContainer.innerHTML = toDisplay
    .map(
      a => `
      <article class="article-card" data-category="${a.category}">
        ${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.title}" class="article-thumb">` : ""}
        <h3>${a.title}</h3>
        <p>${a.description || ""}</p>
        <a href="article.html?id=${a.id}" class="read-more">Read More</a>
      </article>
    `
    )
    .join("");

  // Geen resultaten
  noResultsMsg.style.display = filteredArticles.length === 0 ? "block" : "none";

  // Load More tonen/verbergen
  loadMoreBtn.style.display = end < filteredArticles.length ? "block" : "none";
}

// ✅ “Load More” functionaliteit
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  renderArticles();
});

// ✅ Categorieën filteren
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    currentCategory = link.dataset.category;
    filterArticles();
  });
});

// ✅ Zoeken
searchInput.addEventListener("input", () => {
  filterArticles();
});

// ✅ Filterfunctie
function filterArticles() {
  const query = searchInput.value.toLowerCase();

  filteredArticles = articles.filter(article => {
    const matchesCategory =
      currentCategory === "All" || article.category === currentCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(query) ||
      article.description?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  currentPage = 1;
  renderArticles();
}
