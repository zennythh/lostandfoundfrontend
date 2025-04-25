let currentConversationId = null;
let selectedRecipientId = null;

const userId = parseInt(localStorage.getItem("userId"), 10);
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  fetchConversationsAndUsers();

  // Log when DOM is fully loaded
  console.log("DOM fully loaded");
});

async function fetchConversationsAndUsers() {
  try {
    const res = await fetch("http://localhost:8080/api/conversations", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");

    const conversations = await res.json();

    const enrichedConversations = await Promise.all(
      conversations.map(async convo => {
        const [user1, user2] = await Promise.all([
          fetchUserById(convo.user1Id),
          fetchUserById(convo.user2Id)
        ]);
        return { ...convo, user1, user2 };
      })
    );

    // Set the currentConversationId and selectedRecipientId after conversations are loaded
    const conversationIdFromUrl = getConversationIdFromUrl();
    if (conversationIdFromUrl) {
      currentConversationId = parseInt(conversationIdFromUrl, 10);
      fetchMessages(currentConversationId);

      // Find the selected conversation
      const selectedConversation = enrichedConversations.find(convo => convo.id === currentConversationId);
      if (selectedConversation) {
        selectedRecipientId = selectedConversation.user1.id === userId ? selectedConversation.user2.id : selectedConversation.user1.id;
        console.log("Selected recipient ID from URL conversation:", selectedRecipientId);
      }
    }

    renderConversations(enrichedConversations);
  } catch (err) {
    console.error("Conversation error:", err);
  }
}

function getConversationIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("conversationId");
}

function renderConversations(conversations) {
  const listContainer = document.getElementById("conversationList");
  if (!listContainer) {
    console.error("Missing #conversationList element in sidebar.");
    return;
  }

  listContainer.innerHTML = "";

  conversations.forEach(convo => {
    const otherUser = convo.user1.id === userId ? convo.user2 : convo.user1;

    const convoItem = document.createElement("div");
    convoItem.classList.add("conversation-item");
    convoItem.textContent = `${otherUser.firstName} ${otherUser.lastName}`;

    convoItem.addEventListener("click", () => {
      currentConversationId = convo.id;
      selectedRecipientId = otherUser.id;
      console.log("Selected conversation ID:", currentConversationId);
      console.log("Selected recipient ID:", selectedRecipientId);  // Log here to confirm the value
      fetchMessages(convo.id);
    });

    listContainer.appendChild(convoItem);
  });
}

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
        wrapper.classList.add('message-wrapper', msg.sender.id === userId ? 'right' : 'left');

        const content = document.createElement('div');
        content.classList.add('message-content');

        const header = document.createElement('div');
        header.classList.add('message-header');

        const username = document.createElement('span');
        username.classList.add('username');
        username.textContent = `${msg.sender.firstName} ${msg.sender.lastName}`;

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

document.getElementById("sendButton").addEventListener("click", sendMessage);

function sendMessage() {
  const input = document.getElementById("messageInput");
  const content = input.value.trim();

  // Log the message content and other values
  console.log("Message content:", content);
  console.log("Conversation ID:", currentConversationId);
  console.log("Recipient ID:", selectedRecipientId);

  if (!content || !currentConversationId || !selectedRecipientId) {
    console.log("One or more required fields are missing.");
    return;
  }

  console.log("Attempting to send message...");

  fetch("http://localhost:8080/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      content: content,
      recipient: { id: selectedRecipientId } // this matches the expected structure
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    input.value = '';
    fetchMessages(currentConversationId);
  }).catch(error => {
    console.error("Error sending message:", error);
    alert("Could not send message");
  });
}

async function fetchUserById(userId) {
  const res = await fetch(`http://localhost:8080/api/auth/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
  return res.json();
}