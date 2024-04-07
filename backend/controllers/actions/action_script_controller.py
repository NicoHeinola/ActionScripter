from flask import make_response
from controllers.base_controller import BaseController
from scripter.action_script import ActionScript
from scripter.actions.action import Action


class ActionScriptController(BaseController):
    def _register_routes(self) -> None:
        base_route: str = "/action-script"

        @self._app.route(f"{base_route}", methods=["POST"])
        def create_new_action_script():
            new_script: ActionScript = ActionScript()

            # Reset the current id for new script
            Action.reset_current_id()

            return make_response("", 200)
