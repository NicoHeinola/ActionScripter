import os
from flask import Flask, jsonify
from dotenv import load_dotenv

from controllers.actions.action_controller import ActionController

# Load .env file
load_dotenv()

app = Flask(__name__)

action_controller: ActionController = ActionController(app)

if __name__ == '__main__':
    app.run(host=os.getenv("HOST"), port=os.getenv("PORT"), debug=True)
