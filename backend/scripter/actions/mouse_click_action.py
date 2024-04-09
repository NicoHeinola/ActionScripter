from .action import Action


class MouseClickAction(Action):
    action_type = "mouse-click"
    action_type_display_name = "Mouse Click"

    def __init__(self) -> None:
        super().__init__()

        self._click_position_type: str = "click-at-coordinates"
        self._click_x: int = 0
        self._click_y: int = 0

    def do_action(self) -> bool:
        print("Mouse is clicking!")

    def serialize(self) -> dict:
        data: dict = super().serialize()

        data["click-position-type"] = self._click_position_type
        data["click-x"] = self._click_x
        data["click-y"] = self._click_y

        return data

    def deserialize(self, data: dict) -> None:
        super().deserialize(data)

        if "click-position-type" in data:
            self._click_position_type = data["click-position-type"]

        if "click-x" in data:
            self._click_x = data["click-x"]

        if "click-y" in data:
            self._click_y = data["click-y"]
