from pymongo import MongoClient
import certifi

class MongoWrapper:
    """Direct PyMongo client — uses certifi for proper Atlas SSL on Python 3.11 Windows."""
    def __init__(self):
        self.client = None
        self._db = None

    def init_app(self, app):
        uri = app.config.get('MONGO_URI', 'mongodb://localhost:27017/airguard_db')
        try:
            self.client = MongoClient(
                uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=20000,
                connectTimeoutMS=20000,
                socketTimeoutMS=20000
            )
            # Determine db name from URI or default
            db_name = 'airguard_db'
            if '/' in uri.split('@')[-1]:
                part = uri.split('@')[-1].split('/')[1].split('?')[0]
                if part:
                    db_name = part
            self._db = self.client[db_name]
            print(f"[MongoDB] Connected to database: {db_name}")
        except Exception as e:
            print(f"[MongoDB] Connection error: {e}")
            self._db = None

    @property
    def db(self):
        return self._db

mongo = MongoWrapper()
