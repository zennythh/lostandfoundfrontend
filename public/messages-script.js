let currentConversationId = null;
let selectedRecipientId = null;
const userId = parseInt(localStorage.getItem("userId"), 10);
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  fetchConversations();
});

function fetchMessages(conversationId) {
  fetch(`http://localhost:8080/api/messages/conversation/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(messages => {
    const area = document.getElementById("messageArea");
    area.innerHTML = '';
    messages.forEach(msg => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('message-wrapper', msg.sender.id == userId ? 'right' : 'left');

      const content = document.createElement('div');
      content.classList.add('message-content');

      const header = document.createElement('div');
      header.classList.add('message-header');

      const username = document.createElement('span');
      username.classList.add('username');
      username.textContent = msg.sender.username;

      const timestamp = document.createElement('span');
      timestamp.classList.add('timestamp');
      timestamp.textContent = new Date(msg.timestamp).toLocaleString();

      const text = document.createElement('div');
      text.classList.add('message-text');
      text.textContent = msg.content;

      header.appendChild(username);
      header.appendChild(timestamp);
      content.appendChild(header);
      content.appendChild(text);
      wrapper.appendChild(content);
      area.appendChild(wrapper);
    });
    area.scrollTop = area.scrollHeight;
  });
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const content = input.value.trim();
  if (!content || !currentConversationId) return;

  fetch("http://localhost:8080/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      content: content,
      recipient: {
        id: getOtherUserId()
      }
    })
  }).then(() => {
    input.value = '';
    fetchMessages(currentConversationId);
  });
}

// Uses the last selected recipient ID
function getOtherUserId() {
  return selectedRecipientId;
}

function getTimestamp() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  return `${date} ${hours}:${minutes} ${ampm}`;
}

function renderConversations(conversations) {
  const container = document.createElement('div');
  container.classList.add('conversation-list');

  conversations.forEach(conversation => {
    const otherUserId = (parseInt(conversation.user1Id) === parseInt(userId))
      ? conversation.user2Id
      : conversation.user1Id;

    fetch(`http://localhost:8080/api/auth/users/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    })
    .then(otherUser => {
      const convoItem = document.createElement('div');
      convoItem.classList.add('conversation-item');
      convoItem.textContent = otherUser.username;

      convoItem.addEventListener('click', () => {
        currentConversationId = conversation.id;
        selectedRecipientId = otherUser.id;
        fetchMessages(conversation.id);
      });

      container.appendChild(convoItem);
    })
    .catch(error => {
      console.warn("Failed to fetch user for conversation:", conversation, error);
    });
  });

  let sidebar = document.getElementById('conversationSidebar');
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'conversationSidebar';
    sidebar.classList.add('sidebar');
    document.body.insertBefore(sidebar, document.body.firstChild);
  }
  sidebar.innerHTML = '';
  sidebar.appendChild(container);
}

function fetchConversations() {
  fetch('http://localhost:8080/api/conversations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch conversations");
    return response.json();
  })
  .then(conversations => {
    console.log("Fetched conversations:", conversations); // ✅ DEBUG LOG
    renderConversations(conversations);
  })
  .catch(error => {
    console.error('Error fetching conversations:', error);
  });
}

