from flask import make_response, request
from controllers.base_controller import BaseController
from scripter.action_script import ActionScript
from scripter.actions.action import Action


class ActionController(BaseController):
    def _register_routes(self) -> None:
        base_route: str = "/action"

        @self._app.route(f"{base_route}", methods=["POST"])
        def create_new_action():
            data: dict = request.get_json()

            if not "action-type" in data:
                return make_response({"error": "action-type param missing!"}, 400)

            action_type: str = data["action-type"]

            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            added_action: Action = ActionScript.current_script.add_action(action_type)

            if added_action is None:
                return make_response({"error": f"Invalid action type: {action_type}"}, 400)

            return make_response(added_action.serialize(), 200)

        @self._app.route(f"{base_route}/<action_id>", methods=["DELETE"])
        def delete_action(action_id):
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            ActionScript.current_script.remove_action(action_id)

            return make_response("", 200)
