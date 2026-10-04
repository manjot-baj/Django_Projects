import redis
import time
import threading
import logging
import traceback
import uuid

# Shared Redis Connection
try:
    redis_client = redis.StrictRedis(
        host="localhost", port=6379, db=0, decode_responses=True
    )
except redis.ConnectionError:
    logging.error("Redis is not available. Ensure Redis is running.")


class RedisLock:
    def __init__(self, lock_name, expire=60, heartbeat_interval=30):
        """
        Redis-based lock with auto-renewal (heartbeat).

        :param lock_name: Unique lock name
        :param expire: Expiration time in seconds (prevents deadlocks)
        :param heartbeat_interval: How often to refresh the lock (must be < expire)
        """
        self.redis_client = redis_client
        self.lock_key = f"celery_lock_{lock_name}"
        self.expire = expire
        self.heartbeat_interval = heartbeat_interval
        self.identifier = str(uuid.uuid4())  # Unique per instance
        self.heartbeat_thread = None
        self.lock_acquired = False
        self.stop_event = threading.Event()

    def acquire(self):
        """Attempt to acquire the lock. If successful, start the heartbeat."""
        try:
            success = self.redis_client.set(
                self.lock_key, self.identifier, ex=self.expire, nx=True
            )

            if success:
                self.lock_acquired = True
                self.start_heartbeat()
                return True

            existing_lock = self.redis_client.get(self.lock_key)
            logging.info(
                f"Task already running (Lock owned by: {existing_lock}). Skipping execution."
            )
            return False
        except redis.ConnectionError:
            logging.error("Redis connection error. Cannot acquire lock.")
            return None
        except Exception:
            logging.error("Error acquiring lock: %s", traceback.format_exc())
            return None

    def start_heartbeat(self):
        """Continuously refresh the lock to prevent expiration while task is running."""

        def send_heartbeat():
            while not self.stop_event.is_set():
                time.sleep(self.heartbeat_interval)
                try:
                    if (
                        self.lock_acquired
                        and self.redis_client.get(self.lock_key) == self.identifier
                    ):
                        self.redis_client.expire(
                            self.lock_key, self.expire
                        )  # Reset expiration
                        logging.info(
                            f"Heartbeat sent: Lock extended for {self.expire} seconds. for {self.identifier}"
                        )
                except redis.ConnectionError:
                    logging.error("Redis connection lost. Heartbeat stopped.")
                    return
                except Exception:
                    logging.error("Error sending heartbeat: %s", traceback.format_exc())

        self.heartbeat_thread = threading.Thread(target=send_heartbeat, daemon=True)
        self.heartbeat_thread.start()

    def release(self):
        """Safely release the lock using Redis transactions."""
        try:
            self.redis_client.watch(self.lock_key)  # Monitor the lock key for changes
            if (
                self.redis_client.get(self.lock_key) == self.identifier
            ):  # Ensure this instance owns the lock
                pipeline = self.redis_client.pipeline()
                pipeline.multi()
                pipeline.delete(self.lock_key)
                pipeline.execute()
                self.lock_acquired = False
                self.stop_event.set()  # Stop the heartbeat thread
                logging.info(f"Lock released for task with ID {self.identifier}.")
            self.redis_client.unwatch()
        except redis.ConnectionError:
            logging.error("Redis connection error. Cannot release lock.")
        except Exception:
            logging.error("Error releasing lock: %s", traceback.format_exc())


# def my_long_task():
#     lock = RedisLock(
#         "my_long_task", expire=120, heartbeat_interval=30
#     )  # Using task name as lock name
#     if not lock.acquire():
#         return {"status": "Task already running, skipping execution"}
#     try:
#         try:
#             task_id = my_long_task.request.id  # Get the unique task ID
#             print(f"Executing task 1 instance with ID: {task_id}")
#             time.sleep(150)  # Simulate long task (3 minutes)
#             return f"Executing task 1 instance with ID: {task_id} .... completed"
#         except:
#             return f"Executing task 1 instance with ID: {task_id} .... Failed"

#     finally:
#         lock.release()  # Release the lock after completion
