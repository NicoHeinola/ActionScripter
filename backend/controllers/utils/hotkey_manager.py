from typing import List
from flask import Flask
from flask_socketio import SocketIO
import keyboard

from models.setting_model import Setting
from scripter.action_script import ActionScript
from utils.sleep import socket_supported_sleep


class HotkeyManager:
    def __init__(self, app: Flask, socketio: SocketIO) -> None:
        self._app = app
        self._socket: SocketIO = socketio
        self._pressed_keys: dict = {}
        self._pressed_changed: bool = False
        self._is_user_listening_to_keybinds: bool = False

        # Holds functions that need to be ran in a socket thread
        self._hotkey_functions_to_run: list = []
        self._is_running: bool = False

        @self._socket.on('connect')
        def on_connect():
            self.hotkey_listening_check()

        @self._socket.on('listening-for-keybinds')
        def on_listening_for_keybinds_change(is_listening: bool):
            self._is_user_listening_to_keybinds = is_listening

    def on_key_event(self, event) -> None:
        if event.event_type == keyboard.KEY_DOWN:
            scan_code = str(event.scan_code)
            self._pressed_keys[scan_code] = event.name

            # We don't want to check for key-combinations when user is trying to listen for the keypresses this sends
            if not self._is_user_listening_to_keybinds:
                self.hotkey_check()
        elif event.event_type == keyboard.KEY_UP:
            scan_code = str(event.scan_code)
            self._pressed_keys.pop(scan_code)

        self._pressed_changed = True

    def hotkey_check(self) -> None:
        """
        Checks if user is pressing any key-combinations
        """

        def on_start_key() -> None:
            if ActionScript.current_script is None:
                return

            if ActionScript.current_script.is_playing():
                ActionScript.current_script.pause()
                self._socket.emit("changed-play-state", "paused")
            else:
                self._socket.start_background_task(target=lambda: ActionScript.current_script.start(lambda a, b=None: socket_supported_sleep(self._socket, a, b)))
                self._socket.emit("changed-play-state", "playing")

        def on_stop_key() -> None:
            if ActionScript.current_script is None:
                return

            if not ActionScript.current_script.is_stopped():
                ActionScript.current_script.stop()
                self._socket.emit("changed-play-state", "stopped")

        with self._app.app_context():
            combinations_to_test = [
                {
                    "key-string": Setting.query.filter_by(name="start-script-key-combination").first().value,
                    "call": on_start_key
                },
                {
                    "key-string": Setting.query.filter_by(name="stop-script-key-combination").first().value,
                    "call": on_stop_key
                }
            ]

            for combination in combinations_to_test:
                keys: List[str] = combination["key-string"].split("+")

                # We need to press the exact keys and nothing extra
                if len(keys) != len(self._pressed_keys):
                    continue

                is_pressing_all: bool = True

                # Make sure we are pressing all the necessary keys
                for key in keys:
                    if key not in self._pressed_keys:
                        is_pressing_all = False
                        break

                if not is_pressing_all:
                    continue

                self._hotkey_functions_to_run.append(combination["call"])

    def hotkey_emitter(self) -> None:
        """
        Tells frontend what keys are being pressed
        """

        while self._is_running:
            if not self._pressed_changed:
                self._socket.sleep(0.1)
                continue
            self._pressed_changed = False

            for func in self._hotkey_functions_to_run:
                func()

            self._hotkey_functions_to_run.clear()

            # If user isn't listening to any keybinds, we don't need to send them
            if not self._is_user_listening_to_keybinds:
                continue

            self._socket.emit("pressing-keys", self._pressed_keys)

    def hotkey_listening_check(self) -> None:
        with self._app.app_context():
            hotkeys_enabled_setting: Setting = Setting.query.filter_by(name="hotkeys-enabled").first()
            hotkeys_enabled: bool = hotkeys_enabled_setting.value == "true"

            if hotkeys_enabled and not self._is_running:
                self.start_listening_to_keys()
            elif not hotkeys_enabled and self._is_running:
                self.stop_listening_to_keys()

    def start_listening_to_keys(self) -> None:
        self._is_running = True
        self._socket.start_background_task(target=self.hotkey_emitter)
        keyboard.hook(self.on_key_event)

    def stop_listening_to_keys(self) -> None:
        self._is_running = False
        keyboard.unhook(self.on_key_event)
