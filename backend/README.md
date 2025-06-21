# VectorShift Backend README

## Overview
```text
FastAPI-based backend for VectorShift, handling integrations with HubSpot, Airtable, and Notion. Supports OAuth authorization, credential management, and data retrieval with a middleware-based context system (VectorShiftContextMiddleware) for user and organization authentication.
```

## Project Features
```text
- OAuth Integration: Authorization and callback handling for HubSpot, Airtable, Notion
- Credential Management: Secure retrieval and management of integration credentials
- Data Retrieval: Fetch items from integrated services using credentials
- Standardized Responses: MSResponse format (success, data, errors) with customizable status codes
- Middleware: VectorShiftContextMiddleware for request scoping with user_id and org_id, including Redis initialization
```

## Prerequisites
```text
- Python 3.12
- Virtual Environment
- pip
- Git
- Optional: IDE (e.g., VSCode) with Pylance for type checking
```

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vectorshift-backend.git
cd vectorshift-backend
```

### 2. Set Up Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### Example `requirements.txt`
```text
fastapi==0.111.0
uvicorn==0.30.0
pydantic==2.7.0
anyio==4.3.0
python-dotenv==1.0.1
```

### 4. Configure Environment Variables
#### Create `.env` file
```text
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
AIRTABLE_API_KEY=your_airtable_api_key
NOTION_API_KEY=your_notion_api_key
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
APP_PORT=8000  # Port configuration
```

## File Structure
```text
vectorshift-backend/
│
├── src/                    # Main source code directory
│   ├── app/                # Application logic
│   │   ├── routes.py       # Route definitions and URL mapping
│   ├── config/             # Configuration settings
│   │   ├── __init__.py     # Package initializer
│   │   ├── config.py       # Environment variable settings
│   │   ├── constants/      # Integration constants
│   │   │   ├── __init__.py # Package initializer
│   │   │   ├── airtable_constants.py
│   │   │   ├── hubspot_constants.py
│   │   │   ├── notion_constants.py
│   ├── controllers/        # Business logic controllers
│   │   ├── hubspot_controller.py  # HubSpot integration endpoints
│   │   ├── airtable_controller.py # Airtable integration endpoints
│   │   ├── notion_controller.py   # Notion integration endpoints
│   ├── db/                 # Database interactions (e.g., Redis)
│   │   ├── __init__.py     # Redis client initialization
│   ├── middleware/         # Middleware implementations
│   │   ├── context.py      # VectorShiftContextMiddleware definition
│   ├── models/             # Pydantic models
│   │   ├── __init__.py     # Package initializer
│   │   ├── integration_item.py   # Integration item model
│   ├── oplog/              # Operation logging
│   │   ├── __init__.py     # Package initializer
│   │   ├── error.py
│   │   ├── oplog.py
│   ├── repositories/       # Data access layer
│   ├── __init__.py         # Package initializer
├── venv/                   # Virtual environment (ignored by git)
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (ignored by git)
├── .gitignore              # Git ignore file
├── main.py                # Entry point to run the app
├── README.md               # This file
```

## Running the Application

### 1. Activate Virtual Environment
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Run with Python
```bash
python main.py
```
```text
- This runs the application using the uvicorn server as configured in main.py.
- The port is set via config.APP_PORT from the .env file (default 8000 if not specified).
- --reload is enabled for development as per the main.py configuration.
```

### 3. Verify
```text
- Open http://localhost:8000
- Expect {"message": "Welcome to VectorShift Backend API. Use /api/v1/integrations/... for endpoints."} at the root.
- Test endpoints (e.g., /api/v1/integrations/hubspot/authorize) with user_id, org_id
```

## API Endpoints
```text
All endpoints prefixed with /api/v1. Examples:
- HubSpot:
  - POST /integrations/hubspot/authorize: Initiate OAuth (user_id, org_id as form data)
  - GET /integrations/hubspot/oauth2callback: Handle OAuth callback (code, state as query params)
  - POST /integrations/hubspot/credentials: Retrieve credentials (user_id, org_id)
  - POST /integrations/hubspot/items: Fetch items (credentials as JSON string)
- Airtable & Notion: Similar endpoints with /airtable/, /notion/ prefixes
```

## Request/Response Format
```text
- Request: Form data for user_id, org_id, credentials
- Response: MSResponse format
  - success: bool
  - data: any (e.g., {"auth_url": "https://..."}, credentials)
  - errors: string[]
  - Status codes: 200, 400, etc.
```

## Troubleshooting
```text
- 500 Internal Server Error:
  - Check logs for TypeError (e.g., argument mismatch)
  - Ensure controller/service signatures align (e.g., pass request to oauth2callback_hubspot)
- Missing Environment Variables:
  - Verify .env file and restart app
- CORS Issues:
  - Add CORSMiddleware to main.py:
```
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"])
```

## Development Guidelines
```text
- Coding Standards: Use type hints, follow PEP 8
- Testing: Add unit tests in tests/ using pytest
- Dependencies: Update requirements.txt with new packages
- Logging: Use logging module for structured logs
```

## Contributing
```bash
git checkout -b feature/xyz
git commit -m "Add feature xyz"
git push origin feature/xyz
# Open PR on GitHub
```

## License
```text
[Specify license, e.g., MIT] - Add LICENSE file if needed
```

## Last Updated
```text
10:59 PM IST, Saturday, June 21, 2025
```
