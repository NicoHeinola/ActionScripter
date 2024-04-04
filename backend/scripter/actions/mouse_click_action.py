from .action import Action

class MouseClickAction(Action):
    def do_action() -> bool:
        print("Mouse moving!")

    def serialize() -> dict:
        return {}
    
    def deserialize(data: dict) -> bool:
        return False