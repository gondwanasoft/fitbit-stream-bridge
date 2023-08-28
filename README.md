# fitbit-stream-bridge
A demonstration of sending real-time data between Fitbit OS and a LAN client.

![Preview](https://raw.githubusercontent.com/gondwanasoft/fitbit-stream-bridge/main/stream-bridge.mp4 "Preview")

A phone-based server is used to relay the data. This avoids the need to use `wss` (`https`), which can be difficult to set up on a LAN.

This demonstration streams accelerometer data, which is probably the most demanding use case. The same architecture should be fine for streaming heart rate, step count, etc.
## Architecture
This project consists of three main components:
* `fitbit`. This is a Fitbit OS app comprising a device (watch) component and a companion (phone) component. Accelerometer data is passed from the device to the companion using messaging. The companion then acts as a websocket client and forwards each message to the `server` component.
* `server`. A websocket server (written in Python) is used to receive messages from the Fitbit companion and make them available to a client computer on the same LAN. (This component is actually *two* servers: one for `fitbit` and one for `client`.)
* `client`. An HTML+JavaScript document running within web browser on a computer on the LAN acts as a websocket client. It receives messages from the server and provides a graphical representation. Two sets of client files are provided in this repository: `client-pic` displays a moving vector on a picture of a watch, and `client-graph` displays a time-series chart.

Bidirectional communication is supported, so `client` can send messages to `fitbit` via `server`.

## Usage
### Installation and Configuration
#### Fitbit
* Download or clone the `fitbit` app’s files.
* In `companion/index.js`, Verify that `SERVER_URL` is appropriate to your phone. (The default should be fine on Android.)
* To generate artificial accelerometer data (*eg*, for use in Fitbit Simulator), set `FAKE_ACCEL` to `true`.
* Build the app (named `Stream Bridge`) using the Fitbit development CLI.
* Install the app onto a watch (see *Issues* below for use with the Fitbit Simulator).
#### Server
Install [pydroid 3](https://play.google.com/store/apps/details?id=ru.iiec.pydroid3) or some other Python 3.5+ execution environment. For iOS, [Pythonista 3](http://omz-software.com/pythonista/index.html) might work (untested).

In Python, install the `websockets` package; *eg*, `pip install websockets`.

In `stream-bridge.py`, set constants appropriate to your network:
* `SERVER_LOCAL_HOST` should be appropriate to your phone.
* `SERVER_LOCAL_PORT` should match the port specified in `companion/index.js`’s `SERVER_URL`.
* `SERVER_LAN_HOST` should be same IP specified in `client-stream.js`’s `SERVER_URL`.
* `SERVER_LAN_PORT` should be same port specified in `client-stream.js`’s `SERVER_URL`.

#### Client

In `client-stream.js`, set `SERVER_URL` appropriate to your network. The host and port specified should match `SERVER_LAN_HOST` and `SERVER_LAN_PORT` in `stream-bridge.py`.

### Start-up
* Using Python on your phone, run `stream-bridge.py`.
* In your computer’s web browser, load `client-pic.html` or `client-graph.html`.
* On your watch, run the `Stream Bridge` app.

If everything is working, the image displayed in the web browser should animate as the watch is moved.
## Issues
* The Fitbit messaging API may not reopen a closed connection, and it does not provide a way to request that the connection be reopened. When a messaging connection is closed, the app may need to be restarted.
* `peerSocket.bufferedAmount` should be monitored in the Fitbit component’s `app/index.js` and `companion/index.js` to ensure that the connection isn’t being overloaded.
* If you restart any component, websocket connection(s) may not automatically reopen. You may need to restart one or more of the other components.
* In this demonstration, binary messages are used for communication, because the watch-to-companion connection (in particular) can be slow. The `server` should forward messages without changing their content or format, so the use of text (string) messages should be possible (untested). However, doing so will probably reduce the frequency with which messages can be transferred.
* `stream-bridge.py` can be configured to run on the same computer as the Fitbit simulator. Be aware that the simulator doesn't simulate accelerometer data, so you’ll need to send other data.
* The use of Fitbit messaging and websockets is not appropriate if the goal is to save data to a file. Those protocols are best suited to real-time streaming; messages will be dropped if necessary.
* Fitbit’s accelerometer data includes gravity, so a reading of (0,0,0) would only be obtained if the watch were in free-fall.
* If streaming data at a high frequency, don’t try to log output in the Fitbit CLI for every message: you’ll flood the dev bridge.
## Acknowledgement
The `client-graph` files were developed by Barbara Kälin.