from typing import List
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

            ActionScript.current_script.add_action(added_action)

            return make_response(added_action.serialize(), 200)

        @self._app.route(f"{base_route}/add", methods=["POST"])
        def add_new_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if not "actions" in data:
                return make_response({"error": "action param missing!"}, 400)

            index: int = -1
            if "index" in data:
                index = int(data["index"])

            action_datas: dict = data["actions"]

            new_actions = []

            # Add the actions
            for action_data in action_datas:
                action_data.pop("id")

                new_action: Action = ActionScript.current_script.create_action_with_type(action_data["type"])
                new_action.deserialize(action_data)
                new_actions.append(new_action.serialize())

                if index != -1:
                    ActionScript.current_script.add_action_at(new_action, index)
                else:
                    ActionScript.current_script.add_action(new_action)

            return make_response(new_actions, 200)

        @self._app.route(f"{base_route}/<action_id>", methods=["DELETE"])
        def delete_action(action_id: int):
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            ActionScript.current_script.remove_action(int(action_id))

            return make_response("", 200)

        @self._app.route(f"{base_route}/remove", methods=["POST"])
        def delete_actions():
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            data: dict = request.get_json()

            if "actions" not in data:
                return make_response({"error": "Missing actions!"}, 404)

            actions: list = data["actions"]

            for action_id in actions:
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

        @self._app.route(f"{base_route}/<action_id>", methods=["PUT"])
        def update_action(action_id):
            if ActionScript.current_script is None:
                return make_response({"error": "No current script found!"}, 500)

            updated_action_data: dict = request.get_json()
            action_id: int = updated_action_data["id"]
            actions: List[Action] = ActionScript.current_script.get_actions()

            for action in actions:
                if action._id != action_id:
                    continue

                action.deserialize(updated_action_data)

            return make_response("", 200)
