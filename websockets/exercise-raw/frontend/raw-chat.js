const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// listen for events on the form
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  // code goes here
}

const websocket = new WebSocket("ws://localhost:8080", ["json"]);

websocket.addEventListener("open", () => {
  console.log("Connected");
  presence.innerText = "🟢";
});

websocket.addEventListener("message", (event) => {
  console.log("Received a new message over websocket from sever", event);
  const latestMessages = JSON.parse(event.data);
  allChat = latestMessages.msgs;
  render();
});

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
