const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname))); // serve static files like css/js
app.use(express.urlencoded({ extended: true }));

// Helper function to read articles.json
function getArticles() {
  const data = fs.readFileSync(path.join(__dirname, "articles.json"));
  return JSON.parse(data);
}

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Article page
app.get("/article", (req, res) => {
  const id = parseInt(req.query.id);
  const articles = getArticles();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.send("<h1>Article not found</h1><a href='/'>Back to Home</a>");
  }

  // Dynamically generate HTML
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${article.title} - GDN</title>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <header>
      <h1>GDN</h1>
      <nav><a href="/">Home</a></nav>
    </header>
    <main style="padding:20px; max-width:800px; margin:auto;">
      <h2>${article.title}</h2>
      <p><em>${article.date} | ${article.category} | by ${article.author}</em></p>
      <p>${article.content}</p>
      <a href="/" class="btn">Back to Home</a>
    </main>
    <footer>
      <p>© 2025 GDN - made by SiebeCluyts/FireFaults. Geometry Dash belongs to Robtop Games.</p>
    </footer>
  </body>
  </html>
  `;
  res.send(html);
});

// Serve submit form
app.get("/submit", (req, res) => {
  res.sendFile(path.join(__dirname, "submit.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});
// Catch-all route for client-side paths (Render fix)
app.get('*', (req, res) => {
  // Negeer echte bestanden of API-routes
  if (req.path.includes('.') || req.path.startsWith('/api')) {
    res.status(404).send('Not found');
    return;
  }

  // Stuur altijd index.html voor client-side routing
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`GDN server running at http://localhost:${PORT}`);
});
