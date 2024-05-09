from flask import make_response, request
import pyautogui
from controllers.base_controller import BaseController
from utils.sleep import socket_supported_sleep


class UtilController(BaseController):

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self._picking_mouse_position_id: int = 0

    def _register_routes(self) -> None:
        base_route: str = "/util"

        @self._app.route(f"{base_route}/pick-mouse-position-countdown", methods=["POST"])
        def pick_mouse_position_countdown():

            duration_s: float = 3

            data: dict = request.get_json()

            if "duration-s" in data:
                duration_s = float(data["duration-s"])

            duration_ms: float = duration_s * 1000

            def pick_position_task(id) -> None:
                socket_supported_sleep(self._socket, duration_ms)

                # If we have restarted this countdown
                if self._picking_mouse_position_id != id:
                    return

                current_mouse_pos: pyautogui.Point = pyautogui.position()
                mouse_x: int = current_mouse_pos.x
                mouse_y: int = current_mouse_pos.y
                self._socket.emit("picked-mouse-position", {"mouse-x": mouse_x, "mouse-y": mouse_y})
                self._picking_mouse_position_id = 0

            self._picking_mouse_position_id += 1
            self._socket.start_background_task(target=lambda: pick_position_task(self._picking_mouse_position_id))

            return make_response("", 200)
