from datetime import datetime
import json
import os
from typing import List
from flask import jsonify, make_response, request
from controllers.base_controller import BaseController
from models.recent_script_model import RecentScript
from models.setting_model import Setting
from scripter.action_group import ActionGroup
from scripter.action_script import ActionScript
from scripter.actions.action import Action
from database.database import db
from scripter.actions.action_helper import ActionHelper
from utils.sleep import socket_supported_sleep


class ActionScriptController(BaseController):
    def _register_routes(self) -> None:
        base_route: str = "/action-script"

        @self._app.route(f"{base_route}", methods=["GET"])
        def get_current_script():
            if ActionScript.current_script is None:
                create_new_action_script()

            return make_response(ActionScript.current_script.serialize(), 200)

        @self._app.route(f"{base_route}", methods=["POST"])
        def create_new_action_script():
            if ActionScript.current_script is not None:
                # We want to stop the script if it is playing
                ActionScript.current_script.stop()

            # Reset the current id for new script
            Action.reset_current_id()
            ActionGroup.reset_global_id_count()

            new_script: ActionScript = ActionScript()

            # Set hotkeys of the script
            start_hotkey: str = Setting.query.filter_by(name="start-script").first().value
            start_hotkey_display: str = Setting.query.filter_by(name="start-script-display").first().value
            stop_hotkey: str = Setting.query.filter_by(name="stop-script").first().value
            stop_hotkey_display: str = Setting.query.filter_by(name="stop-script-display").first().value

            new_script.set_hotkey("start-script", start_hotkey, start_hotkey_display)
            new_script.set_hotkey("stop-script", stop_hotkey, stop_hotkey_display)

            new_script.on("performed-action", lambda current_action_index: self._socket.emit("performed-action", current_action_index))
            new_script.on("finished-actions", lambda: self._socket.emit("finished-actions"))

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

            data = request.get_json()

            if not "group-id" in data:
                return make_response({"error": "'group-id' param missing!"}, 400)

            group_id: int = int(data["group-id"])

            self._socket.start_background_task(target=lambda: ActionScript.current_script.start(group_id, lambda a, b=None: socket_supported_sleep(self._socket, a, b)))

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

            saved_path = ActionScript.current_script.save_as()

            if saved_path is None:
                return make_response({"save-path": ""}, 200)

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

            return make_response(action_script.serialize(), 200)

        @self._app.route(f"{base_route}/undo", methods=["POST"])
        def undo():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if not "group-id" in data:
                return make_response({"error": "'group-id' param missing!"}, 400)

            group_id: int = int(data["group-id"])

            changes: List[dict] = ActionScript.current_script.undo_history(group_id)

            return make_response(changes, 200)

        @self._app.route(f"{base_route}/redo", methods=["POST"])
        def redo():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if not "group-id" in data:
                return make_response({"error": "'group-id' param missing!"}, 400)

            group_id: int = int(data["group-id"])

            changes: List[dict] = ActionScript.current_script.redo_history(group_id)

            return make_response(changes, 200)

        @self._app.route(f"{base_route}/create-new-action", methods=["POST"])
        def create_new_action():
            data: dict = request.get_json()

            if not "action-type" in data:
                return make_response({"error": "action-type param missing!"}, 400)

            if not "group-id" in data:
                return make_response({"error": "'group-id' param missing!"}, 400)

            group_id: int = int(data["group-id"])
            action_type: str = data["action-type"]

            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            added_action: Action = ActionHelper.create_action_with_type(action_type)

            if added_action is None:
                return make_response({"error": f"Invalid action type: {action_type}"}, 400)

            ActionScript.current_script.add_action(group_id, added_action)

            return make_response(added_action.serialize(), 200)

        @self._app.route(f"{base_route}/add-new-actions", methods=["POST"])
        def add_new_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if not "actions" in data:
                return make_response({"error": "'actions' param missing!"}, 400)

            if not "group-id" in data:
                return make_response({"error": "'group-id' param missing!"}, 400)

            group_id: int = int(data["group-id"])

            index: int = -1
            if "index" in data:
                index = int(data["index"])

            action_datas: dict = data["actions"]

            new_actions = []

            # Add the actions
            for action_data in action_datas:
                action_data.pop("id")

                new_action: Action = ActionHelper.create_action_with_type(action_data["type"])
                new_action.deserialize(action_data)
                new_actions.append(new_action.serialize())

                if index != -1:
                    ActionScript.current_script.add_action_at(group_id, new_action, index)
                else:
                    ActionScript.current_script.add_action(group_id, new_action)

            return make_response(new_actions, 200)

        @self._app.route(f"{base_route}/remove-actions", methods=["POST"])
        def delete_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if "actions" not in data:
                return make_response({"error": "Missing actions!"}, 404)

            if "group-id" not in data:
                return make_response({"error": "Missing group id!"}, 404)

            group_id: int = int(data["group-id"])
            actions: list = data["actions"]

            for action_id in actions:
                ActionScript.current_script.remove_action(group_id, int(action_id))

            return make_response("", 200)

        @self._app.route(f"{base_route}/overwrite-actions", methods=["POST"])
        def set_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if "actions" not in data:
                return make_response({"error": "No action list provided!"}, 400)

            if "group-id" not in data:
                return make_response({"error": "Missing group id!"}, 404)

            group_id: int = int(data["group-id"])
            actions: list = data["actions"]

            ActionScript.current_script.set_actions_with_dict(group_id, actions)

            return make_response("", 200)

        @self._app.route(f"{base_route}/swap-two-actions", methods=["POST"])
        def swap_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if "index-a" not in data:
                return make_response({"error": "Index-a is missing!"}, 400)

            if "index-b" not in data:
                return make_response({"error": "Index-b is missing!"}, 400)

            if "group-id" not in data:
                return make_response({"error": "Missing group id!"}, 404)

            group_id: int = int(data["group-id"])
            index_a: int = data["index-a"]
            index_b: int = data["index-b"]

            ActionScript.current_script.swap_actions(group_id, index_a, index_b)

            return make_response("", 200)

        @self._app.route(f"{base_route}/update-action", methods=["PUT"])
        def update_action():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data = request.get_json()

            if "action" not in data:
                return make_response({"error": "No action list provided!"}, 400)

            if "group-id" not in data:
                return make_response({"error": "Missing group id!"}, 404)

            group_id: int = int(data["group-id"])
            action: dict = data["action"]

            ActionScript.current_script.update_actions(group_id, [action])

            return make_response("", 200)

        @self._app.route(f"{base_route}/action-group", methods=["POST"])
        def add_action_group():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            new_action_group = ActionGroup()
            ActionScript.current_script.add_action_group(new_action_group)
            return make_response(new_action_group.serialize(), 200)

        @self._app.route(f"{base_route}/action-group", methods=["PUT"])
        def update_action_group():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if "group-data" not in data:
                return make_response({"error": "'group-data' param missing!"}, 500)

            if "group-id" not in data:
                return make_response({"error": "'group-id' param missing!"}, 500)

            group_id: int = int(data["group-id"])
            group_data: dict = data["group-data"]

            ActionScript.current_script.update_action_group(group_id, group_data)

            return make_response("", 200)

        @self._app.route(f"{base_route}/action-group/<group_id>", methods=["DELETE"])
        def remove_action_group(group_id):
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            removed_group = ActionScript.current_script.remove_action_group(int(group_id))

            if removed_group is None:
                return make_response({"error": f"Couldn't find group with id '{group_id}'!"}, 500)

            return make_response(removed_group.serialize(), 200)

        @self._app.route(f"{base_route}/action-group/select/<group_id>", methods=["POST"])
        def update_latest_selected_group_id(group_id):
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            if group_id is None:
                return make_response({"error": "Missing 'group_id'"}, 500)

            ActionScript.current_script.set_latest_selected_group_id(int(group_id))

            return make_response("", 200)
