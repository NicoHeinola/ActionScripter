from abc import ABC, abstractmethod

class Action(ABC):
    def __init__(self) -> None:
        # How long to wait until this action starts
        self._start_delay_ms: int = 0

        # How long to wait for the next action when this is finished
        self._next_step_delay_ms: int = 0

    @abstractmethod
    def do_action() -> bool:
        pass

    @abstractmethod
    def serialize() -> dict:
        pass
    
    @abstractmethod
    def deserialize(data: dict) -> bool:
        pass