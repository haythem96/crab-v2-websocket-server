/**
 * Test Server<->Client connection
 * Make sure to run the WebScoket server first: yarn compile && yarn start
 */
const { io } = require("socket.io-client");

const socket = io('ws://localhost:3001');

socket.on("connect", () => {
    console.log(socket.id);
});
socket.on("all_auctions", (auctions) => {
    console.log("got all past auctions", auctions.length)
})
socket.on("current_auction", (current_auction) => {
    console.log("current_auction", current_auction)
})
socket.on("disconnect", () => {
    console.log("Websocket server disconnected");
});