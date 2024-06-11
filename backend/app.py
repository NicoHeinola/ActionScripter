import os
import sys
from flask_migrate import Migrate, upgrade, stamp
from flask_socketio import SocketIO
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from controllers.actions.action_script_controller import ActionScriptController
from controllers.app.app_controller import AppController
from controllers.settings.setting_controller import SettingController
from controllers.utils.hotkey_manager import HotkeyManager
from controllers.utils.util_controller import UtilController
from database.database import db
import socket


def database_exists(app: Flask):
    db_path: str = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
    return os.path.exists(db_path)


def is_port_in_use(host: str, port: int):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
        except socket.error:
            return True
        return False


if __name__ == '__main__':
    # Load .env file
    BASEDIR: str = os.path.abspath(os.path.dirname(__file__))
    load_dotenv(os.path.join(BASEDIR, ".env"))

    port: int = int(os.getenv("PORT"))
    host: str = os.getenv("HOST")

    # If port is in use, quit
    if is_port_in_use(host, port):
        print("Port is already in use!")
        sys.exit(-1)

    # If we are running release build, open the frontend
    if os.getenv("BUILD_MODE") == "RELEASE":
        os.startfile(os.path.join(os.getcwd(), "frontend", "ActionScripter.exe"))

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SECRET_KEY'] = '*AER*SAETGYSRYH*W¤&*S%¤*U%*#A'

    socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")
    CORS(app)

    migrate = Migrate(app, db)

    db.init_app(app)

    with app.app_context():
        db_exists: bool = database_exists(app)

        # Create database tables for our data models if they don't exist
        db.create_all()

        if not db_exists:
            # Mark the database as up-to-date with the migrations
            stamp()

        # Apply the latest migrations if the database already exists
        upgrade()

    hotkey_manager: HotkeyManager = HotkeyManager(app, socketio)

    action_script_controller: ActionScriptController = ActionScriptController(app, socketio, hotkey_manager)
    util_controller: UtilController = UtilController(app, socketio, hotkey_manager)
    setting_controller: SettingController = SettingController(app, socketio, hotkey_manager)
    app_controller: AppController = AppController(app, socketio, hotkey_manager)

    socketio.run(app, host=host, port=port, debug=os.getenv("BUILD_MODE") == "DEBUG")
    hotkey_manager.stop_listening_to_keys()
