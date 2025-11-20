(function () {
  const articleContainer = document.getElementById("article-detail");
  if (!articleContainer) return;

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    articleContainer.innerHTML = "<p>Article ID missing.</p><p><a href='/gdn'>Back to home</a></p>";
    return;
  }

  function escapeHtml(text) {
    if (!text) return "";
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
      const article = data.find(a => String(a.id) === String(articleId));
      if (!article) {
        articleContainer.innerHTML = "<h2>Article not found.</h2><p><a href='/gdn'>Back to home</a></p>";
        return;
      }

      const thumbHtml = article.thumbnail
        ? `<img src="${escapeHtml(article.thumbnail)}" class="article-thumb" alt="${escapeHtml(article.title)}">`
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

      articleContainer.insertAdjacentHTML("beforeend", html);

      // Content safe rendering
      const bodyDiv = document.getElementById("article-body");
      let contentHtml = String(article.content || article.description || "");
      if (!contentHtml.includes("<")) {
        contentHtml = escapeHtml(contentHtml).replace(/\n/g, "<br>");
      }
      bodyDiv.innerHTML = contentHtml;

      // Count views
      try {
        const viewKey = `views_${article.id}`;
        const current = parseInt(localStorage.getItem(viewKey)) || 0;
        localStorage.setItem(viewKey, current + 1);
      } catch {}

      // -----------------------
      //   MENU FUNCTIONALITY
      // -----------------------
      const btn = document.getElementById("article-menu");
      const menu = document.getElementById("article-menu-dropdown");

      btn.addEventListener("click", () => {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
      });

      document.body.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
          menu.style.display = "none";
        }
      });

      function download(filename, data) {
        const blob = new Blob([data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      menu.addEventListener("click", e => {
        const action = e.target.dataset.action;
        if (!action) return;

        // Copy link
        if (action === "copylink") {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied!");
        }

        // Save as Markdown
        if (action === "save-md") {
          const md = `# ${article.title}\n\n${article.author} — ${article.date}\n\n${article.content}`;
          download(`${article.title}.md`, md);
        }

        // Save as TXT
        if (action === "save-txt") {
          const txt = `${article.title}\n${article.author} — ${article.date}\n\n${article.content}`;
          download(`${article.title}.txt`, txt);
        }

        // Save as JSON
        if (action === "save-json") {
          const json = JSON.stringify(article, null, 2);
          download(`${article.title}.json`, json);
        }
      });

    })
    .catch(() => {
      articleContainer.innerHTML = "<p>Error loading article.</p><p><a href='/gdn'>Back to home</a></p>";
    });

})();
