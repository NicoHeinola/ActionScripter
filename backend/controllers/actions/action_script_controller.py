from datetime import datetime
import json
import os
from threading import Thread
import time
from typing import List
from flask import jsonify, make_response, request
from controllers.base_controller import BaseController
from models.recent_script_model import RecentScript
from scripter.action_script import ActionScript
from scripter.actions.action import Action
from flask_socketio import emit
from database.database import db


class ActionScriptController(BaseController):
    def _register_routes(self) -> None:
        base_route: str = "/action-script"

        @self._app.route(f"{base_route}", methods=["GET"])
        def get_current_script():
            if ActionScript.current_script is None:
                create_new_action_script()

            return make_response(ActionScript.current_script.serialize(False), 200)

        @self._app.route(f"{base_route}/serialize", methods=["GET"])
        def get_serialized_current_script():
            if ActionScript.current_script is None:
                return make_response({"error": "There is no script to serialize!"}, 500)

            return make_response(ActionScript.current_script.serialize(True), 200)

        @self._app.route(f"{base_route}", methods=["POST"])
        def create_new_action_script():
            if ActionScript.current_script is not None:
                # We want to stop the script if it is playing
                ActionScript.current_script.stop()

            new_script: ActionScript = ActionScript()
            new_script.on("performed-action", lambda current_action_index: self._socket.emit("performed-action", current_action_index))
            new_script.on("finished-actions", lambda: self._socket.emit("finished-actions"))

            # Reset the current id for new script
            Action.reset_current_id()

            return make_response("", 200)

        @self._app.route(f"{base_route}", methods=["PUT"])
        def update_current_script():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            ActionScript.current_script.deserialize(data)

            return make_response("", 200)

        @self._app.route(f"{base_route}/start", methods=["POST"])
        def start_action_script():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            ActionScript.current_script.start_socket_thread(self._socket)

            return make_response("", 200)

        @self._app.route(f"{base_route}/pause", methods=["POST"])
        def pause_action_script():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            ActionScript.current_script.pause()

            return make_response("", 200)

        @self._app.route(f"{base_route}/stop", methods=["POST"])
        def stop_action_script():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            ActionScript.current_script.stop()

            return make_response("", 200)

        @self._app.route(f"{base_route}/recent", methods=["POST"])
        def new_recent_action_script():
            data: dict = request.get_json()

            if "path" not in data:
                return make_response({"error": "Missing path!"}, 400)

            path: str = data["path"].replace("\\", "/")

            if ActionScript.current_script is not None:
                ActionScript.current_script._latest_save_path = path

            recent_script: RecentScript = RecentScript.query.filter_by(path=path).first()

            if recent_script is not None:
                recent_script.updated_at = datetime.now()
            else:
                recent_script = RecentScript()
                recent_script.path = path

            db.session.add(recent_script)
            db.session.commit()

            return make_response("", 200)

        @self._app.route(f"{base_route}/recent", methods=["GET"])
        def get_recent_action_scripts():
            clean_recent_action_scripts()
            recent_scripts: List[RecentScript] = RecentScript.query.order_by(RecentScript.updated_at.desc()).limit(20).all()
            return make_response(jsonify([recent_script.serialize for recent_script in recent_scripts]), 200)

        @self._app.route(f"{base_route}/clean", methods=["POST"])
        def clean_recent_action_scripts():
            """
            Simply removes non-existing recent action scripts
            """

            recent_scripts: List[RecentScript] = RecentScript.query.order_by(RecentScript.updated_at.desc()).limit(20).all()
            for recent_script in recent_scripts:
                if os.path.exists(recent_script.path):
                    continue

                db.session.delete(recent_script)

            db.session.commit()

            return make_response("", 200)

        @self._app.route(f"{base_route}/save-as", methods=["POST"])
        def save_as():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            ActionScript.current_script.save_as()

            path: str = ActionScript.current_script._latest_save_path
            recent_script: RecentScript = RecentScript.query.filter_by(path=path).first()

            if recent_script is not None:
                recent_script.updated_at = datetime.now()
            else:
                recent_script = RecentScript()
                recent_script.path = path

            db.session.add(recent_script)
            db.session.commit()

            return make_response({"save-path": ActionScript.current_script._latest_save_path}, 200)

        @self._app.route(f"{base_route}/save", methods=["POST"])
        def save():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            if not os.path.exists(ActionScript.current_script._latest_save_path):
                return save_as()

            ActionScript.current_script.save()

            path: str = ActionScript.current_script._latest_save_path
            recent_script: RecentScript = RecentScript.query.filter_by(path=path).first()

            if recent_script is not None:
                recent_script.updated_at = datetime.now()
            else:
                recent_script = RecentScript()
                recent_script.path = path

            db.session.add(recent_script)
            db.session.commit()

            return make_response({"save-path": ActionScript.current_script._latest_save_path}, 200)

        @self._app.route(f"{base_route}/load", methods=["POST"])
        def load():
            data: dict = request.get_json()

            if "path" not in data:
                return make_response({"error": "Missing path!"}, 400)
            path: str = data["path"]

            if not os.path.exists(path):
                return make_response({"error": "Path doesn't exist!"}, 400)

            action_script: ActionScript = None
            if ActionScript.current_script is not None:
                # If action script already exists, we can simply use the existing one
                action_script = ActionScript.current_script
            else:
                # If action script doesn't exist, create one
                create_new_action_script()
                action_script = ActionScript.current_script

            # Set the save location
            action_script._latest_save_path = path

            # Load json data and deserialize the action script with it
            with open(path, "r") as file:
                file_data_json = json.load(file)
                action_script.deserialize(file_data_json)

            return make_response(action_script.serialize(True), 200)
