let allArticles = [];
let visibleCount = 5; // aantal artikels zichtbaar bij start
const step = 5;       // aantal artikels per "Load more"

const articlesContainer = document.getElementById("articles");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");

let currentFilter = { search: "", category: "" };

// Fetch JSON
fetch("articles.json")
  .then(res => res.json())
  .then(articles => {
    // Sorteer nieuwste eerst op ID
    allArticles = articles.sort((a, b) => b.id - a.id);
    renderArticles();
  })
  .catch(err => console.error("Error loading articles.json:", err));

// Render artikelen
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
      <h2><a href="/article.html?id=${article.id}">${article.title}</a></h2>
      ${article.thumbnail ? `<img src="${article.thumbnail}" alt="thumbnail" style="width:100%; max-height:200px; object-fit:cover;">` : ""}
      <p><a href="/article.html?id=${article.id}" style="text-decoration:none; color:inherit;">${article.content.substring(0, 200)}...</a></p>
      <small>By ${article.author} - ${article.date}</small>
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

// Search live filter
searchInput.addEventListener("input", e => {
  currentFilter.search = e.target.value;
  visibleCount = step; // reset bij nieuw filter
  renderArticles();
});

// Category filter
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    currentFilter.category = link.dataset.category || "";
    visibleCount = step;
    renderArticles();
  });
});

// Load more knop
loadMoreBtn.addEventListener("click", () => {
  visibleCount += step;
  renderArticles();
});
