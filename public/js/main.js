//access the form (for messages)
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById("users");

// get username and room from URL
const { username, room } = Qs.parse(location.search, {
    // add in option to hide the symbols
    ignoreQueryPrefix: true
})

const socket = io();

// join chatroom
socket.emit('joinRoom', {username, room})

// get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

//catch the socket variable event 'message' from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message)

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// message submit listener, resulting function
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get msg text
    const msg = e.target.elements.msg.value;

    //emit msg to server (as payload for chatMessage)
    socket.emit('chatMessage', msg);

    // clear inputs
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
    
})

// output message to DOM
function outputMessage(message) {
    // in the html (~line 29), we see the 'chat-message' div
    // has an internal div of 'message' with its own metadata and text
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`;
    chatMessages.appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}