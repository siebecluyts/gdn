(function () {
  const COOKIE_KEY = "cookies_accepted";
  const THEME_KEY = "darkMode";

  function cookiesAccepted() {
    return localStorage.getItem(COOKIE_KEY) === "true";
  }

  function applySavedTheme() {
    if (!cookiesAccepted()) return;

    const dark = localStorage.getItem(THEME_KEY) === "true";
    if (dark) document.body.classList.add("dark");
  }

  function toggleTheme() {
    document.body.classList.toggle("dark");

    if (cookiesAccepted()) {
      localStorage.setItem(
        THEME_KEY,
        document.body.classList.contains("dark")
      );
    }
  }

  // Expose toggle globally
  window.toggleDarkMode = toggleTheme;

  // Apply theme ASAP
  document.addEventListener("DOMContentLoaded", applySavedTheme);
})();
