const { io } = require("socket.io-client");

const socket = io('ws://localhost:3001');

socket.on("connect", () => {
    console.log(socket.id);
});
  
socket.on("disconnect", () => {
    console.log("Websocket server disconnected");
});
  