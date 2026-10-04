
import logging, traceback

class ErrorLogging:
    def __init__(self):
        self.error_log = logging.getLogger("error_log")

    def log_error(self):
        self.error_log.error(traceback.format_exc())