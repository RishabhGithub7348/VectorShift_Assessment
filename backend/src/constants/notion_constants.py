from typing import Dict

class NotionConstants:
    # OAuth Endpoints
    AUTHORIZATION_URL = "https://api.notion.com/v1/oauth/authorize"
    TOKEN_URL = "https://api.notion.com/v1/oauth/token"
    
    # API Endpoints
    SEARCH_API_URL = "https://api.notion.com/v1/search"
    
    # OAuth Parameters
    REDIRECT_URI = "http://localhost:8000/api/v1/integrations/notion/oauth2callback"
    SCOPE = "all"  # Adjust based on Notion's required scopes
    VERSION = "2022-06-28"
    
    # Redis Key Prefixes
    STATE_KEY_PREFIX = "notion_state"
    VERIFIER_KEY_PREFIX = "notion_verifier"
    CREDENTIALS_KEY_PREFIX = "notion_credentials"
    
    # Expiration Time (in seconds)
    REDIS_EXPIRE_TIME = 600
    
    # HTTP Headers
    AUTH_HEADER = "Basic"
    CONTENT_TYPE = "application/json"

# Export the constants class for use
NOTION_CONSTANTS = NotionConstants()