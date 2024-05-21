from typing import Callable, List, Union

from scripter.actions.action import Action
from scripter.actions.action_helper import ActionHelper
from scripter.event_emitter import EventEmitter


class ActionGroup(EventEmitter):
    global_group_id: int = 0

    def __init__(self) -> None:
        super().__init__()

        self._id: int = ActionGroup.global_group_id
        ActionGroup.global_group_id += 1

        # Actions that this group contains and will perform
        self._actions: List[Action] = []

        # What action is currently playing
        self._action_index: int = 0

    @staticmethod
    def reset_global_id_count() -> None:
        ActionGroup.global_group_id = 0

    def get_id(self) -> int:
        return self._id

    def serialize(self) -> dict:
        data: dict = {}
        data["id"] = self.get_id()
        data["action-index"] = self._action_index

        serialized_actions: List[Action] = []
        for action in self._actions:
            action_data: dict = action.serialize()
            serialized_actions.append(action_data)
        data["actions"] = serialized_actions

        return data

    def deserialize(self, data: dict) -> None:
        if "id" in data:
            self._id = int(data["id"])
            ActionGroup.global_group_id = max(ActionGroup.global_group_id, self.get_id())

        if "actions" in data:
            for action_data in data["actions"]:
                action: Action = ActionHelper.create_action_with_type(action_data["type"])
                action.deserialize(action_data)
                self.add_action(action)

    def reset_action_index(self) -> None:
        self._action_index = 0

    def get_actions(self) -> List[Action]:
        return self._actions

    def get_action_at(self, index: int) -> Action:
        return self._actions[index]

    def play_handler(self, sleep_handler: Callable[float, Callable], is_playing_handler: Callable) -> None:
        """
        Plays all actions stored in this group

        :param sleep_handler: A function to call sleep
        :param is_playing_handler: A function to check if the script is still running. This is so we can stop performing actions before finishing
        """

        # Loop through each action that user has created (or start at where we left before pausing)
        for action in self._actions[self._action_index:]:
            # Perform the action as many times as wanted
            for _ in range(action._loop_count):
                if action._start_delay_ms > 0:
                    # Wait for the action to start
                    sleep_handler(action._start_delay_ms, lambda: not is_playing_handler())

                if not is_playing_handler():
                    return

                # Perform the actual action
                action.do_action()

                if action._end_delay_ms > 0:
                    # Wait for the action to end
                    sleep_handler(action._end_delay_ms, lambda: not is_playing_handler())

            if not is_playing_handler():
                return

            # Inform that the next action will be played soon
            self._action_index += 1

            if (self._action_index < len(self._actions)):
                self.emit("performed-action", self._action_index)

        self.reset_action_index()

    def add_action(self, action: Action) -> None:
        """
        Adds an action to the action list.

        :param action: Action to add.
        """

        self._actions.append(action)

    def add_action_at(self, action: Action, index: int) -> None:
        """
        Adds an action to this class' action list at an index

        :param action: Action to add
        :param index: Index to add the action to
        """

        self._actions.insert(index, action)

    def remove_action(self, action_id: int):
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
            return None, None

        removed_action: Action = self._actions.pop(action_index)
        return action_index, removed_action

    def update_actions(self, actions: List[dict]) -> None:
        """
        Updates the actions of this class

        :param actions: Actions to update
        """

        for action_data in actions:

            for existing_action in self._actions:
                if existing_action._id == action_data["id"]:
                    existing_action.deserialize(action_data)
                    break

    def set_actions_with_dict(self, actions: List[dict]) -> None:
        """
        Sets this class' actions to match the list provided. Deserializes the actions using the list's data.

        :param actions: List of actions in a serializes format.
        """

        self._actions = []

        for action in actions:
            action_type: str = action["type"]

            if action_type not in ActionHelper.all_actions:
                continue

            action_class: Action = ActionHelper.all_actions[action_type]
            new_action: Action = action_class()
            new_action.deserialize(action)

            self.add_action(new_action)

    def swap_actions(self, index_a: int, index_b: int) -> None:
        """
        Swaps 2 actions.

        :param index_a: Some index.
        :param index_b: Some index.
        """

        # We can't swap 2 things that are the same
        if index_a == index_b:
            return

        # Swap the actions
        self._actions[index_a], self._actions[index_b] = self._actions[index_b], self._actions[index_a]
