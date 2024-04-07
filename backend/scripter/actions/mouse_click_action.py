from .action import Action


class MouseClickAction(Action):
    action_type = "Mouse Click"

    def __init__(self) -> None:
        super().__init__()

    def do_action() -> bool:
        print("Mouse moving!")

    def serialize(self) -> dict:
        data: dict = super().serialize()
        return data

    def deserialize(self, data: dict) -> None:
        super().deserialize(data)
