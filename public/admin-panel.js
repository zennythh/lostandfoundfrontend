const token = localStorage.getItem("jwt");

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

async function fetchItems() {
  try {
    const [pendingRes, approvedRes] = await Promise.all([
      fetch("http://localhost:8080/api/items/requests"),
      fetch("http://localhost:8080/api/items")
    ]);

    const pendingItems = await pendingRes.json();
    const approvedItems = await approvedRes.json();

    displayItems(pendingItems, "inbox", true);
    displayItems(approvedItems, "feed", false);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

function createItemCard(item, isPending) {
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

  // Open modal when clicking the card (not buttons)
  card.onclick = (e) => {
    // Prevent modal from opening if a button is clicked
    if (e.target.closest('button')) return;
    showModal(item);
  };

  return card;
}

function displayItems(items, containerId, isPending) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach((item) => {
    container.appendChild(createItemCard(item, isPending));
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

async function markAsClaimed(itemId) {
  try {
    const res = await fetch(`http://localhost:8080/api/items/claim/${itemId}`, {
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

  switch (view) {
    case "dashboard":
      inboxEl.style.display = "block";
      feedEl.style.display  = "block";
      break;
    case "inbox":
      inboxEl.style.display = "block";
      feedEl.style.display  = "none";
      break;
    case "feed":
      inboxEl.style.display = "none";
      feedEl.style.display  = "block";
      break;
  }
}

function showModal(item) {
  const modal = document.getElementById("item-modal");
  const modalBody = document.getElementById("modal-body");
  const modalActions = document.getElementById("modal-actions");

  modalBody.innerHTML = `
    <h3>${escapeHTML(item.name)}</h3>
    <p>${escapeHTML(item.description || "No description.")}</p>
    <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
    <p><strong>Location:</strong> ${escapeHTML(item.location)}</p>
    <p><strong>Date:</strong> ${new Date(item.reportedOn).toLocaleString()}</p>
  `;

  modalActions.innerHTML = `
    <button id="mark-claimed-btn">Mark as Claimed</button>
    <button id="update-btn">Update</button>
    <button id="delete-btn">Delete</button>
  `;

  // Mark as Claimed button
  document.getElementById("mark-claimed-btn").onclick = async () => {
    await markAsClaimed(item.itemId);
    modal.style.display = "none";
    fetchItems();
  };

  // Delete button
  document.getElementById("delete-btn").onclick = async () => {
    await rejectItem(item.itemId);
    modal.style.display = "none";
    fetchItems();
  };

  // Update button
  document.getElementById("update-btn").onclick = () => {
    alert("TODO: implement update modal");
  };

  // Close button for the modal
  document.querySelector(".close").onclick = () => {
    modal.style.display = "none";
  };

  // Display modal
  modal.style.display = "flex";
}

// Initial load
window.onload = () => {
  filterView("dashboard");

  fetchItems(); // 🔥 THIS is what loads the items!

  document.querySelector(".close").onclick = () => {
    document.getElementById("item-modal").style.display = "none";
  };
};