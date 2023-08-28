import { Accelerometer } from "accelerometer"
import { me as appbit } from "appbit"
import { peerSocket } from "messaging"

const FAKE_ACCEL = false     // send artificial data instead of accel readings to test stream-bridge and/or client code
const readingBuffer = new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT * 4)
const readingBufferView = new Float32Array(readingBuffer)

let timestampStart

appbit.appTimeoutEnabled = false

peerSocket.addEventListener("open", () => {
  console.log('peerSocket OPEN')

  if (FAKE_ACCEL) {
    let t = 0
    setInterval(()=>{
      readingBufferView[0] = t
      readingBufferView[1] = 10 * Math.cos(t/10)
      readingBufferView[2] = 10 * Math.cos(t/5)
      readingBufferView[3] = 10 * Math.sin(t/5)
      t++
      if (peerSocket.readyState === peerSocket.OPEN) peerSocket.send(readingBuffer); else console.warn(`peerSocket not open (${peerSocket.readyState})`)
    }, 20)  // 50 Hz
    //console.log(`bufferedAmount=${peerSocket.bufferedAmount}`)  // 17: byteLength of buffer + 1. This proves(?) message is binary.
  }
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
  console.log(`acc=${accel}`)
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

// TODO 3.2 watch: if messaging peerSocket closes or errors, try to reopen it...
// Try import(), launchApp(self) or launchApp(restarter). To close socket, leave connection unused and see if companion closes, or restart Fitbit app, or take watch out of range...
// May need to do this in companion as well.
/*// A possible alternative way of getting peerSocket, which might be restartable if peerSocket closes and doesn't reopen:
  import('./peerSocket.js')
  .then(peer => {
    console.log(`peer.n=${peer.n}`)
    // TODO: a miracle occurs here.
  })*/
