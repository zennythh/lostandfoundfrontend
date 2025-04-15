const overlay = document.getElementById('overlay');
const pageContent = document.getElementById('page-content');

function openForm() {
  overlay.classList.add('active');
  pageContent?.classList.add('blurred');
}

function closeForm() {
  overlay.classList.remove('active');
  pageContent?.classList.remove('blurred');
}

function submitForm(event) {
  event.preventDefault();

  const formData = {
    type: document.getElementById('type').value,
    item: document.getElementById('item').value,
    description: document.getElementById('description').value,
    date: document.getElementById('date').value,
    location: document.getElementById('location').value,
    contact: document.getElementById('contact')?.value || '',
  };

  console.log("Form submitted:", formData);
  closeForm();
  alert("Your report has been submitted. Thank you!");
  event.target.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchItems();
  fetchSummary();
});

function fetchItems() {
  fetch('http://localhost:8080/api/items')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    })
    .then(data => {
      renderItems(data);
    })
    .catch(error => {
      console.error('Error fetching items:', error);
    });
}

function renderItems(items) {
  const container = document.querySelector('.report-list');
  container.innerHTML = '';

  items.forEach(item => {
    const button = document.createElement('button');
    button.className = `report-item ${item.type}`;
    button.onclick = () => openModalFromHTML(
      item.name,
      capitalizeFirstLetter(item.status),
      `${item.category || 'Uncategorized'} • ${formatDate(item.reportedOn)} • ${item.location}`,
      item.reportedOn,
      item.reportedTime || 'Unknown',
      item.location,
      item.imageUrl || 'placeholder.png'
    );

    button.innerHTML = `
      <img src="${item.imageUrl || 'placeholder.png'}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <p>${item.category || 'Uncategorized'} • ${formatDate(item.reportedOn)} • ${item.location}</p>
        <span class="tag">${capitalizeFirstLetter(item.status)}</span>
      </div>
    `;

    container.appendChild(button);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function fetchSummary() {
  fetch('http://localhost:8080/api/items/count')
    .then(res => res.json())
    .then(data => {
      updateSummaryCounts(data);
    })
    .catch(err => console.error('Error fetching summary:', err));
}

function updateSummaryCounts(summary) {
  document.querySelector('.card.lost span').textContent = summary.lost || 0;
  document.querySelector('.card.found span').textContent = summary.found || 0;
  document.querySelector('.card.claimed span').textContent = summary.claimed || 0;
}

function openModalFromHTML(title, status, description, date, time, location, imgUrl) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalType').textContent = status;
  document.getElementById('modalDesc').textContent = description;
  document.getElementById('modalDate').textContent = formatDate(date);
  document.getElementById('modalTime').textContent = time;
  document.getElementById('modalLocation').textContent = location;
  document.getElementById('modalImage').src = imgUrl || 'placeholder.png';

  document.getElementById('itemModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('itemModal').classList.add('hidden');
}

function filterView(category) {
  console.log("Filtering category:", category);
  // Future logic here
}

function toggleSidebar() {
  document.querySelector('.sidebar')?.classList.toggle('open');
}