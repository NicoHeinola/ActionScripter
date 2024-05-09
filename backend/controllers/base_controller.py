from abc import ABC, abstractmethod
from flask import Flask
from flask_socketio import SocketIO

from controllers.utils.hotkey_manager import HotkeyManager


class BaseController(ABC):
    def __init__(self, app: Flask, socket: SocketIO, hotkey_manager: HotkeyManager) -> None:
        self._app: Flask = app
        self._socket: SocketIO = socket
        self._hotkey_manager: HotkeyManager = hotkey_manager
        self._register_routes()

    @abstractmethod
    def _register_routes(self) -> None:
        pass
