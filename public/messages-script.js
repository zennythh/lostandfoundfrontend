88% of storage used … If you run out, you can't create, edit, and upload files. Get 100 GB of storage for ₱119.00 ₱29.00/month for 2 months.
let isOtherUser = false;

function toggleUser() {
  isOtherUser = !isOtherUser;
}

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (message !== '') {
    const messageArea = document.getElementById('messageArea');

    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper', isOtherUser ? 'left' : 'right');

    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    avatar.src = isOtherUser
      ? 'https://picsum.photos/200/300'
      : 'https://picsum.photos/200/300';

    const content = document.createElement('div');
    content.classList.add('message-content');

    const header = document.createElement('div');
    header.classList.add('message-header');

    const username = document.createElement('span');
    username.classList.add('username');
    username.textContent = isOtherUser ? 'OtherUser' : 'You';

    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    timestamp.textContent = getTimestamp();

    const text = document.createElement('div');
    text.classList.add('message-text');
    text.textContent = message;

    header.appendChild(username);
    header.appendChild(timestamp);
    content.appendChild(header);
    content.appendChild(text);

    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(content);

    messageArea.appendChild(messageWrapper);
    messageArea.scrollTop = messageArea.scrollHeight;
    messageInput.value = '';
  }
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