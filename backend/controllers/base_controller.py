from abc import ABC, abstractmethod
from flask import Flask
from flask_socketio import SocketIO


class BaseController(ABC):
    def __init__(self, app, socket) -> None:
        self._app: Flask = app
        self._socket: SocketIO = socket
        self._register_routes()

    @abstractmethod
    def _register_routes(self) -> None:
        pass
