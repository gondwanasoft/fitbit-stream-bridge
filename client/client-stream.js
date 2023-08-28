// Constructs a stream object that encapsulates the WebSocket connection to the server.
// Incoming messages are assumed to contain four Float32 values: [timestamp, x, y z].

const constructStream = () => {   // This is a closure, so we can protect private properties.
  // PRIVATE PROPERTIES:

  const SERVER_URL = 'ws://192.168.1.30:8081' // phone
  //const SERVER_URL = 'ws://192.168.1.26:8081' // computer

  let connection      // WebSocket object
  openConnection()

  function openConnection() {
    connection = new WebSocket(SERVER_URL)
    connection.onopen = onConnectionOpen
    connection.onmessage = onConnectionMessage
    connection.onclose = onConnectionClose
    connection.onerror = onConnectionError
  }

  function onConnectionOpen() {
    console.log('client: connection open')
  }

  function onConnectionMessage(event) {
    //console.log(`client: connection message: ${event.data}`);
    event.data.arrayBuffer()
      .then(buffer => {
        //console.log(`len=${buffer.byteLength}`)
        const view = new Float32Array(buffer)
        //console.log(`${view[0]} ${view[1]} ${view[2]} ${view[3]}`)
        if (interface.onmessage) interface.onmessage(view[0], view[1], view[2], view[3])
      })
  }

  function onConnectionClose() {
    console.error(`desktop: connection closed: check server is running at ${SERVER_URL}`)
  }

  function onConnectionError() {
    console.error(`desktop: connection error: check server is running at ${SERVER_URL}`)
  }

  function sendNumber(val) {
    const view = new Float32Array([val])
    connection.send(view)
  }

  // PUBLIC PROPERTIES (INTERFACE):

  const interface = {
    onmessage: undefined,   // set onmessage to a listener function that will receive [timestamp,x,y,z]
    send: sendNumber        // send a Number to the WebSocket
  }

  return interface
}

const stream = constructStream()