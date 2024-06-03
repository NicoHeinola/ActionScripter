from typing import Dict
from flask import Flask, make_response, request
from flask_socketio import SocketIO
from controllers.base_controller import BaseController
from controllers.utils.hotkey_manager import HotkeyManager
from models.setting_model import Setting
from database.database import db


class SettingController(BaseController):
    settings_default_values: Dict[str, str] = {
        "actions-per-page": "50",
        "mouse-location-picker-wait-delay-s": "3",
        "start-script": "29+6",  # Ctrl + 6
        "start-script-display": "ctrl + 5",
        "stop-script": "29+7",  # Ctrl + 5
        "stop-script-display": "ctrl + 6",
        "hotkeys-enabled": "true",
    }

    def __init__(self, app: Flask, socket: SocketIO, hotkey_manager: HotkeyManager) -> None:
        super().__init__(app, socket, hotkey_manager)
        self._initialize_settings_data()

    def _initialize_settings_data(self) -> None:
        """
        Creates all setting values from the default values if they don't exist yet
        """

        with self._app.app_context():
            for name, value in SettingController.settings_default_values.items():
                setting: Setting = Setting.query.filter_by(name=name).first()
                if setting:
                    continue

                setting = Setting()
                setting.name = name
                setting.value = value

                db.session.add(setting)

            db.session.commit()

    def handle_setting_change(self, setting_name, setting_value) -> None:
        """
        Some settings may have some custom logic that needs to be handled
        """
        if setting_name == "hotkeys-enabled":
            self._hotkey_manager.hotkey_listening_check()

    def _register_routes(self) -> None:
        base_route: str = "/setting"

        @self._app.route(f"{base_route}", methods=["POST"])
        def update_settings():
            data: dict = request.get_json()

            for name in data:
                # Get setting value
                value: str = str(data[name])

                # Check if a setting already exists
                setting = Setting.query.filter_by(name=name).first()

                # Create a new setting if it doesn't exist
                if setting is None:
                    setting = Setting()

                # Update the setting
                setting.name = name
                setting.value = value

                db.session.add(setting)
                db.session.commit()

                self.handle_setting_change(name, value)

            return make_response("", 200)

        @self._app.route(f"{base_route}/all", methods=["GET"])
        def get_all_settings():
            # Get all saved settings
            setting_list: list = Setting.query.all()

            # Convert the list to a dictionary for easier lookup
            settings: dict = {}
            for setting in setting_list:
                name: str = setting.name
                value: str = setting.value

                settings[name] = value

            return make_response(settings, 200)

        @self._app.route(f"{base_route}/default-value", methods=["GET"])
        def get_setting_default_value():
            data: dict = request.get_json()
            name: str = data["name"]

            if name is None:
                return make_response({"error": "Setting name missing!"}, 400)

            if name not in SettingController.settings_default_values:
                return make_response({"error": "Setting name doesn't exist!"}, 404)

            return make_response(SettingController.settings_default_values[name], 200)

        @self._app.route(f"{base_route}/default-values", methods=["GET"])
        def get_all_settings_default_values():
            return make_response(SettingController.settings_default_values, 200)
