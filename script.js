// ===== Articles data =====
const articles = [
  {
    id: 1,
    title: "Amethyst verified",
    author: "GDN",
    date: "2025-08-01",
    category: "Community",
    thumbnail: "",
    content: "After a long time the top 1 player on the demon list Zoink verified the level Amethyst. This level would eventually be the first level on the demon list."
  },
  {
    id: 2,
    title: "when will 2.21 come out?",
    author: "GDN",
    date: "2025-08-31",
    category: "Updates",
    thumbnail: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP._Clgq0Y34KjQiQuFabF4cQHaEK%3Fpid%3DApi&f=1&ipt=ff9d747769474da7cca4b4845fad8ecfb929962372b7a1e7f2dd0022cae8c470&ipo=images",
    content: "On July 18, RobTop Games announced the Random Gauntlet Contest. ..."
  },
  {
    id: 3,
    title: "Cuatrosientos died at 99% on the 7-minute level Flamewall",
    author: "GDN",
    date: "2025-08-31",
    category: "Community",
    thumbnail: "",
    content: "On august 31 2025 the player Cuatrosientos ..."
  },
  {
    id: 4,
    title: "Zoink face revealed in front of 5K people",
    author: "GDN",
    date: "2025-09-12",
    category: "Community",
    thumbnail: "",
    content: "On 12 september the top player Zoink face revealed ..."
  },
  {
    id: 5,
    title: "10 Easiest Geometry Dash Demons To Get 100 Free Stars",
    author: "Moldy",
    date: "2024-09-30",
    category: "Levels",
    thumbnail: "https://i.ytimg.com/vi/pAxWLIOZItU/maxresdefault.jpg",
    content: "In Geometry Dash, demon levels reward you with 10 stars ..."
  },
  {
    id: 6,
    title: "Tutorial: How to Make Your First Demon",
    author: "GDN",
    date: "2025-10-01",
    category: "Tutorials",
    thumbnail: "",
    content: "Step by step tutorial for making your first Geometry Dash demon level..."
  }
];

// ===== Global vars =====
let displayedCount = 0;
const loadCount = 5; // 5 per load
let filteredArticles = [...articles].sort((a, b) => b.id - a.id);

// ===== DOM elements =====
const articlesGrid = document.getElementById("articles");
const loadBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("search");
const categoryLinks = document.querySelectorAll(".dropdown-content a");
const noResults = document.getElementById("no-results");

// ===== Functions =====
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

    // Thumbnail (optional)
    if(article.thumbnail) {
      const img = document.createElement("img");
      img.src = article.thumbnail;
      img.alt = article.title;
      card.appendChild(img);
    }

    // Content
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("article-content");

    const h2 = document.createElement("h2");
    h2.textContent = article.title;
    h2.style.cursor = "pointer";
    h2.addEventListener("click", () => {
      window.location.href = `article.html?id=${article.id}`;
    });

    const p = document.createElement("p");
    p.textContent = article.content.length > 100 ? article.content.substring(0, 100) + "..." : article.content;

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

function loadMore() {
  displayedCount += loadCount;
  displayArticles();
}

// ===== Search =====
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  filteredArticles = articles.filter(a => a.title.toLowerCase().includes(term));
  displayedCount = Math.min(loadCount, filteredArticles.length);
  displayArticles();
});

// ===== Category Filter =====
categoryLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const category = link.dataset.category;
    if(category === "All") {
      filteredArticles = [...articles].sort((a,b) => b.id - a.id);
    } else {
      filteredArticles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase()).sort((a,b) => b.id - a.id);
    }
    displayedCount = Math.min(loadCount, filteredArticles.length);
    searchInput.value = "";
    displayArticles();
  });
});

// ===== Init =====
displayedCount = Math.min(loadCount, filteredArticles.length);
displayArticles();
loadBtn.addEventListener("click", loadMore);
