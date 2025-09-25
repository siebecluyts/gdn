let articles = [];
let currentIndex = 0;
const articlesPerLoad = 5;

async function fetchArticles() {
  try {
    const response = await fetch("articles.json");
    articles = await response.json();

    // Sorteer nieuwste eerst
    articles.sort((a, b) => b.id - a.id);

    displayArticles();
  } catch (err) {
    console.error("Fout bij ophalen artikelen:", err);
  }
}

function displayArticles() {
  const container = document.getElementById("articles");
  const endIndex = currentIndex + articlesPerLoad;
  const slice = articles.slice(currentIndex, endIndex);

  slice.forEach(article => {
    const card = document.createElement("div");
    card.classList.add("article-card");
    card.innerHTML = `
      <a href="article${article.id}.html">
        ${article.thumbnail ? `<img class="thumb" src="${article.thumbnail}" alt="thumbnail">` : ""}
        <h2>${article.title}</h2>
        <p>${article.content.substring(0, 150)}...</p>
      </a>
      <small>By ${article.author} - ${article.date}</small>
    `;
    container.appendChild(card);
  });

  currentIndex += slice.length;

  if (currentIndex >= articles.length) {
    document.getElementById("loadMoreBtn").style.display = "none";
  }
}

document.getElementById("loadMoreBtn").addEventListener("click", displayArticles);

fetchArticles();
