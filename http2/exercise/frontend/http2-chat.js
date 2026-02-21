const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  const utf8Decoder = new TextDecoder("utf-8");
  // First part is to connect to the server to start reading the stream.
  let reader;
  try {
    const response = await fetch("/msgs");
    reader = response.body.getReader();
  } catch (err) {
    console.error("Couldn't connect to the server", err);
  }
  console.log("Connected to the server");
  presence.innerText = "🟢";

  // Now try to read the first chunk of data in the response stream
  try {
    const readerResponse = await reader.read();
    const chunk = utf8Decoder.decode(readerResponse.value, { stream: true });
    console.log(chunk);
  } catch (err) {
    console.error("Error reading chunk from response stream", err);
    presence.innerText = "🔴";
  }
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id),
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
