// a global called "io" is being loaded separately

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("Connected with Server");
  presence.innerText = "🟢";
});

socket.on("disconnect", () => {
  console.warn("Disconnected with Server");
  presence.innerText = "🔴";
});

socket.on("chat:public", (data) => {
  console.log("Received new message", data);
  allChat = data.msgs;
  render();
});

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  socket.emit("chat:public", {
    user,
    text,
  });
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
