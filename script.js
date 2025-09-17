let allArticles = [];
let visibleCount = 5; // hoeveel artikels zichtbaar bij start
const step = 5;       // hoeveel artikels per klik "Load more"

const articlesContainer = document.getElementById("articles");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");

let currentFilter = { search: "", category: "" };

// Fetch JSON
fetch("articles.json")
  .then(res => res.json())
  .then(articles => {
    // Sorteer nieuwste eerst
    allArticles = articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderArticles();
  })
  .catch(err => console.error("Error loading articles.json:", err));

// Render artikelen
function renderArticles() {
  articlesContainer.innerHTML = "";

  // Filteren
  let filtered = allArticles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      a.content.toLowerCase().includes(currentFilter.search.toLowerCase());

    const matchesCategory =
      currentFilter.category === "" || a.category === currentFilter.category;

    return matchesSearch && matchesCategory;
  });

  // Enkel tonen wat mag
  filtered.slice(0, visibleCount).forEach(a => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${a.title}</h2>
      <p><em>${a.date} | ${a.category} | by ${a.author}</em></p>
      <p>${a.content.substring(0, 120)}...</p>
      <a href="/article?id=${a.id}" class="btn">Read More</a>
    `;
    articlesContainer.appendChild(card);
  });

  // Knop tonen/verbergen
  if (visibleCount < filtered.length) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }

  // Als geen resultaten
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

// Load more
loadMoreBtn.addEventListener("click", () => {
  visibleCount += step;
  renderArticles();
});
