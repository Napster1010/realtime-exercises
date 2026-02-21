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
  console.log("BACK HERE");
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

  // Now try to read the response stream till the connection is actually closed by the server
  let readerResponse;
  do {
    try {
      readerResponse = await reader.read();
      console.log(readerResponse.done);
      const chunk = utf8Decoder.decode(readerResponse.value, { stream: true });
      try {
        if (chunk) {
          const latestMessages = JSON.parse(chunk);
          console.log(latestMessages);
          allChat = latestMessages.msgs;
          render();
        }
      } catch (err) {
        console.error("Received invalid JSON from the stream", err);
      }
    } catch (err) {
      console.error("Error reading chunk from response stream", err);
      presence.innerText = "🔴";
      return;
    }
  } while (!readerResponse.done);
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
