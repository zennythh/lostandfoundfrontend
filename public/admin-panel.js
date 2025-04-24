const token = localStorage.getItem("jwt");

async function fetchItems() {
  try {
    const [pendingRes, approvedRes] = await Promise.all([
      fetch("http://localhost:8080/api/items/requests"),
      fetch("http://localhost:8080/api/items")
    ]);

    const pendingItems = await pendingRes.json();
    const approvedItems = await approvedRes.json();

    displayItems(pendingItems, "inbox", true);  // Pending items
    displayItems(approvedItems, "feed", false); // Approved items
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

function createItemCard(item, isPending) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.id = `item-${item.itemId}`;

  card.innerHTML = `
    <h3>${item.name}</h3>
    <p>${item.description || "No description provided."}</p>
    <p><strong>Category:</strong> ${item.category}</p>
    <p><strong>Location:</strong> ${item.location}</p>
    <p><strong>Date:</strong> ${new Date(item.reportedOn).toLocaleString()}</p>
    ${isPending ? `
      <button class="accept">Accept</button>
      <button class="reject">Reject</button>
    ` : ""}
  `;

  if (isPending) {
    card.querySelector(".accept").onclick = async () => {
      console.log(`Accept clicked for itemId: ${item.itemId}`);
      await markAsApproved(item.itemId);
      card.remove();
      document.getElementById("feed").appendChild(createItemCard(item, false));
    };

    card.querySelector(".reject").onclick = async () => {
      console.log(`Reject clicked for itemId: ${item.itemId}`);
      await rejectItem(item.itemId);
      card.remove();
    };
  }

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
            Authorization: `Bearer ` + localStorage.getItem(`token`)
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
            Authorization: `Bearer ` + localStorage.getItem(`token`)
          }
    });
    if (!res.ok) throw new Error("Failed to reject item.");
    console.log(`Item ${itemId} rejected successfully.`);
  } catch (err) {
    console.error(err);
    alert("Error rejecting item.");
  }
}

// Load on page start
fetchItems();
