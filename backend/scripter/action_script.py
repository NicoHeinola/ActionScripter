import json
from typing import Callable, Dict, List

from scripter.action_group import ActionGroup
from scripter.actions.action import Action
from scripter.actions.mouse_click_action import MouseClickAction
from scripter.event_emitter import EventEmitter
from tkinter import filedialog
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


class ActionScript(EventEmitter):
    current_script = None

    def __init__(self) -> None:
        super().__init__()

        # Let's reset the global group id since there can only be one action script active at a time anyways
        ActionScript.current_script = self

        # Contains all the action groups
        # 0 = the main action group
        self._action_groups: Dict[int, ActionGroup] = {}
        self.add_action_group(ActionGroup())

        # How many times the script plays, x-times or infinite
        self._loop_type: str = "x-times"

        # How many times the script plays
        self._loop_count: int = 0

        # How many times the script has looped so far
        self._current_loop_count: int = 0

        # Is this script running, paused or stopped
        self._play_state: str = "stopped"

        # Where this script was last saved. Used for automatically saving without having to manually pick the location
        self._latest_save_path: str = ""

        # Contains a list of changes that we can revert
        self._action_history: List[HistoryRecord] = []
        self._history_index: int = -1

    def group_exists(self, group_id: int) -> bool:
        return self._action_groups.get(group_id) is not None

    def get_action_group(self, group_id: int) -> ActionGroup:
        if not self.group_exists(group_id):
            return None

        return self._action_groups[group_id]

    def get_main_action_group(self) -> ActionGroup:
        """
        :return: Returns the action group that contains the main script.
        """
        return self.get_action_group(0)

    def is_playing(self) -> bool:
        """
        Checks if the playback of this script is running.

        :return: If the script is running.
        """
        return self._play_state == "playing"

    def is_stopped(self) -> bool:
        """
        Checks if the playback of this script is stopped.

        :return: Is the script stopped.
        """
        return self._play_state == "stopped"

    def is_paused(self) -> bool:
        """
        Checks if playback of this script is paused.

        :return: Is the script running.
        """
        return self._play_state == "paused"

    def get_action_groups(self) -> List[ActionGroup]:
        """
        :return: The list of all action group this script has.
        """
        return self._action_groups

    def start(self, sleep_handler: Callable[float, Callable]) -> None:
        """
        Starts playing actions.

        :param sleep_handler: a function that performs a sleep operation.
        """
        if self.is_playing():
            return

        self._play_state = "playing"

        # Loop the actions until stopped or loop limit reached
        while self._current_loop_count <= self._loop_count or self._loop_type == "infinite":
            # Start running the main script
            main_group: ActionGroup = self.get_main_action_group()
            main_group.play_handler(sleep_handler, self.is_playing)

            if not self.is_playing():
                return

            self._current_loop_count += 1

        self.stop()
        self.emit("finished-actions")

    def pause(self) -> None:
        """
        Temporarely stop running any actions. Can be resumed.
        """

        if not self.is_playing():
            return

        self._play_state = "paused"

    def stop(self) -> None:
        """
        Completely stop running any actions.
        """

        if self.is_stopped():
            return

        self._play_state = "stopped"
        self._current_loop_count = 0

        for group in self._action_groups.values():
            group.reset_action_index()

    def add_action_group(self, group: ActionGroup) -> None:
        group.on("performed-action", lambda action_index: self.emit("performed-action", action_index))
        self._action_groups[group.get_id()] = group

    def add_action(self, group_id: int, action: Action) -> None:
        """
        Adds an action to a group.

        :param action: Action to add.
        """

        group: ActionGroup = self.get_action_group(group_id)

        if group is None:
            return

        group.add_action(action)

        # DOESNT WORK BECAUSE OF DESERIALIZE
        # action.on("deserialized", lambda _1, _2: self.create_new_history_entry())
        # action.on("deserialized", lambda before, after: self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, self._actions.index(after), before, after))

        # self.create_new_history_entry()
        # self.save_history_change(HistoryRecordEntry.ModificationType.ADD_ACTION, len(self._actions) - 1, None, action)

    def add_action_at(self, group_id: int, action: Action, index: int) -> None:
        """
        Inserts an action into a certain index of an action group.

        :param group_id: Id of the group to add the action to.
        :param action: Action to add.
        :param index: Index to add the action to.
        """

        group: ActionGroup = self.get_action_group(group_id)

        if group is None:
            return

        group.add_action_at(action, index)

        # DOEST WORK
        # action.on("deserialized", lambda _1, _2: self.create_new_history_entry())
        # action.on("deserialized", lambda before, after: self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, self._actions.index(action), before, after))

        # self.create_new_history_entry()
        # self.save_history_change(HistoryRecordEntry.ModificationType.ADD_ACTION, index, None, action)

    def remove_action(self, group_id: int, action_id: int) -> int:
        """
        Removes an action from the given group.

        :param group_id: Id of the group to remove the action from.
        :param action_id: Id of the action to remove.
        :return: Index of removed action
        """

        group: ActionGroup = self.get_action_group(group_id)

        if group is None:
            return

        action_index, removed_action = group.remove_action(action_id)

        if action_index is None or removed_action is None:
            return

        self.create_new_history_entry()
        self.save_history_change(HistoryRecordEntry.ModificationType.DELETE_ACTION, action_index, removed_action, None)
        return action_index

    def update_actions(self, group_id: int, actions: List[dict]) -> None:
        """
        Updates actions in a group.

        :param group_id: Group to update.
        :param actions: Actions to update.
        """

        group: ActionGroup = self.get_action_group(group_id)

        if group is None:
            return

        group.update_actions(actions)

    def set_actions_with_dict(self, group_id: int, actions: List[dict]) -> None:
        """
        Sets the actions of given group.

        :param group_id: Group to set the actions to.
        :param actions: List of actions in a serializes format.
        """

        group: ActionGroup = self.get_action_group(group_id)

        if group is None:
            return

        group.set_actions_with_dict(actions)

        self.clear_history()

    def swap_actions(self, group_id: int, index_a: int, index_b: int) -> None:
        """
        Swaps 2 actions in a group.

        :param group_id: Group to swap the actions in.
        :param index_a: Some index.
        :param index_b: Some index.
        """

        group: ActionGroup = self.get_action_group(group_id)

        if group is None:
            return

        # We can't swap 2 things that are the same
        if index_a == index_b:
            return

        self.create_new_history_entry()

        action_at_index_a: Action = group.get_action_at(index_a)
        action_at_index_b: Action = group.get_action_at(index_b)
        self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, index_a, action_at_index_a, action_at_index_b)
        self.save_history_change(HistoryRecordEntry.ModificationType.MODIFY_ACTION, index_b, action_at_index_b, action_at_index_a)

        group.swap_actions(index_a, index_b)

    def set_loop_type(self, loop_type: str) -> None:
        self._loop_type = loop_type

    def set_loop_count(self, loop_count: int) -> None:
        self._loop_count = loop_count

    def serialize(self) -> dict:
        data: dict = {}

        data["loop-type"] = self._loop_type
        data["loop-count"] = self._loop_count
        data["current-loop-count"] = self._current_loop_count

        data["play-state"] = self._play_state

        serialized_action_groups: Dict[int, dict] = {}
        for action_group in self._action_groups.values():
            action_group_data: dict = action_group.serialize()
            serialized_action_groups[action_group.get_id()] = action_group_data
        data["action-groups"] = serialized_action_groups

        return data

    def deserialize(self, data: dict) -> None:
        if "loop-type" in data:
            self._loop_type = data["loop-type"]

        if "loop-count" in data:
            self._loop_count = int(data["loop-count"])

        if "action-groups" in data:
            self._action_groups.clear()
            for action_group_data in data["action-groups"].values():
                action_group: ActionGroup = ActionGroup()
                action_group.deserialize(action_group_data)
                self.add_action_group(action_group)

    def save_as(self) -> None:
        file_path: str = filedialog.asksaveasfilename(defaultextension=".acsc", filetypes=[("ActionScript Files", "*.acsc"), ("All Files", "*.*")])

        if not file_path:
            return None

        self._latest_save_path = file_path

        self.save()

        return file_path

    def save(self) -> None:
        with open(self._latest_save_path, 'w') as file:
            file.write(json.dumps(self.serialize()))

    def clear_history(self) -> None:
        self._history_index = -1
        self._action_history = []

    def create_new_history_entry(self) -> None:
        return

        # If we are not at the latest history entry, overwrite future history changes by this one
        if self._history_index != len(self._action_history) - 1:
            self._action_history = self._action_history[:self._history_index + 1]

        history_record: HistoryRecord = HistoryRecord()
        self._action_history.append(history_record)
        self._history_index += 1

    def save_history_change(self, modification_type: HistoryRecordEntry.ModificationType, modified_action_index: int, action_before_modification: Action, action_after_modification: Action) -> None:
        return

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
        return []

        # Check if there is history left to undo
        if self._history_index < 0:
            return []

        changes: List[dict] = self._action_history[self._history_index].apply(self._actions)

        self._history_index -= 1

        return changes

    def redo_history(self) -> List[dict]:
        return []

        # Check if there is history left to redo
        if self._history_index >= len(self._action_history) - 1:
            return []

        self._history_index += 1

        changes: List[dict] = self._action_history[self._history_index].revert(self._actions)

        return changes
