const overlay = document.getElementById('overlay');
const pageContent = document.getElementById('page-content');

function openForm() {
  overlay.classList.add('active');
  pageContent.classList.add('blurred');
}

function closeForm() {
  overlay.classList.remove('active');
  pageContent.classList.remove('blurred');
}

function submitForm(event) {
  event.preventDefault();

  const formData = {
    type: document.getElementById('type').value,
    item: document.getElementById('item').value,
    description: document.getElementById('description').value,
    date: document.getElementById('date').value,
    location: document.getElementById('location').value,
    contact: document.getElementById('contact').value,
  };

  console.log("Form submitted:", formData);

  closeForm();

  alert("Your report has been submitted. Thank you!");

  event.target.reset(); // Optional: Reset form fields
}

document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
  });
  
  function fetchItems() {
    fetch('http://localhost:8080/api/items')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
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
    container.innerHTML = ''; // Clear any existing static content
  
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = `report-item ${item.type}`;
  
      div.innerHTML = `
        <img src="${item.imageUrl || 'placeholder.png'}" alt="${item.name}" />
        <div>
          <h3>${item.name}</h3>
          <p>${item.category || 'Uncategorized'} • ${formatDate(item.reportedOn)} • ${item.location}</p>
          <span class="tag">${capitalizeFirstLetter(item.status)}</span>
        </div>
      `;
  
      container.appendChild(div);
    });
  }
  
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }
  
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetchItems();       // Assuming you already have this
    fetchSummary();     // Add this call
  });
  
  function fetchSummary() {
    fetch('http://localhost:8080/api/items/count') // ✅ Your Spring Boot endpoint
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
  
  