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

      const bodyDiv = document.getElementById("article-body");
      let contentHtml = String(article.content || article.description || "");
      if (!contentHtml.includes("<")) {
        contentHtml = escapeHtml(contentHtml).replace(/\n/g, "<br>");
      }
      bodyDiv.innerHTML = contentHtml;

      // --------------------------
      // MENU LOGIC
      // --------------------------
      const menuBtn = document.querySelector(".article-menu-btn");
      const menu = document.getElementById("articleMenu");

      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // voorkom dat document click meteen sluit
        menu.classList.toggle("active"); // 'active' matcht CSS
      });

      document.body.addEventListener("click", (e) => {
        if (!menu.contains(e.target)) {
          menu.classList.remove("active");
        }
      });

      // --------------------------
      // DOWNLOAD / SHARE FUNCTIONS
      // --------------------------
      function download(filename, data) {
        const blob = new Blob([data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      document.getElementById("copyLink").addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
        menu.classList.remove("active");
      });

      document.getElementById("shareArticle").addEventListener("click", async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: article.title,
              text: "Check out this GDN article!",
              url: window.location.href
            });
          } catch { }
        } else {
          alert("Your browser doesn't support Share.");
        }
        menu.classList.remove("active");
      });

      document.getElementById("dlMarkdown").addEventListener("click", () => {
        const md = `# ${article.title}\n\n${article.author} — ${article.date}\n\n${article.content}`;
        download(`${article.title}.md`, md);
        menu.classList.remove("active");
      });

      document.getElementById("dlJSON").addEventListener("click", () => {
        const json = JSON.stringify(article, null, 2);
        download(`${article.title}.json`, json);
        menu.classList.remove("active");
      });

      document.getElementById("dlTXT").addEventListener("click", () => {
        const txt = `${article.title}\n${article.author} — ${article.date}\n\n${article.content}`;
        download(`${article.title}.txt`, txt);
        menu.classList.remove("active");
      });
// FULL URL genereren
document.getElementById("makeFullURL").addEventListener("click", () => {
  const full = window.location.href;
  navigator.clipboard.writeText(full);
  alert("Full URL copied:\n" + full);
});

// KORTE URL genereren → /gdn/{id}
document.getElementById("makeShortURL").addEventListener("click", () => {
  const shortURL = `/gdn/${article.id}`;
  navigator.clipboard.writeText(shortURL);
  alert("Short URL copied:\n" + shortURL);
});

      // --------------------------
      // LOCAL VIEWS
      // --------------------------
      try {
        const viewKey = `views_${article.id}`;
        const current = parseInt(localStorage.getItem(viewKey)) || 0;
        localStorage.setItem(viewKey, current + 1);
      } catch {}
    })
    .catch(() => {
      articleContainer.innerHTML = "<p>Error loading article.</p><p><a href='/gdn'>Back to home</a></p>";
    });

})();
