# GeneratedApp

Full-stack application built autonomously by [AINative Agent Swarm](https://ainative.studio).
Uses AINative ZeroDB for storage and AINative Auth for user management.

## Features

- **Dashboard**
- **Admin Panel**

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- AINative account at [ainative.studio](https://ainative.studio)

### Setup

1. **Get your AINative credentials**
   - API Key: Settings → API Keys
   - Project ID: Dashboard → Projects

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your AINative API Key and Project ID
   ```

3. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm start
   # Opens at http://localhost:3000
   ```

4. **Start the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   # API at http://localhost:8000
   ```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, @ainative/react-sdk |
| Backend | FastAPI, Python 3.11, httpx |
| Database | AINative ZeroDB (REST API, no setup needed) |
| Auth | AINative Auth API (JWT) |
| Hosting | Any platform (Railway, Vercel, Fly.io) |

## AINative SDK

This app uses [`@ainative/react-sdk`](https://ainative.studio/docs/sdk) for all AI and memory features:

```jsx
import { useChat, useMemory, useCredits } from '@ainative/react-sdk';
```

The SDK wraps the AINative API — no direct fetch calls needed in components.

## API Documentation

Backend auto-generates OpenAPI docs at `http://localhost:8000/docs`

## Powered By

Built with [AINative Agent Swarm](https://ainative.studio) — autonomous technical co-founder.
