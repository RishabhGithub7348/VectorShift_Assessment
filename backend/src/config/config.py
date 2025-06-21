import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    APP_PORT = int(os.getenv("APP_PORT", 8000))
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
    HUBSPOT_CLIENT_ID = os.getenv("HUBSPOT_CLIENT_ID", "XXX")
    HUBSPOT_CLIENT_SECRET = os.getenv("HUBSPOT_CLIENT_SECRET", "XXX")
    AIRTABLE_CLIENT_ID = os.getenv("AIRTABLE_CLIENT_ID", "XXX")
    AIRTABLE_CLIENT_SECRET = os.getenv("AIRTABLE_CLIENT_SECRET", "XXX")
    NOTION_CLIENT_ID = os.getenv("NOTION_CLIENT_ID", "XXX")
    NOTION_CLIENT_SECRET = os.getenv("NOTION_CLIENT_SECRET", "XXX")

config = Config()  # Instantiate the Config class and make it available as a module attribute