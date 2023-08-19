#!/usr/bin/env python

import asyncio
import websockets

FITBIT_HOST = "localhost"
FITBIT_PORT = 8080
#COMPUTER_HOST = "192.168.1.30"	# IP address when running on phone (for Fitbit watch connection)
COMPUTER_HOST = "192.168.1.26"	# IP address when running on computer (for Fitbit sim connection)
COMPUTER_PORT = 8081

server_tasks = set()
websocket_fitbit = None
websocket_computer = None

async def fitbit_handler(websocket):
	print("fitbit_handler")
	global websocket_fitbit
	websocket_fitbit = websocket
	async for message in websocket_fitbit:
		#print(f"Received: {message}")
		if websocket_computer != None and websocket_computer.open:
			#print("sending to computer")
			await websocket_computer.send(message)

async def computer_handler(websocket):
	print("computer_handler")
	global websocket_computer
	websocket_computer = websocket
	async for message in websocket_computer:
		#print(f"Received: {message}")
		if websocket_fitbit != None and websocket_fitbit.open:
			#print("sending to computer")
			await websocket_fitbit.send(message)

async def start_fitbit_server():
	print("before starting fitbit_handler")
	async with websockets.serve(fitbit_handler, FITBIT_HOST, FITBIT_PORT):
		print("after starting fitbit_handler")
		await asyncio.Future()

async def start_computer_server():
		print("before starting computer_handler")
		async with websockets.serve(computer_handler, COMPUTER_HOST, COMPUTER_PORT):
			print("after starting computer_handler")
			await asyncio.Future()

async def start_servers():
	fitbit_task = asyncio.create_task(start_fitbit_server())
	server_tasks.add(fitbit_task)
	computer_task = asyncio.create_task(start_computer_server())
	server_tasks.add(computer_task)
	await asyncio.Future()

asyncio.run(start_servers())

# TODO 3.3 test bidirectional
# TODO 9 file transfer and fetch, rather than messaging and websocket. Save files.