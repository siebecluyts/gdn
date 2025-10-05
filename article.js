const articleContainer = document.getElementById("article-detail");
const params = new URLSearchParams(window.location.search);
const articleId = parseInt(params.get("id"));

// fetch articles.json
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    const article = data.find(a => a.id === articleId);
    if(!article) {
      articleContainer.innerHTML = "<p>Article not found.</p>";
      return;
    }

    const html = `
      <h1>${article.title}</h1>
      <p><small>By ${article.author} - ${article.date}</small></p>
      ${article.thumbnail ? `<img src="${article.thumbnail}" alt="${article.title}" class="thumb-large">` : ""}
      <p>${article.content}</p>
    `;

    articleContainer.innerHTML = html;
  })
  .catch(err => console.error("Error loading article:", err));
