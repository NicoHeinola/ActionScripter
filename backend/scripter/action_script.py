from typing import Dict, List
from scripter.actions.action import Action
from scripter.actions.mouse_click_action import MouseClickAction


class ActionScript:
    current_script = None

    all_actions: Dict[str, Action] = {
        "mouse-click": MouseClickAction
    }

    def __init__(self) -> None:
        ActionScript.current_script = self

        self._actions: List[Action] = []

    def add_action(self, action_type: str) -> Action:
        if action_type not in ActionScript.all_actions:
            return None

        action_class: Action = ActionScript.all_actions[action_type]
        new_action: Action = action_class()

        self._actions.append(new_action)

        return new_action
