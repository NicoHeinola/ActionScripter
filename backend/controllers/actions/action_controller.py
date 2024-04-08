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

            added_action: Action = ActionScript.current_script.create_action_with_type(action_type)

            if added_action is None:
                return make_response({"error": f"Invalid action type: {action_type}"}, 400)

            return make_response(added_action.serialize(), 200)

        @self._app.route(f"{base_route}/<action_id>", methods=["DELETE"])
        def delete_action(action_id: int):
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            ActionScript.current_script.remove_action(int(action_id))

            return make_response("", 200)

        @self._app.route(f"{base_route}/overwrite", methods=["POST"])
        def set_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if "actions" not in data:
                return make_response({"error": "No action list provided!"}, 400)

            actions: list = data["actions"]

            ActionScript.current_script.set_actions_with_dict(actions)

            return make_response("", 200)

        @self._app.route(f"{base_route}/swap", methods=["POST"])
        def swap_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if "index-a" not in data or "index-b" not in data:
                return make_response({"error": "Index-a or index-b missing!"}, 400)

            index_a: int = data["index-a"]
            index_b: int = data["index-b"]

            ActionScript.current_script.swap_actions(index_a, index_b)

            return make_response("", 200)
