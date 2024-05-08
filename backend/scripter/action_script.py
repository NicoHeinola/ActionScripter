import json
from typing import Callable, Dict, List

from scripter.actions.action import Action
from scripter.actions.mouse_click_action import MouseClickAction
from scripter.event_emitter import EventEmitter
from tkinter import filedialog
from enum import Enum


class HistoryRecordEntry:
    class ModificationType(Enum):
        DELETE = "delete"
        MODIFY = "modify"
        ADD = "add"

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
                case HistoryRecordEntry.ModificationType.ADD:
                    actions.pop(entry.index)
                case HistoryRecordEntry.ModificationType.MODIFY:
                    actions[entry.index] = entry.action_before
                case HistoryRecordEntry.ModificationType.DELETE:
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
                case HistoryRecordEntry.ModificationType.ADD:
                    actions.insert(entry.index, entry.action_after)
                case HistoryRecordEntry.ModificationType.MODIFY:
                    actions[entry.index] = entry.action_after
                case HistoryRecordEntry.ModificationType.DELETE:
                    actions.pop(entry.index)

            changes.append(entry.serialize())

        return changes


class ActionScript(EventEmitter):
    current_script = None

    all_actions: Dict[str, Action] = {
        MouseClickAction.action_type: MouseClickAction
    }

    def __init__(self) -> None:
        super().__init__()

        ActionScript.current_script = self

        # Contains all the actions in order.
        self._actions: List[Action] = []

        # How many times the script plays, x-times or infinite
        self._loop_type: str = "x-times"

        # How many times the script plays
        self._loop_count: int = 0

        # How many times the script has looped so far
        self._current_loop_count: int = 0

        # Is this script running, paused or stopped
        self._play_state: str = "stopped"

        # What action is currently playing
        self._action_index: int = 0

        # Where this script was last saved. Used for automatically saving without having to manually pick the location
        self._latest_save_path: str = ""

        # Contains a list of changes that we can revert
        self._action_history: List[HistoryRecord] = []
        self._history_index: int = -1

    def is_playing(self) -> bool:
        return self._play_state == "playing"

    def is_stopped(self) -> bool:
        return self._play_state == "stopped"

    def is_paused(self) -> bool:
        return self._play_state == "paused"

    def get_actions(self) -> List[Action]:
        return self._actions

    def play_handler(self, sleep_handler: Callable[float, Callable]) -> None:
        """
        Performs all actions.
        """

        while self._current_loop_count <= self._loop_count or self._loop_type == "infinite":

            self.emit("performed-action", self._action_index)

            # Loop through each action that user has created (or start at where we left before pausing)
            for action in self._actions[self._action_index:]:

                # Perform the action as many times as wanted
                for i in range(action._loop_count):
                    if action._start_delay_ms > 0:
                        # Wait for the action to start
                        sleep_handler(action._start_delay_ms, lambda: not self.is_playing())

                    if not self.is_playing():
                        return

                    # Perform the actual action
                    action.do_action()

                    if action._end_delay_ms > 0:
                        # Wait for the action to end
                        sleep_handler(action._end_delay_ms, lambda: not self.is_playing())

                if not self.is_playing():
                    return

                # Inform that the next action will be played soon
                self._action_index += 1

                if (self._action_index < len(self._actions)):
                    self.emit("performed-action", self._action_index)

            self._action_index = 0
            self._current_loop_count += 1

            if not self.is_playing():
                return

        self.stop()
        self.emit("finished-actions")

    def start(self, sleep_handler: Callable[float, Callable]) -> None:
        if self.is_playing():
            return

        self._play_state = "playing"
        self.play_handler(sleep_handler)

    def pause(self) -> None:
        if not self.is_playing():
            return

        self._play_state = "paused"

    def stop(self) -> None:
        if self.is_stopped():
            return

        self._play_state = "stopped"
        self._action_index = 0
        self._current_loop_count = 0

    def add_action(self, action: Action) -> None:
        """
        Adds an action to this class' actions.

        :param action: Action to add.
        """

        action.on("deserialized", lambda _1, _2: self.create_new_history_entry())
        action.on("deserialized", lambda before, after: self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY, self._actions.index(after), before, after))

        self._actions.append(action)
        self.create_new_history_entry()
        self.save_history_change(HistoryRecordEntry.ModificationType.ADD, len(self._actions) - 1, None, action)

    def add_action_at(self, action: Action, index: int) -> None:
        """
        Adds an action to this class' action list at an index

        :param action: Action to add
        :param index: Index to add the action to
        """

        action.on("deserialized", lambda _1, _2: self.create_new_history_entry())
        action.on("deserialized", lambda before, after: self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY, self._actions.index(action), before, after))

        self._actions.insert(index, action)
        self.create_new_history_entry()
        self.save_history_change(HistoryRecordEntry.ModificationType.ADD, index, None, action)

    def create_action_with_type(self, action_type: str) -> Action:
        """
        Creates a new action.

        :param action_type: What type of action to add.
        :return: Created action.
        """

        if action_type not in ActionScript.all_actions:
            return None

        action_class: Action = ActionScript.all_actions[action_type]
        new_action: Action = action_class()

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

        removed_action: Action = self._actions.pop(action_index)
        self.create_new_history_entry()
        self.save_history_change(HistoryRecordEntry.ModificationType.DELETE, action_index, removed_action, None)
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

        self.clear_history()

    def swap_actions(self, index_a: int, index_b: int) -> None:
        """
        Swaps 2 actions positions inside this class' action list

        :param index_a: Some index.
        :param index_b: Some index.
        """

        # We can't swap 2 things that are the same
        if index_a == index_b:
            return

        self.create_new_history_entry()

        action_at_index_a: Action = self._actions[index_a]
        action_at_index_b: Action = self._actions[index_b]
        self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY, index_a, action_at_index_a, action_at_index_b)
        self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY, index_b, action_at_index_b, action_at_index_a)

        # Swap the actions
        self._actions[index_a], self._actions[index_b] = self._actions[index_b], self._actions[index_a]

    def set_loop_type(self, loop_type: str) -> None:
        self._loop_type = loop_type

    def set_loop_count(self, loop_count: int) -> None:
        self._loop_count = loop_count

    def serialize(self, include_actions: bool = False) -> dict:
        data: dict = {}

        data["loop-type"] = self._loop_type
        data["loop-count"] = self._loop_count
        data["current-loop-count"] = self._current_loop_count

        data["play-state"] = self._play_state
        data["action-index"] = self._action_index

        serialized_actions: List[Action] = []
        if include_actions:
            for action in self._actions:
                action_data: dict = action.serialize()
                serialized_actions.append(action_data)
        data["actions"] = serialized_actions

        return data

    def deserialize(self, data: dict) -> None:
        if "loop-type" in data:
            self._loop_type = data["loop-type"]

        if "loop-count" in data:
            self._loop_count = int(data["loop-count"])

        if "actions" in data:
            self._actions.clear()
            for action_data in data["actions"]:
                action: Action = self.create_action_with_type(action_data["type"])
                action.deserialize(action_data)
                self.add_action(action)

    def save_as(self) -> None:
        file_path: str = filedialog.asksaveasfilename(defaultextension=".acsc", filetypes=[("ActionScript Files", "*.acsc"), ("All Files", "*.*")])

        if not file_path:
            return None

        self._latest_save_path = file_path

        self.save()

        return file_path

    def save(self) -> None:
        with open(self._latest_save_path, 'w') as file:
            file.write(json.dumps(self.serialize(True)))

    def clear_history(self) -> None:
        self._history_index = -1
        self._action_history = []

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
