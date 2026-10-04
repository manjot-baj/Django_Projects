import threading

THREAD_LOCAL = threading.local()

def set_db_for_router(db):
    setattr(THREAD_LOCAL, "DB", db)