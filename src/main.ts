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

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
  customHeaders: {
    "Authorization": "Bearer owner"
  }
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
