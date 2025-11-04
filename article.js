(function(){
  const articleContainer = document.getElementById("article-detail");
  if (!articleContainer) return;

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");
  if (!articleId) {
    articleContainer.innerHTML = "<p>Article ID missing.</p><p><a href='index.html'>Back to home</a></p>";
    return;
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      const article = (Array.isArray(data) ? data.find(a => String(a.id) === String(articleId)) : null);
      if (!article) {
        articleContainer.innerHTML = "<h2>Article not found.</h2><p><a href='index.html'>Back to home</a></p>";
        return;
      }

      const thumbHtml = article.thumbnail 
        ? `<img src="${escapeHtml(article.thumbnail)}" alt="${escapeHtml(article.title)}" 
            style="display:block; margin:10px auto; width:80%; max-height:500px; object-fit:cover; border-radius:8px;">`
        : "";

      const html = `
        <article>
          <h1>${escapeHtml(article.title)}</h1>
          <p style="color:#666;">By ${escapeHtml(article.author)} — ${escapeHtml(article.date)} — ${escapeHtml(article.category || "")}</p>
          ${thumbHtml}
          <div id="article-body" style="margin-top:16px;"></div>
          <p style="margin-top:18px;"><a href="index.html">Back to Home</a></p>
        </article>
      `;
      articleContainer.innerHTML = html;

      const bodyDiv = document.getElementById("article-body");
      if (bodyDiv) {
        let contentHtml = String(article.content || article.description || "");
        if (!contentHtml.includes("<")) {
          contentHtml = escapeHtml(contentHtml).replace(/\n/g, "<br>");
        }
        bodyDiv.innerHTML = contentHtml;
      }

      try {
        const viewKey = `views_${article.id}`;
        const current = parseInt(localStorage.getItem(viewKey)) || 0;
        localStorage.setItem(viewKey, current + 1);
      } catch {}
    })
    .catch(() => {
      articleContainer.innerHTML = "<p>Error loading article.</p><p><a href='index.html'>Back to home</a></p>";
    });
})();
