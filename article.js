// ----------------------------------------------
// Redirect /gdn/21 -> /gdn/article?id=21
// ----------------------------------------------
(function () {
  const match = window.location.pathname.match(/^\/gdn\/(\d+)$/);
  if (match) {
    window.location.replace(`/gdn/article?id=${match[1]}`);
  }
})();


// ----------------------------------------------
// ARTICLE PAGE LOADER
// ----------------------------------------------
(function () {
  const container = document.getElementById("article-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    container.innerHTML = "<p>Article ID missing.</p><p><a href='/gdn'>Back</a></p>";
    return;
  }

  function escape(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // -------------------------------------------------
  // FETCH ARTICLES.JSON (RELATIVE PATH FOR GITHUB)
  // -------------------------------------------------
  fetch("articles.json")   // <---- DIT IS DE FIX
    .then(r => r.json())
    .then(data => {
      const article = data.find(a => String(a.id) === String(articleId));

      if (!article) {
        container.innerHTML = "<h2>Article not found.</h2><p><a href='/gdn'>Back</a></p>";
        return;
      }

<<<<<<< HEAD
      const thumb = `<a href="/gdn/assets/articlethumbnail/${article.id}.png"><img src="/gdn/assets/articlethumbnail/${article.id}.png" class="article-thumb"></a>`;
=======
      const thumb = `<img src="/gdn/assets/articlethumbnail/${article.id}.png" class="article-thumb">`;
>>>>>>> 88874bf9e985e110c0e4d9586e512180eaff7bcc

      container.insertAdjacentHTML(
        "beforeend",
        `
        <article>
          <h1>${escape(article.title)}</h1>
          <p style="color:#666;">
            By <a href="authors/${escape(article.author)}">${escape(article.author)}</a>
            — ${escape(article.date)} — ${escape(article.category)}
          </p>
          ${thumb}
          <div id="article-body" style="margin-top:16px;"></div>
          <p style="margin-top:18px;"><a href="/gdn">Back</a></p>
        </article>
        `
      );

      // CONTENT
      const body = document.getElementById("article-body");
      let html = article.content || article.description || "";
      if (!html.includes("<")) html = escape(html).replace(/\n/g, "<br>");
      body.innerHTML = html;

      // ----------------------------------------------
      // MENU
      // ----------------------------------------------
      const menuBtn = document.querySelector(".article-menu-btn");
      const menu = document.getElementById("articleMenu");

      if (menuBtn && menu) {
        menuBtn.addEventListener("click", e => {
          e.stopPropagation();
          menu.classList.toggle("active");
        });

        document.body.addEventListener("click", e => {
          if (!menu.contains(e.target)) menu.classList.remove("active");
        });
      }

      // ----------------------------------------------
      // DOWNLOADS
      // ----------------------------------------------
      function download(name, data) {
        const blob = new Blob([data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
      }

      document.getElementById("copyLink")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href);
        alert("Link copied!");
      });

      document.getElementById("shareArticle")?.addEventListener("click", async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: article.title,
              text: "Check out this GDN article!",
              url: location.href
            });
          } catch { }
        } else alert("Your browser can't share.");
      });

      document.getElementById("dlMarkdown")?.addEventListener("click", () => {
        download(`${article.title}.md`, `# ${article.title}\n\n${article.author} — ${article.date}\n\n${article.content}`);
      });

      document.getElementById("dlJSON")?.addEventListener("click", () => {
        download(`${article.title}.json`, JSON.stringify(article, null, 2));
      });

      document.getElementById("dlTXT")?.addEventListener("click", () => {
        download(`${article.title}.txt`, `${article.title}\n${article.author} — ${article.date}\n\n${article.content}`);
      });

      // ----------------------------------------------
      // SHORT URL
      // ----------------------------------------------
      document.getElementById("makeShortURL")?.addEventListener("click", () => {
        const s = `https://siebecluyts.github.io/gdn/${article.id}`;
        navigator.clipboard.writeText(s);
        alert("Short URL copied:\n" + s);
      });

      // ----------------------------------------------
      // REPORT ISSUE FORM (FormSubmit)
      // ----------------------------------------------
document.getElementById("reportIssue")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Popup background
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  // Form popup
  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.padding = "20px";
  box.style.borderRadius = "10px";
  box.style.width = "320px";
  box.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
  box.innerHTML = `
    <h3>Report an Issue</h3>
    <form method="POST" action="https://formsubmit.co/debendevanzelem@gmail.com">

      <input name="name" placeholder="Your name" required style="width:100%;margin-top:10px;padding:8px;">
      <input type="email" name="email" placeholder="Your email" required style="width:100%;margin-top:10px;padding:8px;">
      <textarea name="message" placeholder="Describe the problem..." required style="width:100%;margin-top:10px;padding:8px;height:100px;"></textarea>

      <input type="hidden" name="articleId" value="${article.id}">
      <input type="hidden" name="_next" value="https://siebecluyts.github.io/gdn/thankscontact.html">
      <input type="hidden" name="_autoresponse" value="Thanks for your feedback! We will review as quick as possible.">

      <div style="margin-top:15px;display:flex;gap:10px;">
        <button type="submit" style="flex:1;padding:8px;background:#28a745;color:white;border:none;border-radius:6px;">Send</button>
        <button type="button" id="cancelIssue" style="flex:1;padding:8px;background:#ccc;border:none;border-radius:6px;">Cancel</button>
      </div>
    </form>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById("cancelIssue").addEventListener("click", () => {
    overlay.remove();
  });
});
const tagsContainer = document.getElementById("article-tags");

if (article.tags && Array.isArray(article.tags)) {
  article.tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = `tag tag-${tag.replace(/\s+/g, "-")}`;
    span.textContent = tag.toUpperCase();
    tagsContainer.appendChild(span);
  });
}

      // ----------------------------------------------
      // TTS
      // ----------------------------------------------
      document.getElementById("ttsArticle")?.addEventListener("click", () => {
        const u = new SpeechSynthesisUtterance(article.content || "");
        speechSynthesis.speak(u);
      });

      // ----------------------------------------------
      // TRANSLATE
      // ----------------------------------------------
      document.getElementById("translateArticle")?.addEventListener("click", () => {
        const t = body.innerText;
        window.open(
          `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(t)}`,
          "_blank"
        );
      });

      // ----------------------------------------------
      // LOCAL VIEWS COUNT
      // ----------------------------------------------
      try {
        const k = "views_" + article.id;
        const v = Number(localStorage.getItem(k)) || 0;
        localStorage.setItem(k, v + 1);
      } catch { }

    })
    .catch(err => {
      console.error("JSON load error:", err);
      container.innerHTML = "<p>Error loading article.</p><p><a href='/gdn'>Back to Home</a></p>";
    });

})();
