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

  const formElement = event.target;
  const formData = new FormData();

  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const foundOn = date && time ? `${date}T${time}` : null;

  // Append text fields
  formData.append('status', document.getElementById('status').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('name', document.getElementById('name').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('location', document.getElementById('location').value);
  formData.append('campus', document.getElementById('campus').value)
  formData.append('foundOn', foundOn);

  // Append image file
  const imageInput = document.getElementById('image');
  if (imageInput.files.length > 0) {
    formData.append('file', imageInput.files[0]);
  }

  fetch('http://localhost:8080/api/items/report', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ` + localStorage.getItem(`token`)
    },
    body: formData,
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to submit item');
      return response.json();
    })
    .then(data => {
      console.log('Submission successful:', data);
      alert("Your report has been submitted. Thank you!");
      closeForm();
      formElement.reset();
      fetchItems(); // Refresh the list
    })
    .catch(error => {
      console.error('Error submitting item:', error);
      alert("There was a problem submitting your report.");
    });
}

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

function getTimeOnly(datetimeStr) {
  const date = new Date(datetimeStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


function renderItems(items) {
  const container = document.querySelector('.report-list');
  container.innerHTML = '';

  items.forEach(item => {
    const button = document.createElement('button');
    button.className = `report-item ${item.type}`;

    const imagePath = item.imagePath
          ? item.imagePath.replace(/^uploads\//, 'http://localhost:8080/images/')
          : 'placeholder.png';

    button.onclick = () => openModalFromHTML(
      item.name,
      capitalizeFirstLetter(item.status),
      `${item.category || 'Uncategorized'} • ${formatDate(item.reportedOn)} • ${item.location}`,
      item.reportedOn,
      getTimeOnly(item.reportedOn),
      item.location,
      item.campus,
      imagePath || 'placeholder.png'
    );

    button.innerHTML = `
      <img src="${imagePath || 'placeholder.png'}" alt="${item.name}" />
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

function openModalFromHTML(title, status, description, date, time, location, campus, imgUrl) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalType').textContent = status;
  document.getElementById('modalDesc').textContent = description;
  document.getElementById('modalDate').textContent = formatDate(date);
  document.getElementById('modalTime').textContent = time;
  document.getElementById('modalLocation').textContent = location;
  document.getElementById('modalCampus').textContent = campus;
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

document.addEventListener('DOMContentLoaded', () => {
  fetchItems();
  fetchSummary();
});
