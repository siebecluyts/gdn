const articlesContainer = document.getElementById("articles");
const searchInput = document.getElementById("search");
const noResults = document.getElementById("no-results");

let articles = [];

// Load articles
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    articles = data;
    displayArticles(articles);
  });

// Display articles
function displayArticles(list) {
  articlesContainer.innerHTML = "";
  if (list.length === 0) {
    noResults.style.display = "block";
    return;
  } else {
    noResults.style.display = "none";
  }

  list.forEach(a => {
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
}

// Filter by search + category
let currentCategory = "All";

function filterArticles() {
  const query = searchInput.value.toLowerCase();
  const filtered = articles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(query) ||
      a.content.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.author.toLowerCase().includes(query);
    const matchesCategory = currentCategory === "All" || a.category === currentCategory;
    return matchesSearch && matchesCategory;
  });
  displayArticles(filtered);
}

// Search input
searchInput.addEventListener("input", filterArticles);

// Category filter
document.querySelectorAll(".dropdown-content a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    currentCategory = link.dataset.category;
    filterArticles();
  });
});
