from threading import Thread
import time
from flask import make_response, request
from controllers.base_controller import BaseController
from scripter.action_script import ActionScript
from scripter.actions.action import Action
from flask_socketio import emit


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
