from operator import index
from threading import Thread
import time
from typing import Dict, List

from flask_socketio import SocketIO
from scripter.actions.action import Action
from scripter.actions.mouse_click_action import MouseClickAction
from scripter.event_emitter import EventEmitter


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

        # This thread handles running this script
        self._play_thread: Thread = None
        self._thread_should_be_stopped: bool = False

    def is_playing(self) -> bool:
        return self._play_state == "playing"

    def is_stopped(self) -> bool:
        return self._play_state == "stopped"

    def is_paused(self) -> bool:
        return self._play_state == "paused"

    def get_actions(self) -> List[Action]:
        return self._actions

    def _play_handler(self, socket: SocketIO) -> None:
        """
        Performs all actions.
        """

        def sleep_in_parts(sleep_time_ms: float, parts_ms=500):
            """
            We want to sleep in parts since we might have to stop this thread during a sleep cycle.

            :param sleep_time_ms: How long we should sleep in total
            :param parts_ms: How long each sleep cycle lasts at most
            """
            sleeping_left: float = sleep_time_ms
            while sleeping_left > 0:
                if self._thread_should_be_stopped:
                    return

                sleep_amount: float = min(parts_ms, sleeping_left)
                socket.sleep(sleep_amount / 1000.0)
                sleeping_left -= sleep_amount

        while self._current_loop_count <= self._loop_count or self._loop_type == "infinite":

            # Loop through each action that user has created (or start at where we left before pausing)
            for action in self._actions[self._action_index:]:

                # Perform the action as many times as wanted
                for i in range(action._loop_count):
                    if action._start_delay_ms > 0:
                        # Wait for the action to start
                        sleep_in_parts(action._start_delay_ms)

                    if self._thread_should_be_stopped:
                        return

                    # Perform the actual action
                    action.do_action()

                    if action._end_delay_ms > 0:
                        # Wait for the action to end
                        sleep_in_parts(action._end_delay_ms)

                if self._thread_should_be_stopped:
                    return

                # Inform that the next action will be played soon
                self._action_index += 1
                self.emit("performed-action", self._action_index)

            self._action_index = 0
            self._current_loop_count += 1
            self.emit("performed-action", self._action_index)

            if self._thread_should_be_stopped:
                return

        self._play_thread = None
        self.stop()
        self.emit("finished-actions")

    def start_socket_thread(self, socket: SocketIO) -> None:
        if self.is_playing():
            return

        self._play_thread = socket.start_background_task(target=lambda: self._play_handler(socket))

        self._play_state = "playing"

    def pause(self) -> None:
        if not self.is_playing():
            return

        self._thread_should_be_stopped = True
        if self._play_thread is not None:
            self._play_thread.join()

        self._play_thread = None
        self._thread_should_be_stopped = False
        self._play_state = "paused"

    def stop(self) -> None:
        if self.is_stopped():
            return

        self._thread_should_be_stopped = True
        if self._play_thread is not None:
            self._play_thread.join()

        self._play_thread = None
        self._thread_should_be_stopped = False
        self._play_state = "stopped"
        self._action_index = 0
        self._current_loop_count = 0

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
            print(action, type(action))
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
