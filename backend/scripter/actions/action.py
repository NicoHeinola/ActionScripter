from abc import ABC, abstractmethod
import random


class Action(ABC):
    current_action_id: int = 0

    # A type to display to the frontend
    action_type = "missing-action-type"
    action_type_display_name = "Missing action type"

    def __init__(self) -> None:
        # Used to keep track of which action this one is
        self._id: int = Action.current_action_id
        Action.current_action_id += 1

        # How long to wait until this action starts
        self._start_delay_ms: int = 0

        # How long to wait for the next action when this is finished
        self._end_delay_ms: int = 50

        # Name to display to the frontend
        self._name: str = f"Action {self._id + 1}"

        # How many this action is performed
        self._loop_count: int = 1

    def __str__(self) -> str:
        serialized_data: dict = self.serialize()
        string: str = f"{self.__class__.__name__}: ("

        for key, value in serialized_data.items():
            string += f"{key}: {value}, "

        string += ")"
        return string

    @staticmethod
    def reset_current_id() -> None:
        """
        Sets the current action id to it's initial value. This should be done when a new script is created.
        """
        Action.current_action_id = 0

    @abstractmethod
    def do_action(self) -> bool:
        """
        Performs the actions of this such as a mouse click, mouse move event, keyboard event and such.

        :return: If succeeded in doing the action.
        """
        pass

    def serialize(self) -> dict:
        """
        Converts this class into a dictionary of data.

        :return: Dictionary that represents this class.
        """
        data: dict = {}
        data["name"] = self._name
        data["id"] = self._id
        data["start-delay-ms"] = self._start_delay_ms
        data["end-delay-ms"] = self._end_delay_ms
        data["type"] = self.action_type
        data["type-display-name"] = self.action_type_display_name
        data["loop-count"] = self._loop_count
        return data

    def deserialize(self, data: dict) -> None:
        """
        Initializes this classes values using a dictionary.

        :param data: A dictionary that represents this class; usually created in serialize().
        """
        if "name" in data:
            self._name = data["name"]

        if "id" in data:
            self._id = data["id"]
            Action.current_action_id = max(self._id, Action.current_action_id)

        if "start-delay-ms" in data:
            self._start_delay_ms = data["start-delay-ms"]

        if "end-delay-ms" in data:
            self._end_delay_ms = data["end-delay-ms"]

        if "loop-count" in data:
            self._loop_count = data["loop-count"]
