import os
from flask_migrate import Migrate
from flask_socketio import SocketIO, emit
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS, cross_origin
from controllers.actions.action_controller import ActionController
from controllers.actions.action_script_controller import ActionScriptController
from database.database import db

# Load .env file
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = '*AER*SAETGYSRYH*W¤&*S%¤*U%*#A'

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

migrate = Migrate(app, db)

db.init_app(app)


action_controller: ActionController = ActionController(app, socketio)
action_script_controller: ActionScriptController = ActionScriptController(app, socketio)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    socketio.run(app, host=os.getenv("HOST"), port=int(os.getenv("PORT")), debug=os.getenv("ENVIRONMENT") == "DEBUG")
