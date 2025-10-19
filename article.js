const articleContainer = document.getElementById("article-detail");
const params = new URLSearchParams(window.location.search);
const articleId = parseInt(params.get("id"));

function renderPoll(poll, articleId) {
  if (!poll) return ''; // Geen poll 
  let optionsHtml = poll.options.map(option => `<option value="${option}">${option}</option>`).join('');
  
  return `
    <form id="pollForm" action="https://formsubmit.co/${poll.email}" method="POST">
      <label>${poll.question}</label>
      <select name="gamemode" required>
        ${optionsHtml}
      </select>
      <input type="hidden" name="email" value="${poll.email}">
      <input type="hidden" name="articleId" value="${articleId}"> <!-- Voeg het artikel ID toe als verborgen veld -->
      <button type="submit">Verzenden</button>
    </form>
  `;
}

// Event listener voor het formulier
document.addEventListener("submit", function(event) {
  if (event.target.id === "pollForm") {
    event.preventDefault(); // Voorkom standaard verzending
    alert("Thanks for your answer!");
    // Eventueel kun je hier nog een fetch-aanroep toevoegen om de verzonden data te verzenden
  }
});

// Fetch articles.json
fetch("articles.json")
  .then(res => res.json())
  .then(data => {
    const article = data.find(a => a.id === articleId);
    if (!article) {
      articleContainer.innerHTML = "<p>Article not found.</p>";
      return;
    }

    const html = `
      <h1>${article.title}</h1>
      <p><small>By ${article.author} - ${article.date}</small></p>
      ${article.thumbnail ? `<img src="${article.thumbnail}" alt="${article.title}" class="thumb-large">` : ""}
      <p>${article.content}</p>
      ${renderPoll(article.poll, article.id)} <!-- Voeg de poll hier toe -->
    `;

    articleContainer.innerHTML = html;
  })
  .catch(err => console.error("Error loading article:", err));
