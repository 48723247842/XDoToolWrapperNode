from simple_websocket_server import WebSocketServer, WebSocket
import json

class SimpleEcho( WebSocket ):
	def handle( self ):
		# echo message back to client
		decoded = json.loads( self.data )
		print( decoded )
		if "message" in decoded:
			if decoded[ "message" ] == "mouse_inside_video_window":
				self.send_message( json.dumps( { "message": "manual_get_time" } ) )
			elif decoded[ "message" ] == "agent_ready":
				print( "Now is the time to move mouse to center of monitor" )

	def connected(self):
		print(self.address, 'connected')

	def handle_close(self):
		print(self.address, 'closed')


server = WebSocketServer( '' , 10081 , SimpleEcho )
server.serve_forever()