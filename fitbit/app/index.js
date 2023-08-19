import { Accelerometer } from "accelerometer"
import { me as appbit } from "appbit"
import { peerSocket } from "messaging"

const readingBuffer = new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT * 4)
const readingBufferView = new Float32Array(readingBuffer)

let timestampStart

appbit.appTimeoutEnabled = false

peerSocket.addEventListener("open", () => {
  console.log('peerSocket OPEN')
  // TODO 3.9 del sim test code
  readingBufferView[0] = 0
  readingBufferView[1] = 5
  readingBufferView[2] = 5
  readingBufferView[3] = 5
  setInterval(()=>{
    //if (peerSocket.readyState === peerSocket.OPEN) peerSocket.send(readingBuffer); else console.warn(`peerSocket not open (${peerSocket.readyState})`)
  }, 1000)
  //console.log(`bufferedAmount=${peerSocket.bufferedAmount}`)  // 17: byteLength of buffer + 1
})

peerSocket.addEventListener("close", evt => {
  console.warn(`peerSocket onclose ${evt}`)
})

peerSocket.addEventListener("error", evt => {
  console.warn(`peerSocket onerror ${evt}`)
})

peerSocket.addEventListener("message", evt => {
  console.warn(`peerSocket onmessage ${evt}`)
})

if (Accelerometer) {
  // sampling at 30 Hz (30 times per second)
  const accel = new Accelerometer({ frequency: 30 })
  accel.addEventListener("reading", () => {
    if (!timestampStart) timestampStart = accel.timestamp

    readingBufferView[0] = accel.timestamp - timestampStart
    readingBufferView[1] = accel.x
    readingBufferView[2] = accel.y
    readingBufferView[3] = accel.z

    if (peerSocket.readyState === peerSocket.OPEN) peerSocket.send(readingBuffer); else console.warn('peerSocket not open')
  })
  accel.start()
}

/*import('./peerSocket.js')
  .then(peer => {
    console.log(`peer.n=${peer.n}`)
  })*/

// TODO 3.2 watch: if messaging peerSocket closes or errors, try to reopen it. Try import(), launchApp(self) or launchApp(restarter). To close socket, leave connection unused and see if companion closes.
// TODO 3.5 watch: check bufferedAmount