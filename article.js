(function(){
  const articleContainer = document.getElementById("article-detail");
  if (!articleContainer) return;

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");
  if (!articleId) {
    articleContainer.innerHTML = "<p>Article ID missing. Please add a article ID.</p><p><a href='/gdn'>Back to home</a></p>";
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
        articleContainer.innerHTML = "<h2>Article not found.</h2><p><a href='/gdn'>Back to home</a></p>";
        return;
      }

      // Bewaar artikel wereldwijd zodat save-knoppen het kunnen gebruiken
      window.currentArticle = article;

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
          <p style="margin-top:18px;"><a href="/gdn">Back to Home</a></p>
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

      // View counter
      try {
        const viewKey = `views_${article.id}`;
        const current = parseInt(localStorage.getItem(viewKey)) || 0;
        localStorage.setItem(viewKey, current + 1);
      } catch {}
    })
    .catch(() => {
      articleContainer.innerHTML = "<p>Error loading article.</p><p><a href='index.html'>Back to home</a></p>";
    });


  /* =======================================================
      3-DOT MENU + DOWNLOAD FUNCTIES
  ======================================================= */

  const btn = document.getElementById("article-menu-btn");
  const dropdown = document.getElementById("article-menu-dropdown");

  if (btn && dropdown) {
    btn.addEventListener("click", () => {
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.style.display = "none";
      }
    });
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  document.querySelectorAll(".submenu-item").forEach(item => {
    item.addEventListener("click", () => {
      const type = item.dataset.type;
      const a = window.currentArticle;
      if (!a) return alert("Article not loaded yet.");

      if (type === "json") {
        downloadFile(`article-${a.id}.json`, JSON.stringify(a, null, 2));
      }
      if (type === "md") {
        let md = `# ${a.title}\n\n`;
        md += `**By ${a.author} — ${a.date} — ${a.category}**\n\n`;
        md += (a.content || "").replace(/<br\s*\/?>/g, "\n");
        downloadFile(`article-${a.id}.md`, md);
      }
      if (type === "txt") {
        let txt = `${a.title}\nBy ${a.author} — ${a.date} — ${a.category}\n\n` +
                  (a.content || "").replace(/<br\s*\/?>/g, "\n");
        downloadFile(`article-${a.id}.txt`, txt);
      }
    });
  });

})();
