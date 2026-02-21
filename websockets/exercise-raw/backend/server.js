import http from "http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";

// these are helpers to help you deal with the binary data that websockets use
import objToResponse from "./obj-to-response.js";
import generateAcceptValue from "./generate-accept-value.js";
import parseMessage from "./parse-message.js";

let connections = [];
const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./frontend",
  });
});

server.on("upgrade", (req, socket) => {
  if (req.headers["upgrade"] !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request");
    return;
  }

  const acceptKey = req.headers["sec-websocket-key"];
  const acceptValue = generateAcceptValue(acceptKey);

  const headers = [
    "HTTP/1.1 101 Web Socket Protocol Handshake",
    "Upgrade: WebSocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptValue}`,
    "Sec-WebSocket-Protocol: json",
    "\r\n",
  ];

  socket.write(headers.join("\r\n"));

  console.log("Upgraded to WebSocket!");

  // Write something via the websocket to the client
  socket.write(objToResponse({ msgs: getMsgs() }));

  // Add socket to the list of active connections
  connections.push(socket);

  // Add handler to accept data from the socket
  socket.on("data", (buffer) => {
    const message = parseMessage(buffer);
    if (message) {
      msg.push({
        user: message.user,
        text: message.text,
        time: Date.now(),
      });

      // Broadcast to all active connections
      connections.forEach((c) => c.write(objToResponse({ msgs: getMsgs() })));
    } else if (message == null) {
      socket.end();
    }
  });

  // Add handler to end socket connection
  socket.on("end", () => {
    connections = connections.filter((c) => c !== socket);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`),
);
