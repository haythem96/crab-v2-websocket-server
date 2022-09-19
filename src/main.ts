const express = require('express')
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, onSnapshot, where } from "firebase/firestore";

const expressApp = express();
const httpServer = createServer(expressApp);
const io = new Server(httpServer, { /* options */ });
const port = 3001

const firebaseConfig =
    Number(process.env.ETHEREUM_CHAIN_ID) === 3
    ? {
        apiKey: 'AIzaSyAmIfokxcpt9pah1g9phk_rsXJkGVKhiE0',
        authDomain: 'crab-v2-testnet.firebaseapp.com',
        projectId: 'crab-v2-testnet',
        storageBucket: 'crab-v2-testnet.appspot.com',
        messagingSenderId: '694791446319',
        appId: '1:694791446319:web:6fc69622a67b9866e64bda',
        measurementId: 'G-WTFZNVKRCM',
      }
    : {
        apiKey: 'AIzaSyBiXQZR9st59josYl2d5Q7arPb1ZoXEAfw',
        authDomain: 'crab-v2-mainnet.firebaseapp.com',
        projectId: 'crab-v2-mainnet',
        storageBucket: 'crab-v2-mainnet.appspot.com',
        messagingSenderId: '1059693712092',
        appId: '1:1059693712092:web:af420f0f65b1d87ac51a19',
        measurementId: 'G-EWNE553DPB',
      }
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

io.on("connection", (socket) => {
  console.log("connection");

  onSnapshot(query(collection(db, 'auction'), where('clearingPrice', '==', '0')), (col) => {
    console.log("docChanges: ", col.docChanges());
    col.docChanges().forEach((docChange) => {
        // console.log("doc: ", docChange.doc)
        console.log("doc.data: ", docChange.doc.data())
        socket.emit("current_auction", docChange.doc.data())
    });
  });
});

httpServer.listen(port, () => {
    console.log(`WebSocket server started at port ${port}`)
});
