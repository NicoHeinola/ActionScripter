import pyautogui
from .action import Action

pyautogui.PAUSE = 0
pyautogui.FAILSAFE = False


class MouseClickAction(Action):
    action_type = "mouse-click"
    action_type_display_name = "Mouse Click"

    def __init__(self) -> None:
        super().__init__()

        # Should we click at current cursor position or a certain position (click-at-mouse-position, click-at-coordinates)
        self._click_position_type: str = "click-at-coordinates"
        self._click_x: int = 0
        self._click_y: int = 0

        # What mouse button to click with (left, right, middle)
        self._click_button: str = "left"

    def do_action(self) -> bool:
        if self._click_position_type == "click-at-coordinates":
            pyautogui.moveTo(self._click_x, self._click_y)

        pyautogui.mouseDown(button=self._click_button)
        pyautogui.mouseUp(button=self._click_button)

    def serialize(self) -> dict:
        data: dict = super().serialize()

        data["click-position-type"] = self._click_position_type
        data["click-x"] = self._click_x
        data["click-y"] = self._click_y
        data["click-button"] = self._click_button

        return data

    def deserialize(self, data: dict) -> None:
        super().deserialize(data)

        if "click-position-type" in data:
            self._click_position_type = data["click-position-type"]

        if "click-x" in data:
            self._click_x = int(data["click-x"])

        if "click-y" in data:
            self._click_y = int(data["click-y"])

        if "click-button" in data:
            self._click_button = data["click-button"]
