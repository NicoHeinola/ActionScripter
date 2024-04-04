from flask import make_response
from controllers.base_controller import BaseController


class ActionController(BaseController):
    def _register_routes(self) -> None:
        base_route: str = "/action"

        @self._app.route(f"{base_route}", methods=["POST"])
        def create_new_action(action_data: dict):
            print("Got request!", action_data)

            return make_response("", 200)