# VectorShift Frontend README

## Overview
```text
The VectorShift frontend is a Next.js application built with the App Router, utilizing pnpm as the package manager. It integrates with the VectorShift backend to manage OAuth-based connections to services like HubSpot, Airtable, and Notion. The app features a dynamic dashboard, token caching with a 1-hour expiration using `localStorage`, and a responsive UI styled with Tailwind CSS and `shadcn/ui`. It employs custom hooks and context providers for efficient state management, with proxy routing to the backend to avoid CORS issues.
```

## Project Features
```text
- OAuth Integration: Popup-based authorization with dynamic routing for each integration
- Token Caching: Stores `access_token` in `localStorage` with a 1-hour expiration to minimize backend fetches
- State Management: Uses `IntegrationContext` with `useLocalStorage` for persistent integration states
- Proxy Routing: Configures API calls to proxy to the backend via `axios` or middleware
- Responsive UI: Styled with Tailwind CSS and `shadcn/ui` components
```

## Prerequisites
```text
- Node.js 18+: Ensure Node.js 18 or higher is installed
- pnpm: Install globally (`npm install -g pnpm`) or use `corepack enable` if using Node 18+
- Git: For cloning the repository
- VectorShift Backend: Running at `http://localhost:8000/api/v1` (or your backend URL)
- Optional: IDE (e.g., VSCode) with TypeScript support
```

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vectorshift-frontend.git
cd vectorshift-frontend
```

### 2. Install Dependencies with pnpm
```bash
pnpm install
```

### 3. Configure Environment Variables
#### Create `.env` file
```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```
```text
This sets the backend API base URL for proxying API requests.
```

## File Structure
```text
vectorshift-frontend/
├── app/                     # Next.js app directory with App Router
│   ├── (integration)/       # Integration management routes
│   │   ├── dashboard/       # Dashboard for all integrations
│   │   │   ├── page.tsx     # Dashboard page with IntegrationForm
│   │   │   └── [integration]/  # Dynamic integration page
│   │   │       └── page.tsx    # Dynamic integration page
│   │   └── layout.tsx       # Shared layout for integration routes
│   ├── layout.tsx           # Root layout with Navbar and theme provider
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── integration-card.tsx # Card component for displaying integrations
│   ├── integration-form.tsx # Form component for selecting and managing integrations
│   ├── integration-list.tsx # Sidebar list of integrations
│   ├── data-form.tsx        # Component for loading integration data
│   ├── navbar.tsx           # Navbar with theme toggle and navigation
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx       # Button component
│       └── input.tsx        # Input component
├── integrations/            # Integration-specific logic
│   ├── hubspot.js           # HubSpot integration component
│   ├── airtable.js          # Airtable integration component
│   └── notion.js            # Notion integration component
├── config/                  # Configuration files
│   ├── axios.ts             # Axios instance for API calls
│   └── query.ts             # TanStack Query hooks for integrations
├── types/                   # TypeScript type definitions
│   └── integration.types.ts # Types for integration data
├── hooks/                   # Custom hooks
│   └── useLocalStorage.ts   # Local storage with 1-hour token expiration
├── providers/               # Context providers
│   └── integration-context.tsx # Integration state management
├── public/                  # Static assets
│   ├── favicon.ico          # Favicon for the app
├── styles/                  # Global styles
│   └── globals.css          # Tailwind CSS and custom styles
├── package.json             # Project dependencies and scripts
├── pnpm-lock.yaml           # pnpm lockfile
├── .env                     # Environment variables (ignored by git)
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## Detailed File Breakdown
```text
- app/:
  - (integration)/dashboard/page.tsx: Displays the integration dashboard with IntegrationForm
  - (integration)/[integration]/page.tsx: Dynamic page for individual integrations
  - (integration)/layout.tsx: Shared layout for integration routes
  - layout.tsx: Root layout with Navbar and theme provider
  - page.tsx: Landing page for the app
- components/:
  - integration-card.tsx, integration-form.tsx, integration-list.tsx, data-form.tsx, navbar.tsx: Reusable UI components
  - ui/: shadcn/ui components (button.tsx, input.tsx) for styled inputs
- integrations/:
  - hubspot.js, airtable.js, notion.js: Logic for each integration’s OAuth and data handling
- config/:
  - axios.ts: Configures Axios with the backend URL, handling proxy routing
  - query.ts: Sets up TanStack Query for data fetching
- types/:
  - integration.types.ts: Defines types for integration states and API responses
- hooks/:
  - useLocalStorage.ts: Custom hook for storing access_token with a 1-hour expiration
- providers/:
  - integration-context.tsx: Provides IntegrationContext using useLocalStorage
```

## Running the Application

### 1. Start the Backend
```bash
uvicorn src.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Frontend
```bash
pnpm dev
```
