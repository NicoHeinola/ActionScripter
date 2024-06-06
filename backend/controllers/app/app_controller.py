import os
import signal
from flask import make_response
from controllers.base_controller import BaseController


class AppController(BaseController):
    def _register_routes(self) -> None:
        base_route: str = "/app"

        @self._app.route(f"{base_route}/quit", methods=["POST"])
        def quit():
            pid = os.getpid()
            os.kill(pid, signal.SIGINT)
            return make_response("", 200)
