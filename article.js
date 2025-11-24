// get article id
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get("id");

const articleDetail = document.getElementById("article-detail");

// Load JSON articles
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    const article = data.find(a => a.id == articleId);
    if (!article) {
      articleDetail.innerHTML = "<h2>Article not found</h2>";
      return;
    }

    renderArticle(article);
    enableMenu(article);
  });

// Render article
function renderArticle(article) {
  articleDetail.innerHTML += `
    <img src="${article.thumbnail}" class="article-thumb">
    <h1>${article.title}</h1>
    <p>${article.content}</p>
  `;
}


/* --------------------------
    3 DOTS MENU + FUNCTIONS
--------------------------- */

const menuBtn = document.querySelector(".article-menu-btn");
const menu = document.getElementById("articleMenu");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("active");
});

// Close when clicking outside
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.classList.remove("active");
  }
});


/* Functions */
function enableMenu(article) {

  // Copy link
  document.getElementById("copyLink").onclick = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  // Share (if supported)
  document.getElementById("shareArticle").onclick = async () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: "Check out this GDN article!",
        url: window.location.href
      });
    } else {
      alert("Sharing is not supported on this device.");
    }
  };

  // Download Markdown file
  document.getElementById("dlMarkdown").onclick = () => {
    const md = `# ${article.title}\n\n${article.content}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.title}.md`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Save to favorites
  document.getElementById("saveLocal").onclick = () => {
    let saved = JSON.parse(localStorage.getItem("gdn_favorites") || "[]");

    if (!saved.includes(article.id)) {
      saved.push(article.id);
      localStorage.setItem("gdn_favorites", JSON.stringify(saved));
      alert("Saved!");
    } else {
      alert("Already saved.");
    }
  };

  // Remove from favorites
  document.getElementById("deleteLocal").onclick = () => {
    let saved = JSON.parse(localStorage.getItem("gdn_favorites") || "[]");

    saved = saved.filter(id => id !== article.id);
    localStorage.setItem("gdn_favorites", JSON.stringify(saved));

    alert("Removed from favorites.");
  };
}
