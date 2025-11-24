// Redirect /gdn/21 -> /gdn/article?id=21
(function () {
  const path = window.location.pathname; // bv. /gdn/21
  const match = path.match(/^\/gdn\/(\d+)$/);

  if (match) {
    const articleId = match[1];
    window.location.replace(`/gdn/article?id=${articleId}`);
  }
})();
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
// QR CODE genereren + downloadbaar maken
document.getElementById("makeFullURL").addEventListener("click", () => {
  const full = window.location.href;

  // QR-code popup overlay
  let popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "0";
  popup.style.left = "0";
  popup.style.width = "100vw";
  popup.style.height = "100vh";
  popup.style.background = "rgba(0,0,0,0.6)";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.justifyContent = "center";
  popup.style.zIndex = "9999";

  // witte box
  let box = document.createElement("div");
  box.style.background = "#fff";
  box.style.padding = "20px";
  box.style.borderRadius = "12px";
  box.style.boxShadow = "0 0 20px rgba(0,0,0,0.3)";
  box.style.textAlign = "center";

  // titel
  let title = document.createElement("h2");
  title.innerText = "QR Code";
  box.appendChild(title);

  // canvas voor QR code
  let canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  canvas.style.borderRadius = "8px";
  box.appendChild(canvas);

  // DOWNLOAD knop
  let downloadBtn = document.createElement("a");
  downloadBtn.innerText = "Download QR Code";
  downloadBtn.style.display = "inline-block";
  downloadBtn.style.marginTop = "12px";
  downloadBtn.style.padding = "10px 18px";
  downloadBtn.style.background = "#0078ff";
  downloadBtn.style.color = "#fff";
  downloadBtn.style.borderRadius = "6px";
  downloadBtn.style.textDecoration = "none";
  downloadBtn.style.cursor = "pointer";
  box.appendChild(downloadBtn);

  // SLUIT knop
  let closeBtn = document.createElement("button");
  closeBtn.innerText = "Sluiten";
  closeBtn.style.marginTop = "10px";
  closeBtn.style.padding = "8px 18px";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => popup.remove();
  box.appendChild(closeBtn);

  popup.appendChild(box);
  document.body.appendChild(popup);

  // QR tekenen
  generateQR(full, canvas, downloadBtn);
});

// mini QR generator (Google Charts API)
function generateQR(text, canvas, downloadLink) {
  const size = 300;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(text)}`;

  img.onload = () => {
    ctx.drawImage(img, 0, 0, size, size);

    // download link instellen zodra image geladen is
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = "qr-code.png";
  };
}

// KORTE URL genereren → /gdn/{id}
document.getElementById("makeShortURL").addEventListener("click", () => {
  const shortURL = `https://siebecluyts.github.io/gdn/${article.id}`;
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
