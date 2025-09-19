const params = new URLSearchParams(window.location.search);
const articleId = parseInt(params.get("id"));

fetch("articles.json")
  .then(res => res.json())
  .then(articles => {
    const article = articles.find(a => a.id === articleId);
    if (!article) {
      document.getElementById("article").innerHTML = "<p>Article not found.</p>";
      return;
    }

    document.getElementById("article").innerHTML = `
      <h2>${article.title}</h2>
      <img src="${article.thumbnail}" alt="thumbnail" class="thumb-large">
      <p>${article.content}</p>
      <small>By ${article.author} - ${article.date}</small>
    `;
  })
  .catch(err => console.error("Error:", err));
