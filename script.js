let allArticles = [];
let filteredArticles = [];
let displayedCount = 0;
const loadCount = 5;

const articlesGrid = document.getElementById("articles");
const loadBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");
const noResults = document.getElementById("no-results");

// ===== Fetch JSON =====
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data.sort((a,b) => b.id - a.id); // nieuwste eerst
    filteredArticles = [...allArticles];
    displayedCount = Math.min(loadCount, filteredArticles.length);
    displayArticles();
  })
  .catch(err => console.error("Error loading articles.json:", err));

function displayArticles() {
  articlesGrid.innerHTML = "";

  const toDisplay = filteredArticles.slice(0, displayedCount);
  if(toDisplay.length === 0){
    noResults.style.display = "block";
    loadBtn.style.display = "none";
    return;
  } else {
    noResults.style.display = "none";
  }

  toDisplay.forEach(article => {
    const card = document.createElement("div");
    card.classList.add("article-card");

    if(article.thumbnail) {
      const img = document.createElement("img");
      img.src = article.thumbnail;
      img.alt = article.title;
      card.appendChild(img);
    }

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("article-content");

    const h2 = document.createElement("h2");
    h2.textContent = article.title;
    h2.style.cursor = "pointer";
    h2.addEventListener("click", () => {
      window.location.href = `article.html?id=${article.id}`;
    });

    const p = document.createElement("p");
    p.innerHTML = article.content.length > 100 ? article.content.substring(0,100) + "..." : article.content;

    const footer = document.createElement("div");
    footer.classList.add("article-footer");
    footer.innerHTML = `<small>${article.author} - ${article.date}</small>
                        <a href="article.html?id=${article.id}" class="btn">Read More</a>`;

    contentDiv.appendChild(h2);
    contentDiv.appendChild(p);
    contentDiv.appendChild(footer);
    card.appendChild(contentDiv);

    articlesGrid.appendChild(card);
  });

  loadBtn.style.display = displayedCount < filteredArticles.length ? "block" : "none";
}

loadBtn.addEventListener("click", () => {
  displayedCount += loadCount;
  displayArticles();
});

// ===== Search =====
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  filteredArticles = allArticles.filter(a => a.title.toLowerCase().includes(term));
  displayedCount = Math.min(loadCount, filteredArticles.length);
  displayArticles();
});

// ===== Category Filter =====
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const category = link.dataset.category;
    if(category === "All") {
      filteredArticles = [...allArticles];
    } else {
      filteredArticles = allArticles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    displayedCount = Math.min(loadCount, filteredArticles.length);
    searchInput.value = "";
    displayArticles();
  });
});
