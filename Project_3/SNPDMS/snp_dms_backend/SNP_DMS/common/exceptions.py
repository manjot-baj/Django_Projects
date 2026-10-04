
class AlreadyExists(Exception):
    def __init__(self,message):
        self.message = message
        super().__init__(self.message)

class ResourceNotFound(Exception):

    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class ValidationError(Exception):

    def __init__(self, message):
        self.message = message
        super().__init__(self.message)