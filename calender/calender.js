const calender = document.getElementById("calender");
const buttons = document.querySelectorAll(".filters button");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDate = document.getElementById("modal-date");
const modalCategory = document.getElementById("modal-category");
const modalDescription = document.getElementById("modal-description");
const closeBtn = document.getElementById("close");

let calenderData = [];

// Fetch data from JSON
fetch('calender.json')
  .then(res => res.json())
  .then(data => {
    calenderData = data;
    rendercalender();
  })
  .catch(err => console.error('Error loading calender data:', err));

// Render calender
function rendercalender(category = "All") {
  calender.innerHTML = "";
  const filtered = category === "All" ? calenderData : calenderData.filter(e => e.category === category);
  
  filtered.forEach(event => {
    const div = document.createElement("div");
    div.className = `calender-item ${event.category.toLowerCase()}`;
    div.textContent = `${event.date} - ${event.title}`;
    div.addEventListener("click", () => openModal(event));
    calender.appendChild(div);
  });
}

// Filter buttons
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    rendercalender(btn.dataset.category);
  });
});

// Modal functions
function openModal(event) {
  modal.style.display = "block";
  modalTitle.textContent = event.title;
  modalDate.textContent = `Date: ${event.date}`;
  modalCategory.textContent = `Category: ${event.category}`;
  modalDescription.textContent = event.description;
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
}
