from abc import ABC, abstractmethod
import random


class Action(ABC):
    current_action_id: int = 0

    def __init__(self) -> None:
        # Used to keep track of which action this one is
        self._id: str = Action.current_action_id
        Action.current_action_id += 1

        # How long to wait until this action starts
        self._start_delay_ms: int = 0

        # How long to wait for the next action when this is finished
        self._end_delay_ms: int = 50

        self._name: str = f"Action {self._id}"

    @abstractmethod
    def do_action(self) -> bool:
        pass

    def serialize(self) -> dict:
        data: dict = {}
        data["name"] = self._name
        data["id"] = self._id
        data["start-delay-ms"] = self._start_delay_ms
        data["end-delay-ms"] = self._end_delay_ms
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
