from operator import index
from typing import Dict, List
from scripter.actions.action import Action
from scripter.actions.mouse_click_action import MouseClickAction


class ActionScript:
    current_script = None

    all_actions: Dict[str, Action] = {
        MouseClickAction.action_type: MouseClickAction
    }

    def __init__(self) -> None:
        ActionScript.current_script = self

        # Contains all the actions in order.
        self._actions: List[Action] = []

    def get_actions(self) -> List[Action]:
        return self._actions

    def add_action(self, action: Action) -> None:
        """
        Adds an action to this class' actions.

        :param action: Action to add.
        """
        self._actions.append(action)

    def create_action_with_type(self, action_type: str) -> Action:
        """
        Creates a new action and adds it to this class' action list.

        :param action_type: What type of action to add.
        :return: Added action.
        """

        if action_type not in ActionScript.all_actions:
            return None

        action_class: Action = ActionScript.all_actions[action_type]
        new_action: Action = action_class()

        self.add_action(new_action)

        return new_action

    def remove_action(self, action_id: int) -> int:
        """
        Removes an action from this class' action list.

        :param action_id: Id of the action to remove.
        :return: Index of removed action
        """

        action_index: int = None
        for index, action in enumerate(self._actions):
            if action._id != action_id:
                continue

            action_index = index

        if action_index is None:
            return

        self._actions.pop(action_index)
        return action_index

    def set_actions_with_dict(self, actions: List[dict]) -> None:
        """
        Sets this class' actions to match the list provided. Deserializes the actions using the list's data.

        :param actions: List of actions in a serializes format.
        """

        self._actions = []

        for action in actions:
            action_type: str = action["type"]

            if action_type not in ActionScript.all_actions:
                continue

            action_class: Action = ActionScript.all_actions[action_type]
            new_action: Action = action_class()
            new_action.deserialize(action)

            self.add_action(new_action)

    def swap_actions(self, index_a: int, index_b: int) -> None:
        """
        Swaps 2 actions positions inside this class' action list

        :param index_a: Some index.
        :param index_b: Some index.
        """

        # We can't swap 2 things that are the same
        if index_a == index_b:
            return

        # Swap the actions
        self._actions[index_a], self._actions[index_b] = self._actions[index_b], self._actions[index_a]
