import time
from typing import Callable
from flask_socketio import SocketIO


def socket_supported_sleep(socketio: SocketIO, sleep_time_ms: float, stop_callback: Callable = None):
    """
    :param sleep_time_ms: How long we should sleep in total
    :param parts_ms: How long each sleep cycle lasts at most
    """

    parts_ms: float = 100

    # We want to sleep in parts since we might have to stop this thread during a sleep cycle.
    sleeping_left: float = sleep_time_ms
    while sleeping_left > 0:
        if stop_callback is not None and stop_callback():
            return

        sleep_amount: float = min(parts_ms, sleeping_left)
        socketio.sleep(sleep_amount / 1000.0)
        sleeping_left -= sleep_amount
