from typing import Dict
from scripter.actions.action import Action
from scripter.actions.mouse_click_action import MouseClickAction


class ActionHelper:
    # To add action to the program just modify this list
    all_actions: Dict[str, Action] = {
        MouseClickAction.action_type: MouseClickAction
    }

    @staticmethod
    def create_action_with_type(action_type: str) -> Action:
        """
        Creates a new action.

        :param action_type: What type of action to create.
        :return: Created action.
        """

        if action_type not in ActionHelper.all_actions:
            return None

        action_class: Action = ActionHelper.all_actions[action_type]
        new_action: Action = action_class()

        return new_action
