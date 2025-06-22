# VectorShift_Assessment

A full-stack application for managing OAuth-based integrations with popular services like HubSpot, Airtable, and Notion. Built with Next.js frontend and FastAPI backend.

## 🚀 Features
```text
- OAuth Integration: Seamless authorization with HubSpot, Airtable, and Notion
- Token Management: Secure credential storage with automatic token refresh
- Real-time Dashboard: Dynamic interface for managing all integrations
- Responsive Design: Modern UI built with Tailwind CSS and shadcn/ui
- State Management: Persistent integration states with local storage caching
- API Proxy: CORS-free backend communication through Next.js API routes
```

## 🏗️ Architecture
```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   FastAPI       │    │   External      │
│   Frontend      │◄──►│   Backend       │◄──►│   Services      │
│   (Port 3000)   │    │   (Port 8000)   │    │   (OAuth)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend (Next.js)
```text
- Framework: Next.js 14 with App Router
- Styling: Tailwind CSS + shadcn/ui components
- State Management: React Context + localStorage hooks
- Package Manager: pnpm
```

### Backend (FastAPI)
```text
- Framework: FastAPI with async support
- Authentication: OAuth 2.0 flow handling
- Database: Redis for session management
- Middleware: Custom user/organization context
```

## 📋 Prerequisites
```text
- Node.js 18+
- Python 3.12+
- pnpm (install with `npm install -g pnpm`)
- Git
- Redis (optional, for backend session management)
```

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vectorshift.git
cd vectorshift
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
#### Create `backend/.env`:
```env
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
AIRTABLE_API_KEY=your_airtable_api_key
NOTION_API_KEY=your_notion_api_key
REDIS_HOST=localhost
REDIS_PORT=6379
APP_PORT=8000
```
#### Start the backend:
```bash
python main.py
```

### 3. Frontend Setup
```bash
cd ../frontend
pnpm install
```
#### Create `frontend/.env`:
```env
V1_API_ENDPOINT=http://localhost:8000/api/v1
```
#### Start the frontend:
```bash
pnpm dev
```

### 4. Access the Application
```text
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
```

## 📁 Project Structure
```text
vectorshift/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── (integration)/   # Integration routes
│   │   └── dashboard/       # Main dashboard
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── providers/          # Context providers
│   └── types/              # TypeScript definitions
│
├── backend/                 # FastAPI application
│   └── src/
│       ├── app/            # Application core
│       ├── controllers/    # API route handlers
│       ├── models/         # Pydantic models
│       ├── middleware/     # Custom middleware
│       └── config/         # Configuration settings
│
└── README.md               # This file
```

## 🔌 Supported Integrations
```text
Service         OAuth  Data Sync  Status
HubSpot         ✅      ✅         Active
Airtable        ✅      ✅         Active
Notion          ✅      ✅         Active
```

## 🌐 API Endpoints

### Authentication
```text
- POST /api/v1/integrations/{service}/authorize - Initiate OAuth flow
- GET /api/v1/integrations/{service}/oauth2callback - Handle OAuth callback
- POST /api/v1/integrations/{service}/credentials - Retrieve stored credentials
```

### Data Operations
```text
- POST /api/v1/integrations/{service}/items - Fetch integration data
```

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env`)
```env
V1_API_ENDPOINT=http://localhost:8000/api/v1
```

#### Backend (`.env`)
```env
# OAuth Credentials
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
AIRTABLE_API_KEY=your_api_key
NOTION_API_KEY=your_api_key

# Database
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Server
APP_PORT=8000
```


