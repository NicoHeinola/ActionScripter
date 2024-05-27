import json
from typing import Callable, Dict, List

from scripter.action_group import ActionGroup
from scripter.actions.action import Action
from scripter.actions.mouse_click_action import MouseClickAction
from scripter.event_emitter import EventEmitter
from tkinter import filedialog


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

    def group_exists(self, group_id: int) -> bool:
        return self._action_groups.get(group_id) is not None

    def get_action_group(self, group_id: int) -> ActionGroup:
        if not self.group_exists(group_id):
            return None

        return self._action_groups[group_id]

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

    def start(self, group_id: int, sleep_handler: Callable[float, Callable]) -> None:
        """
        Starts playing actions.

        :param sleep_handler: a function that performs a sleep operation.
        """
        if self.is_playing():
            return

        self._play_state = "playing"

        group: ActionGroup = self.get_action_group(group_id)

        # Loop the actions until stopped or loop limit reached
        while self._current_loop_count <= self._loop_count or self._loop_type == "infinite":

            # Start running the main script
            group.play_handler(sleep_handler, self.is_playing)

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

    def remove_action_group(self, group_id: int) -> ActionGroup:
        """
        Removes an action group with given id.

        :param group_id: Action group to remove.
        :return: Returns the removed action group.
        """

        if not self.group_exists(group_id):
            return None

        return self._action_groups.pop(group_id)

    def update_action_group(self, group_id: int, data: dict):
        """
        Deserializes an action group with given data.

        :param group_id: What group to modify.
        :param data: Data to modify it with.
        """

        action_group: ActionGroup = self.get_action_group(group_id)

        if action_group is None:
            return

        action_group.deserialize(data)

    def add_action(self, group_id: int, action: Action) -> None:
        """
        Adds an action to a group.

        :param action: Action to add.
        """

        group: ActionGroup = self.get_action_group(group_id)

        if group is None:
            return

        group.add_action(action)

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

        action_index, _ = group.remove_action(action_id)
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

    def clear_history(self, group_id: int) -> None:
        if not self.group_exists(group_id):
            return

        group = self.get_action_group(group_id)
        group.clear_history()

    def undo_history(self, group_id: int) -> List[dict]:
        if not self.group_exists(group_id):
            return []

        group = self.get_action_group(group_id)
        return group.undo_history()

    def redo_history(self, group_id: int) -> List[dict]:
        if not self.group_exists(group_id):
            return []

        group = self.get_action_group(group_id)
        return group.redo_history()
