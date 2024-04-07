import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from controllers.actions.action_controller import ActionController
from controllers.actions.action_script_controller import ActionScriptController

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

action_controller: ActionController = ActionController(app)
action_script_controller: ActionScriptController = ActionScriptController(app)

if __name__ == '__main__':
    app.run(host=os.getenv("HOST"), port=os.getenv("PORT"), debug=True)
