import os
from flask_socketio import SocketIO, emit
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS, cross_origin
from controllers.actions.action_controller import ActionController
from controllers.actions.action_script_controller import ActionScriptController

# Load .env file
load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

action_controller: ActionController = ActionController(app, socketio)
action_script_controller: ActionScriptController = ActionScriptController(app, socketio)

if __name__ == '__main__':
    socketio.run(app, host=os.getenv("HOST"), port=int(os.getenv("PORT")), debug=os.getenv("ENVIRONMENT") == "DEBUG")
