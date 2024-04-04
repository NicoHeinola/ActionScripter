from abc import ABC, abstractmethod

class BaseController(ABC):
    def __init__(self, app) -> None:
        self._app = app
        self._register_routes()

    @abstractmethod
    def _register_routes(self) -> None:
        pass
