const token = localStorage.getItem("token");

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

async function fetchItems() {
  try {
    const [pendingRes, approvedRes, deletedRes] = await Promise.all([
      fetch("http://localhost:8080/api/items/requests"),
      fetch("http://localhost:8080/api/items"),
      fetch("http://localhost:8080/api/items/deleted")
    ]);

    const pendingItems = await pendingRes.json();
    const approvedItems = await approvedRes.json();
    const deletedItems = await deletedRes.json();

    displayItems(pendingItems, "inbox", true);
    displayItems(approvedItems, "feed", false);
    displayItems(deletedItems, "deleted", false, true);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

function createItemCard(item, isPending, isDeleted = false) {
  const card = document.createElement("div");
  card.className = "report-card";
  card.id = `item-${item.itemId}`;

  const imagePath = item.imagePath
    ? item.imagePath.replace(/^uploads\//, 'http://localhost:8080/images/')
    : 'placeholder.png';

  card.innerHTML = `
    <img src="${imagePath}" alt="${escapeHTML(item.name)}" class="report-image">
    <h3>${escapeHTML(item.name)}</h3>
    <p>${escapeHTML(item.description || "No description provided.")}</p>
    <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
    <p><strong>Location:</strong> ${escapeHTML(item.location)}</p>
    <p><strong>Date:</strong> ${new Date(item.reportedOn).toLocaleString()}</p>
    ${isPending ? `
      <button class="accept">Accept</button>
      <button class="reject">Reject</button>
    ` : ""}
  `;

  if (isPending) {
    card.querySelector(".accept").onclick = async (e) => {
      e.stopPropagation();
      await markAsApproved(item.itemId);
      card.remove();
      document.getElementById("feed").appendChild(createItemCard(item, false));
    };

    card.querySelector(".reject").onclick = async (e) => {
      e.stopPropagation();
      await rejectItem(item.itemId);
      card.remove();
    };
  }

  card.onclick = (e) => {
    if (e.target.closest('button')) return;
    showModal(item, isDeleted);
  };

  return card;
}

function displayItems(items, containerId, isPending, isDeleted = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach((item) => {
    container.appendChild(createItemCard(item, isPending, isDeleted));
  });
}

async function markAsApproved(itemId) {
  try {
    const res = await fetch(`http://localhost:8080/api/items/approve/${itemId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to approve item.");
    console.log(`Item ${itemId} approved successfully.`);
  } catch (err) {
    console.error(err);
    alert("Error approving item.");
  }
}

async function rejectItem(itemId) {
  try {
    const res = await fetch(`http://localhost:8080/api/items/delete/${itemId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to reject item.");
    console.log(`Item ${itemId} rejected successfully.`);
  } catch (err) {
    console.error(err);
    alert("Error rejecting item.");
  }
}

async function restoreItem(itemId) {
  try {
    const res = await fetch(`http://localhost:8080/api/items/restore/${itemId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to restore item.");
    console.log(`Item ${itemId} restored successfully.`);
    fetchItems();
  } catch (err) {
    console.error(err);
    alert("Error restoring item.");
  }
}

async function markAsClaimed(itemId) {
  try {
    const res = await fetch(`http://localhost:8080/api/items/claimedreq/${itemId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to mark item as claimed.");
    console.log(`Item ${itemId} marked as claimed.`);
  } catch (err) {
    console.error(err);
    alert("Error marking item as claimed.");
  }
}

function filterView(view) {
  const inboxEl = document.getElementById("inbox-section");
  const feedEl  = document.getElementById("feed-section");
  const deletedEl = document.getElementById("deleted-section");

  inboxEl.style.display = "none";
  feedEl.style.display = "none";
  deletedEl.style.display = "none";

  switch (view) {
    case "dashboard":
      inboxEl.style.display = "block";
      feedEl.style.display  = "block";
      break;
    case "inbox":
      inboxEl.style.display = "block";
      break;
    case "feed":
      feedEl.style.display  = "block";
      break;
    case "deleted":
      deletedEl.style.display = "block";
      break;
  }
}

async function showModal(item) {
  const modal = document.getElementById("item-modal");
  const modalBody = document.getElementById("modal-body");
  const modalActions = document.getElementById("modal-actions");

  // Fetch author details
  let authorHTML = "";
  try {
    const res = await fetch(`http://localhost:8080/api/auth/users/${item.authorId}`);
    if (!res.ok) throw new Error("Failed to fetch author info");
    const author = await res.json();

    authorHTML = `
      <hr style="margin: 1em 0;">
      <h4>Reporter Info</h4>
      <p><strong>Name:</strong> ${escapeHTML(author.firstName + " " + author.lastName)}</p>
      <p><strong>Contact:</strong> ${escapeHTML(author.contactNum)}</p>
      <p><strong>Email:</strong> ${escapeHTML(author.email)}</p>
    `;
  } catch (err) {
    console.error("Author fetch error:", err);
    authorHTML = `<p><em>Author details unavailable.</em></p>`;
  }

  const imagePath = item.imagePath
    ? item.imagePath.replace(/^uploads\//, 'http://localhost:8080/images/')
    : 'placeholder.png';

  // Populate modal
  modalBody.innerHTML = `
    <img src="${imagePath}" alt="${escapeHTML(item.name)}" class="report-image" style="max-height: 200px; display: block; margin: 0 auto 1em;">
    <h3>${escapeHTML(item.name)}</h3>
    <p><strong>Description:</strong> ${escapeHTML(item.description || "No description.")}</p>
    <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
    <p><strong>Location:</strong> ${escapeHTML(item.location)}</p>
    <p><strong>Campus:</strong> ${escapeHTML(item.campus || "N/A")}</p>
    <p><strong>Status:</strong> ${escapeHTML(item.status)}</p>
    <p><strong>Reported on:</strong> ${new Date(item.reportedOn).toLocaleString()}</p>
    <p><strong>Approved:</strong> ${item.approved ? "✅ Yes" : "❌ No"}</p>
    <p><strong>Deleted:</strong> ${item.deleted ? "🗑️ Yes" : "❌ No"}</p>
    ${authorHTML}
  `;

  // Determine available actions
  modalActions.innerHTML = '';

  if (item.deleted) {
    modalActions.innerHTML = `<button id="restore-btn">Restore Item</button>`;
    document.getElementById("restore-btn").onclick = async () => {
      await restoreItem(item.itemId);
      modal.style.display = "none";
      fetchItems();
    };
  } else {
    modalActions.innerHTML = `
      <button id="mark-claimed-btn">Mark as Claimed</button>
      <button id="update-btn">Update</button>
      <button id="delete-btn">Delete</button>
    `;

    document.getElementById("mark-claimed-btn").onclick = async () => {
      await markAsClaimed(item.itemId);
      modal.style.display = "none";
      fetchItems();
    };

    document.getElementById("delete-btn").onclick = async () => {
      await rejectItem(item.itemId);
      modal.style.display = "none";
      fetchItems();
    };

    document.getElementById("update-btn").onclick = () => {
      alert("TODO: implement update modal");
    };
  }

  document.querySelector(".close").onclick = () => {
    modal.style.display = "none";
  };

  modal.style.display = "flex";
}

window.onload = () => {
  filterView("dashboard");
  fetchItems();
  document.querySelector(".close").onclick = () => {
    document.getElementById("item-modal").style.display = "none";
  };
};

function fetchUserDetails(userId) {
  fetch(`http://localhost:8080/api/auth/users/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch user details');
      return response.json();
    })
    .then(data => {
      const userName = `${data.firstName} ${data.lastName}`; // Concatenate first name and last name
      document.getElementById('logged-in-user').textContent = `Logged in as ${userName}`;
    })
    .catch(error => {
      console.error('Error fetching user details:', error);
    });
}

// On page load or when the user is logged in, call this function
document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
  if (userId) {
    fetchUserDetails(userId); // Fetch and display the user's full name
  }
});