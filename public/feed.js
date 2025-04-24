let allItems = [];
let currentFilter = 'dashboard';

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

  formData.append('status', document.getElementById('status').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('name', document.getElementById('name').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('location', document.getElementById('location').value);
  formData.append('campus', document.getElementById('campus').value);
  formData.append('foundOn', foundOn);

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
      allItems = data; // cache for filtering
      renderItems(allItems); // show all by default
    })
    .catch(error => {
      console.error('Error fetching items:', error);
    });
}

function getTimeOnly(datetimeStr) {
  const date = new Date(datetimeStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatString(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
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
      `${formatString(item.category || 'Uncategorized')} • ${formatDate(item.reportedOn)} • ${item.location}`,
      item.reportedOn,
      getTimeOnly(item.reportedOn),
      item.location,
      formatString(item.campus), // Format campus name here
      imagePath || 'placeholder.png',
      item.authorId,
      item.itemId,
      currentFilter === 'yourReports' // Show action buttons only in "Your Reports"
    );

    const img = document.createElement('img');
    img.src = imagePath || 'placeholder.png';
    img.alt = item.name;

    const div = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = item.name;

    const description = document.createElement('p');
    description.textContent = `${formatString(item.category || 'Uncategorized')} • ${formatDate(item.reportedOn)} • ${item.location}`;

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = capitalizeFirstLetter(item.status);

    div.append(title, description, tag);
    button.append(img, div);
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

function openModalFromHTML(title, status, description, date, time, location, campus, imgUrl, authorId, itemId, showActions = false) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalType').textContent = status;
  document.getElementById('modalDesc').textContent = description;
  document.getElementById('modalDate').textContent = formatDate(date);
  document.getElementById('modalTime').textContent = time;
  document.getElementById('modalLocation').textContent = location;
  document.getElementById('modalCampus').textContent = campus;
  document.getElementById('modalImage').src = imgUrl || 'placeholder.png';

  const modalAuthor = document.getElementById('modalAuthor');
  modalAuthor.innerHTML = 'Loading...';

  fetchUserById(authorId)
    .then(user => {
      modalAuthor.innerHTML = `
        <p><strong>Author:</strong> ${user.firstName} ${user.lastName}</p>
        <p><strong>Contact:</strong> ${user.contactNum}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <button onclick="startChat(${user.id})">Message Author</button>
      `;

      const modalActions = document.getElementById('modalActions');
      if (showActions) {
        modalActions.innerHTML = `
          <button onclick="markAsClaimed(${itemId})">Mark as Claimed</button>
          <button onclick="editItem(${itemId})">Update</button>
          <button onclick="deleteItem(${itemId})">Delete</button>
        `;
      } else {
        modalActions.innerHTML = ''; // Clear actions
      }
    })
    .catch(err => {
      modalAuthor.textContent = "Author details not available.";
      console.error(err);
    });

  document.getElementById('itemModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('itemModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  // Initially highlight the 'Dashboard' link
  document.querySelector('.menu-link[onclick*="dashboard"]').classList.add('active');

  fetchItems();
  fetchSummary();
});

function filterView(category) {
  const loggedInUserId = parseInt(localStorage.getItem('userId'));
  console.log("Filter category:", category);
  console.log("Logged in user ID:", loggedInUserId);

  // Remove the 'active' class from all menu items
  const menuLinks = document.querySelectorAll('.menu-link');
  menuLinks.forEach(link => link.classList.remove('active'));

  // Add the 'active' class to the selected link
  const activeLink = document.querySelector(`.menu-link[onclick*="${category}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // Update currentFilter
  currentFilter = category;

  let filteredItems;

  if (category === 'yourReports') {
    filteredItems = allItems.filter(item => item.authorId === loggedInUserId);
  } else if (category === 'claimed') {
    filteredItems = allItems.filter(item => item.status === 'Claimed');
  } else if (category === 'dashboard') {
    filteredItems = allItems; // show all items
  } else {
    filteredItems = allItems.filter(item => item.status.toLowerCase() === category.toLowerCase());
  }

  renderItems(filteredItems);
}

function toggleSidebar() {
  document.querySelector('.sidebar')?.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  fetchItems();
  fetchSummary();
});

function fetchUserById(authorId) {
  return fetch(`http://localhost:8080/api/auth/users/${authorId}`, {
    headers: {
      Authorization: `Bearer ` + localStorage.getItem('token')
    }
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  });
}

function markAsClaimed(itemId) {
  fetch(`http://localhost:8080/api/items/claimedreq/${itemId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ` + localStorage.getItem('token')
    }
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to mark as claimed');
    alert('Item marked as claimed.');
    closeModal();
    fetchItems();
  })
  .catch(err => {
    console.error(err);
    alert('Could not mark item as claimed.');
  });
}

function editItem(itemId) {
  // Redirect to edit page with itemId in query
  window.location.href = `/edit-item.html?id=${itemId}`;
}

function deleteItem(itemId) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  fetch(`http://localhost:8080/api/items/delete/${itemId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ` + localStorage.getItem('token')
    }
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to delete item');
    alert('Item deleted successfully.');
    closeModal();
    fetchItems();
  })
  .catch(err => {
    console.error(err);
    alert('Failed to delete the item.');
  });
}