# fitbit-stream-bridge
A demonstration of sending real-time data between Fitbit OS and a LAN client.

A phone-based server is used to relay the data. This avoids the need to use `wss` (`https`), which can be difficult to set up on a LAN.
## Architecture
This project consists of three main components:
* `fitbit`. This is a Fitbit OS app comprising a device (watch) component and a companion (phone) component. For demonstration purposes, accelerometer data is passed from the device to the companion using messaging (for real-time performance). The companion forwards each message to the server using a websocket.
* `server`. A websocket server (written in Python) is used to receive messages from the Fitbit companion and make them available to a client computer on the same LAN.
* `client`. An HTML+JavaScript document running within web browser on a computer on the LAN acts as a websocket client. It receives messages from the server and provides a graphical representation.
## Usage
### Installation
#### Fitbit
Build and install the `fitbit` app using the Fitbit development CLI. The app should run on a watch rather than the Fitbit Simulator since the latter doesn't provide accelerometer data (although other data could be used).
#### Server
Install [pydroid 3](https://play.google.com/store/apps/details?id=ru.iiec.pydroid3) or some other Python 3.5+ execution environment. For iOS, [Pythonista 3](http://omz-software.com/pythonista/index.html) might work (untested).

In Python, install the `websockets` package; *eg*, `pip install websockets`.

Load the file `server/stream-bridge.py`.

In `stream-bridge.py`, set constants appropriate to your network:

* `COMPUTER_HOST` should be same IP as `client.html`’s `SERVER_TO_COMPUTER_URL`.

#### Client

In `client.html`, set constants appropriate to your network.

### Start-up
In Pydroid3, run `stream-bridge.py`.
On computer web browser, load `client.html`.
On watch, run `Stream Bridge`.
## Issues
The Fitbit messaging API may not reopen a closed connection, and it does not provide a way to request that the connection be reopened. When a messaging connection is closed, the app must be restarted.