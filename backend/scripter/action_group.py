from typing import Callable, List

from scripter.actions.action import Action
from scripter.actions.action_helper import ActionHelper
from scripter.event_emitter import EventEmitter
from enum import Enum


class HistoryRecordEntry:
    class ModificationType(Enum):
        DELETE_ACTION = "delete-action"
        MODIFY_ACTION = "modify-action"
        ADD_ACTION = "add-action"

    def __init__(self, type: ModificationType, index: int, action_before: Action, action_after: Action) -> None:
        self.type = type
        self.index: int = index
        self.action_before: Action = action_before
        self.action_after: Action = action_after

    def serialize(self) -> dict:
        data: dict = {}
        data["type"] = self.type.value
        data["index"] = self.index
        data["action-before"] = None
        data["action-after"] = None

        if self.action_before is not None:
            data["action-before"] = self.action_before.serialize()

        if self.action_after is not None:
            data["action-after"] = self.action_after.serialize()

        return data


class HistoryRecord:
    def __init__(self) -> None:
        self._modifications: List[HistoryRecordEntry] = []

    def add_entry(self, type: HistoryRecordEntry.ModificationType, index: int, action_before: Action, action_after: Action) -> None:
        new_entry: HistoryRecordEntry = HistoryRecordEntry(type, index, action_before, action_after)
        self._modifications.append(new_entry)

    def apply(self, actions: List[Action]) -> List[dict]:
        """
        Should be called when you want to go back to this position in history

        :param actions: List of actions to modify
        :returns: A list of all changes
        """

        changes: List[dict] = []

        for entry in self._modifications:
            match entry.type:
                case HistoryRecordEntry.ModificationType.ADD_ACTION:
                    actions.pop(entry.index)
                case HistoryRecordEntry.ModificationType.MODIFY_ACTION:
                    actions[entry.index] = entry.action_before
                case HistoryRecordEntry.ModificationType.DELETE_ACTION:
                    actions.insert(entry.index, entry.action_before)

            changes.append(entry.serialize())

        return changes

    def revert(self, actions: List[Action]) -> List[dict]:
        """
        Should be called when you have returned to this point in history and want to go back instead

        :param actions: List of actions to modify
        :returns: A list of all changes
        """

        changes: List[dict] = []

        # We need to loop the modifications in a reversed order to undo them
        reversed_modifications: List[HistoryRecordEntry] = self._modifications[:]
        reversed_modifications.reverse()

        for i in range(len(self._modifications)):
            entry: HistoryRecordEntry = self._modifications[len(self._modifications) - 1 - i]
            match entry.type:
                case HistoryRecordEntry.ModificationType.ADD_ACTION:
                    actions.insert(entry.index, entry.action_after)
                case HistoryRecordEntry.ModificationType.MODIFY_ACTION:
                    actions[entry.index] = entry.action_after
                case HistoryRecordEntry.ModificationType.DELETE_ACTION:
                    actions.pop(entry.index)

            changes.append(entry.serialize())

        return changes


class ActionGroup(EventEmitter):
    global_group_id: int = 0

    def __init__(self) -> None:
        super().__init__()

        self._id: int = ActionGroup.global_group_id
        ActionGroup.global_group_id += 1

        # Actions that this group contains and will perform
        self._actions: List[Action] = []

        # History
        self._action_history: List[HistoryRecord] = []
        self._history_index: int = -1

        # What action is currently playing
        self._action_index: int = 0

        # Information
        self._name = f"Group {self._id + 1}"

    @staticmethod
    def reset_global_id_count() -> None:
        ActionGroup.global_group_id = 0

    def get_id(self) -> int:
        return self._id

    def serialize(self) -> dict:
        data: dict = {}
        data["id"] = self.get_id()
        data["action-index"] = self._action_index
        data["name"] = self._name

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

            if "name" not in data:
                self._name = f"Group {self._id + 1}"

        if "name" in data:
            self._name = data["name"]

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

        # Save history changes
        action.on("deserialized", lambda _1, _2: self.create_new_history_entry())
        action.on("deserialized", lambda before, after: self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, self._actions.index(after), before, after))

        self.create_new_history_entry()
        self.save_history_change(HistoryRecordEntry.ModificationType.ADD_ACTION, len(self._actions) - 1, None, action)

    def add_action_at(self, action: Action, index: int) -> None:
        """
        Adds an action to this class' action list at an index

        :param action: Action to add
        :param index: Index to add the action to
        """

        self._actions.insert(index, action)

        # Save history changes
        action.on("deserialized", lambda _1, _2: self.create_new_history_entry())
        action.on("deserialized", lambda before, after: self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, self._actions.index(action), before, after))

        self.create_new_history_entry()
        self.save_history_change(HistoryRecordEntry.ModificationType.ADD_ACTION, index, None, action)

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

        # If no action can be removed
        if action_index is None:
            return None, None

        removed_action: Action = self._actions.pop(action_index)

        self.create_new_history_entry()
        self.save_history_change(HistoryRecordEntry.ModificationType.DELETE_ACTION, action_index, removed_action, None)

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

        self.clear_history()

    def swap_actions(self, index_a: int, index_b: int) -> None:
        """
        Swaps 2 actions.

        :param index_a: Some index.
        :param index_b: Some index.
        """

        # We can't swap 2 things that are the same
        if index_a == index_b:
            return

        self.create_new_history_entry()

        action_at_index_a: Action = self.get_action_at(index_a)
        action_at_index_b: Action = self.get_action_at(index_b)
        self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, index_a, action_at_index_a, action_at_index_b)
        self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, index_b, action_at_index_b, action_at_index_a)

        # Swap the actions
        self._actions[index_a], self._actions[index_b] = self._actions[index_b], self._actions[index_a]

    def create_new_history_entry(self) -> None:
        # If we are not at the latest history entry, overwrite future history changes by this one
        if self._history_index != len(self._action_history) - 1:
            self._action_history = self._action_history[:self._history_index + 1]

        history_record: HistoryRecord = HistoryRecord()
        self._action_history.append(history_record)
        self._history_index += 1

    def save_history_change(self, modification_type: HistoryRecordEntry.ModificationType, modified_action_index: int, action_before_modification: Action, action_after_modification: Action) -> None:
        # Create copies of the modified actions
        action_after: Action = None
        action_before: Action = None

        if action_before_modification is not None:
            action_before = action_before_modification.copy()

        if action_after_modification is not None:
            action_after = action_after_modification.copy()

        # Create new history record
        history_record: HistoryRecord = self._action_history[len(self._action_history) - 1]
        history_record.add_entry(modification_type, modified_action_index, action_before, action_after)

    def undo_history(self) -> List[dict]:
        # Check if there is history left to undo
        if self._history_index < 0:
            return []

        changes: List[dict] = self._action_history[self._history_index].apply(self._actions)

        self._history_index -= 1

        return changes

    def redo_history(self) -> List[dict]:
        # Check if there is history left to redo
        if self._history_index >= len(self._action_history) - 1:
            return []

        self._history_index += 1

        changes: List[dict] = self._action_history[self._history_index].revert(self._actions)

        return changes

    def clear_history(self) -> None:
        self._history_index = -1
        self._action_history = []
