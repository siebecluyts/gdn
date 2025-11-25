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
          <p style="color:#666;">By <a href="authors/${escapeHtml(article.author)}">${escapeHtml(article.author)}</a> — ${escapeHtml(article.date)} — ${escapeHtml(article.category || "")}</p>
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
        e.stopPropagation();
        menu.classList.toggle("active");
      });

      document.body.addEventListener("click", (e) => {
        if (!menu.contains(e.target)) {
          menu.classList.remove("active");
        }
      });

      // --------------------------
      // DOWNLOAD / SHARE / SHORT URL
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

      // KORTE URL genereren → /gdn/{id}
      document.getElementById("makeShortURL").addEventListener("click", () => {
        const shortURL = `https://siebecluyts.github.io/gdn/${article.id}`;
        navigator.clipboard.writeText(shortURL);
        alert("Short URL copied:\n" + shortURL);
        menu.classList.remove("active");
      });

      // --------------------------
      // REPORT ISSUE / FEEDBACK FORM
      // --------------------------
      document.getElementById("reportIssue").addEventListener("click", () => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://formsubmit.co/debendevanzelem@gmail.com"; // vervang door jouw Formspree ID
        form.target = "_blank";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.name = "name";
        nameInput.placeholder = "Your name";
        nameInput.required = true;
        form.appendChild(nameInput);

        const emailInput = document.createElement("input");
        emailInput.type = "email";
        emailInput.name = "email";
        emailInput.placeholder = "Your email";
        emailInput.required = true;
        form.appendChild(emailInput);

        const msgInput = document.createElement("textarea");
        msgInput.name = "message";
        msgInput.placeholder = "Describe the problem with the article...";
        msgInput.required = true;
        form.appendChild(msgInput);

        const articleIdInput = document.createElement("input");
        articleIdInput.type = "hidden";
        articleIdInput.name = "articleId";
        articleIdInput.value = article.id;
        form.appendChild(articleIdInput);

        const nextInput = document.createElement("input");
        nextInput.type = "hidden";
        nextInput.name = "_next";
        nextInput.value = "https://siebecluyts.github.io/gdn/thankscontact.html";
        form.appendChild(nextInput);

        const autoRespInput = document.createElement("input");
        autoRespInput.type = "hidden";
        autoRespInput.name = "_autoresponse";
        autoRespInput.value = "Thanks for your feedback! We will review as quick as possible.";
        form.appendChild(autoRespInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        menu.classList.remove("active");
      });

      // --------------------------
      // TEXT-TO-SPEECH (voorlezen)
      // --------------------------
      document.getElementById("ttsArticle").addEventListener("click", () => {
        const utter = new SpeechSynthesisUtterance(article.content || "");
        utter.rate = 1;
        utter.pitch = 1;
        speechSynthesis.speak(utter);
        menu.classList.remove("active");
      });

      // --------------------------
      // TRANSLATE
      // --------------------------
      document.getElementById("translateArticle").addEventListener("click", () => {
        const contentDiv = document.getElementById("article-body");
        const text = contentDiv.innerText;
        const newUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`;
        window.open(newUrl, "_blank");
        menu.classList.remove("active");
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
