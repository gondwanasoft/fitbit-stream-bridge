import * as messaging from "messaging"

const WEBSOCKET_STATES = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']
const SERVER_URL = "ws://127.0.0.1:8080"
// 127.0.0.1 indicates the companion device, and is the only URL we can use without SSL (at least on Android).
// 8080 is a port that's commonly used for WebSockets.
let websocket
let dateStart = Date.now()

openMessaging()

openWebsocket()

function openMessaging() {
   messaging.peerSocket.addEventListener("message", onWatchMessage)
}

function onWatchMessage(evt) {
   // Unfortunately, the API unpacks the data into an Object rather than a binary array.
   //console.log(`data type=${typeof evt.data} len=${evt.data.length} ${JSON.stringify(evt.data)}`)
   const values = Object.values(evt.data)
   //console.log(`${JSON.stringify(values)}`)
   const buffer = new ArrayBuffer(values.length)
   const byteView = new Uint8Array(buffer)
   for (let i=0; i<values.length; i++) byteView[i] = values[i]
   //const floatView = new Float32Array(buffer); console.log(`floatView=${floatView}`)   // prints the four floats

   // Send to server:
   if (websocket.readyState !== websocket.OPEN) {  // data will be dropped (ie, not sent)
      console.warn(`Couldn't send to server: state=${WEBSOCKET_STATES[websocket.readyState]}`)
      if (websocket.readyState === websocket.CLOSED) openWebsocket()
      return
   }
   //console.log('sending')
   websocket.send(buffer)

   //const view = new Float32Array(evt.data)
   //console.log(`view=${view[0]}`)
   //const blob = new Blob(data, {type: "application/octet-stream"})
   //console.log(`blob.size=${blob.size}`)
   //sendToServer(evt.data)
}

function openWebsocket() {
   console.log('openWebsocket');
   if (websocket) {
      websocket.removeEventListener("open", onOpen);
      websocket.removeEventListener("close", onClose);
      websocket.removeEventListener("message", onMessage);
      websocket.removeEventListener("error", onError);
      websocket.close()
   }

   websocket = new WebSocket(SERVER_URL);
   websocket.binaryType = 'arraybuffer'
   websocket.addEventListener("open", onOpen);
   websocket.addEventListener("close", onClose);
   websocket.addEventListener("message", onMessage);
   websocket.addEventListener("error", onError);
}

function sendToServer(data) {
   if (websocket.readyState !== websocket.OPEN) {  // data will be dropped (ie, not sent)
      console.warn(`Couldn't send: state=${WEBSOCKET_STATES[websocket.readyState]}`)
      if (websocket.readyState === websocket.CLOSED) openWebsocket()
      return
   }

   //console.log(`data ${typeof data} len = ${data.length} ${JSON.stringify(data)}`)
   const blob = new Blob(data, {type: "application/octet-stream"})
   //console.log(`blob.size=${blob.size}`)
   blob.arrayBuffer()
      .then(buffer=>{
         websocket.send(buffer)
      })

   //const buffer = new ArrayBuffer(data.length)
   //websocket.send(buffer)
}

//setInterval(() => {console.log(`state=${WEBSOCKET_STATES[websocket.readyState]}`)}, 1000)
/*setInterval(() => {
   if (websocket.readyState !== websocket.OPEN) {
      console.warn(`Couldn't send: state=${WEBSOCKET_STATES[websocket.readyState]}`)
      return
   }
   const buffer = new ArrayBuffer(8)
   const view = new Float32Array(buffer)
   view[0] = Date.now() - dateStart
   view[1] = 129
   websocket.send(buffer)
   console.log(`bin=${websocket.binaryType}`);
}, 2000)*/

//setInterval(() => {if (websocket.readyState === websocket.CLOSED) openWebsocket()}, 5000)

//websocket.send('hello.')
function onOpen(evt) {
   console.log("CONNECTED")
}

function onClose() {
   console.warn("websocket disconnected")
}

function onMessage(evt) {
   const view = new Float32Array(evt.data)
   //console.log(`websocket rx: ${view[0]}`)
   // We could use messaging to send data to watch.
}

function onError() {
   console.error(`websocket error`)
}

// TODO 3.2 companion: if messaging peerSocket closes or errors, try to reopen it. Try import()
// TODO 3.5 companion: track bufferedAmount