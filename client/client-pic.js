stream.onmessage = onMessage  // stream is defined in client-stream.js

function onMessage(t,x,y,z) {
  //console.log(`onMessage ${z}`)
  drawVector(x, y, z)

  // To test sending data from client to fitbit, return the z value:
  stream.send(z)
}

const xEl = document.getElementById('x')
const yEl = document.getElementById('y')
const zEl = document.getElementById('z')
const vEl = document.getElementById('v')
const originX = 460
const originY = 281

/*// Fake data for local testing:
let a = 0
setInterval(()=>{
  drawVector(Math.cos(a)*15, Math.sin(a)*15, Math.sin(a*1.5)*15)
  a += .02
}, 20)*/

function drawVector(x,y,z) {
  let screenCoord

  screenCoord = toScreen(0, y, 0)
  xEl.setAttribute('x1', screenCoord.x)
  xEl.setAttribute('y1', screenCoord.y)

  screenCoord = toScreen(x, y, 0)
  xEl.setAttribute('x2', screenCoord.x)
  xEl.setAttribute('y2', screenCoord.y)

  yEl.setAttribute('x2', screenCoord.x)
  yEl.setAttribute('y2', screenCoord.y)

  zEl.setAttribute('x1', screenCoord.x)
  zEl.setAttribute('y1', screenCoord.y)

  screenCoord = toScreen(x, 0, 0)
  yEl.setAttribute('x1', screenCoord.x)
  yEl.setAttribute('y1', screenCoord.y)

  screenCoord = toScreen(x, y, 0)
  yEl.setAttribute('x2', screenCoord.x)
  yEl.setAttribute('y2', screenCoord.y)

  screenCoord = toScreen(x, y, z)
  zEl.setAttribute('x2', screenCoord.x)
  zEl.setAttribute('y2', screenCoord.y)

  vEl.setAttribute('x2', screenCoord.x)
  vEl.setAttribute('y2', screenCoord.y)
}

function toScreen(x,y,z) {
  // Convert 3D (x,y,z) to screen {x:x, y:y}.
  return({x:originX + x / 10 * 89 * .9 + y / 10 * -36 * .9 + z * 6, y:originY + x / 10 * -12 * .9 + y / 10 * -149 * .9 + z * -3.5})
}