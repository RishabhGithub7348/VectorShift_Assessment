from typing import Dict

class HubSpotConstants:
    # OAuth Endpoints
    AUTHORIZATION_URL = "https://app.hubspot.com/oauth/authorize"
    TOKEN_URL = "https://api.hubapi.com/oauth/v1/token"
    
    # API Endpoints
    CONTACTS_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts"
    
    # OAuth Parameters
    REDIRECT_URI = "http://localhost:8000/api/v1/integrations/hubspot/oauth2callback"
    SCOPE = "crm.objects.contacts.read crm.objects.contacts.write crm.schemas.custom.read"
    CODE_CHALLENGE_METHOD = "S256"
    
    # Redis Key Prefixes
    STATE_KEY_PREFIX = "hubspot_state"
    VERIFIER_KEY_PREFIX = "hubspot_verifier"
    CREDENTIALS_KEY_PREFIX = "hubspot_credentials"
    
    # Expiration Time (in seconds)
    REDIS_EXPIRE_TIME = 600
    
    # HTTP Headers
    CONTENT_TYPE = "application/x-www-form-urlencoded"

# Export the constants class for use
HUBSPOT_CONSTANTS = HubSpotConstants()