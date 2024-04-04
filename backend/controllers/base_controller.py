class BaseController:
    def __init__(self, app) -> None:
        self._app = app
        self._register_routes()

    def _register_routes(self):
        pass
