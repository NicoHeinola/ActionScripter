from abc import ABC, abstractmethod
import random


class Action(ABC):
    current_action_id: int = 0

    # A type to display to the frontend
    action_type: str = "Missing Action Type"

    def __init__(self) -> None:
        # Used to keep track of which action this one is
        self._id: str = Action.current_action_id
        Action.current_action_id += 1

        # How long to wait until this action starts
        self._start_delay_ms: int = 0

        # How long to wait for the next action when this is finished
        self._end_delay_ms: int = 50

        # Name to display to the frontend
        self._name: str = f"Action {self._id + 1}"

    @staticmethod
    def reset_current_id() -> None:
        Action.current_action_id = 0

    @abstractmethod
    def do_action(self) -> bool:
        pass

    def serialize(self) -> dict:
        data: dict = {}
        data["name"] = self._name
        data["id"] = self._id
        data["start-delay-ms"] = self._start_delay_ms
        data["end-delay-ms"] = self._end_delay_ms
        data["type"] = self.action_type
        return data

    def deserialize(self, data: dict) -> None:
        if "name" in data:
            self._name = data["name"]

        if "id" in data:
            self._id = data["id"]
            Action.current_action_id = max(self._id, Action.current_action_id)

        if "start-delay-ms" in data:
            self._start_delay_ms = data["start-delay-ms"]

        if "end-delay-ms" in data:
            self._end_delay_ms = data["end-delay-ms"]
