import * as messaging from "messaging"

const WEBSOCKET_STATES = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']
const SERVER_URL = "ws://127.0.0.1:8080"
// 127.0.0.1 indicates the companion device, and is the only URL we can use without SSL (at least on Android).
// 8080 is a port that's commonly used for WebSockets.
let websocket

openMessaging()

openWebsocket()

function openMessaging() {
   messaging.peerSocket.addEventListener("message", onWatchMessage)
}

function onWatchMessage(evt) {
   // Unfortunately, the Fitbit API unpacks the data into an Object rather than a binary array. We need to repack it.
   //console.log(`data type=${typeof evt.data} len=${evt.data.length} ${JSON.stringify(evt.data)}`)
   const values = Object.values(evt.data)
   //console.log(`${JSON.stringify(values)}`)
   const buffer = new ArrayBuffer(values.length)
   const byteView = new Uint8Array(buffer)
   for (let i=0; i<values.length; i++) byteView[i] = values[i]
   //const floatView = new Float32Array(buffer); console.log(`floatView=${floatView}`)   // prints the four floats

   // Send to server:
   if (websocket.readyState !== websocket.OPEN) {  // data will be dropped (ie, not sent)
      //console.warn(`Couldn't send to server: state=${WEBSOCKET_STATES[websocket.readyState]}`)
      if (websocket.readyState === websocket.CLOSED) openWebsocket()
      return
   }
   //console.log('sending')
   websocket.send(buffer)
}

function openWebsocket() {
   // Remove listeners from any previous WebSocket, instantiate a new one, and add listeners.
   // Instantiating a new WebSocket causes it to try to open; there seems to be no way to get a pre-existing WebSocket to reopen.
   //console.log('openWebsocket');
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

//setInterval(() => {console.log(`state=${WEBSOCKET_STATES[websocket.readyState]}`)}, 1000)
//setInterval(() => {if (websocket.readyState === websocket.CLOSED) openWebsocket()}, 5000)

function onOpen(evt) {
   console.log("websocket opened")
}

function onClose() {
   console.warn("websocket closed")
}

function onMessage(evt) {
   const view = new Float32Array(evt.data)
   //console.log(`websocket received: ${view[0]}`)
   // We could use messaging to send data to watch.
}

function onError() {
   console.error(`websocket error`)
}