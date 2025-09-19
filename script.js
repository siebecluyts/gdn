let allArticles = [];
let visibleCount = 5; 
const step = 5;

const articlesContainer = document.getElementById("articles");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");

let currentFilter = { search: "", category: "" };

// Fetch JSON
fetch("articles.json")
  .then(res => res.json())
  .then(articles => {
    // Sorteer op datum (nieuwste eerst)
    allArticles = articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderArticles();
  })
  .catch(err => console.error("Error loading articles.json:", err));

// Render artikelen op homepage
function renderArticles() {
  articlesContainer.innerHTML = "";

  let filtered = allArticles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      a.content.toLowerCase().includes(currentFilter.search.toLowerCase());

    const matchesCategory =
      currentFilter.category === "" || a.category === currentFilter.category;

    return matchesSearch && matchesCategory;
  });

  filtered.slice(0, visibleCount).forEach(article => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2><a href="/article?id=${article.id}">${article.title}</a></h2>
      <img src="${article.thumbnail}" alt="thumbnail" class="thumb">
      <p>${article.content.substring(0, 120)}...</p>
      <small>By ${article.author} - ${article.date}</small>
      <br><a href="/article?id=${article.id}" class="btn">Read more</a>
    `;
    articlesContainer.appendChild(card);
  });

  if (visibleCount < filtered.length) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }

  if (filtered.length === 0) {
    articlesContainer.innerHTML = `<p>No articles found.</p>`;
    loadMoreBtn.style.display = "none";
  }
}

// Search
searchInput.addEventListener("input", e => {
  currentFilter.search = e.target.value;
  visibleCount = step;
  renderArticles();
});

// Categories
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    currentFilter.category = link.dataset.category || "";
    visibleCount = step;
    renderArticles();
  });
});

// Load more
loadMoreBtn.addEventListener("click", () => {
  visibleCount += step;
  renderArticles();
});
