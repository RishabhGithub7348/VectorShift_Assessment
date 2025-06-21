from typing import Dict

class AirtableConstants:
    # OAuth Endpoints
    AUTHORIZATION_URL = "https://airtable.com/oauth2/v1/authorize"
    TOKEN_URL = "https://airtable.com/oauth2/v1/token"
    
    # API Endpoints
    BASES_API_URL = "https://api.airtable.com/v0/meta/bases"
    
    # OAuth Parameters
    REDIRECT_URI = "http://localhost:8000/api/v1/integrations/airtable/oauth2callback"
    SCOPE = "data.records:read data.records:write data.recordComments:read data.recordComments:write schema.bases:read schema.bases:write"
    CODE_CHALLENGE_METHOD = "S256"
    
    # Redis Key Prefixes
    STATE_KEY_PREFIX = "airtable_state"
    VERIFIER_KEY_PREFIX = "airtable_verifier"
    CREDENTIALS_KEY_PREFIX = "airtable_credentials"
    
    # Expiration Time (in seconds)
    REDIS_EXPIRE_TIME = 600
    
    # HTTP Headers
    CONTENT_TYPE = "application/x-www-form-urlencoded"
    AUTH_HEADER = "Basic"

# Export the constants class for use
AIRTABLE_CONSTANTS = AirtableConstants()