import * as dotenv from 'dotenv' 
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, onSnapshot, where, doc, DocumentData, getDocs, DocumentChange } from "firebase/firestore";

const express = require('express')

dotenv.config()

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

io.on("connection", async (socket) => {
  // Emit all past auctions on all_auctions channel
  const allAuctionsQuery = query(collection(db, 'auction'), where('auctionEnd', '<', Date.now()))
  onSnapshot(allAuctionsQuery, {includeMetadataChanges: false}, (snapshot) => {
    const allPastAuctions: DocumentData[] = [];
    const docChanges: DocumentChange<DocumentData>[] = snapshot.docChanges()
    for(let i=0; i < docChanges.length; i++) {
      allPastAuctions.push(docChanges[i].doc.data())
    }
    socket.emit("all_auctions", allPastAuctions);
  })

  // listen to modified auctions(when submitting new bids, updating auction details...etc)
  // or removed one
  // or new auctions
  const currentAuctionsChanges : DocumentData[] = [];
  const currentAuctionsQuery = query(collection(db, 'auction'), where('auctionEnd', '>=', Date.now()))
  onSnapshot(currentAuctionsQuery, {includeMetadataChanges: false}, (snapshot) => {
    const docChanges: DocumentChange<DocumentData>[] = snapshot.docChanges()
    for(let i=0; i < docChanges.length; i++) {
      if((docChanges[i].type == 'modified') || (docChanges[i].type == 'removed')) {
        // if auction doc is modified or removed, find its index and update it
        // aictionIndex should always be != -1 as this doc is modified or removed
        let auctionIndex = currentAuctionsChanges.findIndex((auctionChanges) => {
          return auctionChanges.currenAuctionId == (docChanges[i].doc.data()).currenAuctionId
        })
        if(docChanges[i].type == 'modified') {
          currentAuctionsChanges[auctionIndex] = docChanges[i].doc.data();
        } else {
          currentAuctionsChanges.splice(auctionIndex, 1)
        }
      }
      else {
        // push if auction si new
        currentAuctionsChanges.push(docChanges[i].doc.data())
      }
    };
    socket.emit("current_auction", currentAuctionsChanges)
  });    
});

httpServer.listen(port, () => {
    console.log(`WebSocket server started at port ${port}`)
});
