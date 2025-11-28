# AgentHub - AI Agent Marketplace on Cardano

## Overview

AgentHub is an AI-powered agent marketplace built on the Cardano blockchain, featuring eight specialized AI agents across four domains (Workflow Automation, Data & Compliance, Customer Support, and DeFi Services). The platform provides a master chat interface where users can interact with multiple AI agents simultaneously.

## System Architecture

### Hybrid Frontend/Backend Architecture

- **Frontend**: React + TypeScript with Vite, using Wouter for client-side routing. UI built with Radix UI primitives and styled using Tailwind CSS with shadcn/ui components.

- **Backend**: Dual-stack approach:
  - Node.js/Express (TypeScript) handles API routing, static file serving, and acts as reverse proxy
  - Python Flask backend manages AI agent logic, database operations, and OpenAI integrations
  - Node.js server proxies `/api/*` requests to Python backend on port 5001

### Database

PostgreSQL database using Drizzle ORM. Core tables:
- `agents`: AI agent definitions with system prompts and performance metrics
- `conversations`: Chat sessions
- `messages`: Individual messages within conversations
- `transactions`: Hydra L2 micropayment records
- `decision_logs`: On-chain audit trail of agent decisions

### AI Integration

OpenAI GPT-4o powers all agent intelligence. Each agent has a unique system prompt defining its specialty and capabilities.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (sidebar, chat, cards, etc.)
│   │   ├── pages/          # Route pages (home, marketplace, chat, agent, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and query client
├── python_backend/         # Flask backend
│   ├── app.py              # Main Flask application
│   ├── agents.py           # Agent definitions
│   ├── models.py           # Database models
│   └── openai_service.py   # OpenAI integration
├── server/                 # Node.js/Express server
│   ├── index.ts            # Main server entry point
│   ├── routes.ts           # API route proxy to Python
│   └── vite.ts             # Vite dev server setup
└── shared/                 # Shared TypeScript types
    └── schema.ts           # Database schema definitions
```

## Running the Project

The workflow runs `npm run dev` which:
1. Starts the Python Flask backend on port 5001
2. Starts the Node.js/Express server on port 5000
3. Serves the React frontend via Vite in development mode

## Environment Variables

Required secrets:
- `OPENAI_API_KEY`: OpenAI API key for AI agent responses
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)

Optional blockchain API keys (for live blockchain integration):
- `BLOCKFROST_API_KEY`: Blockfrost.io API key for Cardano blockchain access
- `CARDANO_NETWORK`: Network to use - "preprod" (default), "preview", or "mainnet"
- `MASUMI_API_KEY`: Masumi Network API key for agent discovery and reputation
- `MASUMI_NETWORK_URL`: Masumi Network URL (defaults to https://api.masumi.network)
- `HYDRA_NODE_URL`: URL to Hydra node for Layer 2 payments (defaults to http://localhost:4001)
- `HYDRA_API_KEY`: API key for Hydra node authentication (optional)

## Recent Changes

- **November 2025**: Initial GitHub import and Replit setup
  - Fixed Python backend syntax errors in app.py
  - Added agent details page for sidebar navigation
  - Configured workflow and deployment settings
  - Implemented production-ready blockchain integration:
    - Cardano L1: DID registration, credential verification, decision logging, payments
    - Masumi Network: Agent discovery, reputation management, service agreements
    - Hydra L2: Payment channels, instant micropayments, fee estimation
  - All blockchain services work in simulation mode without API keys
  - When API keys are provided, services connect to live blockchain networks
  - Applied professional emerald/teal Cardano theme across entire UI:
    - Dark mode default with neutral slate backgrounds (HSL 220 15% 6-9%)
    - Primary color: emerald-500 (HSL 158 60-64% 38-40%) for buttons, accents, and highlights
    - Secondary accents: teal-500/teal-600 for gradients and icons
    - Glow effects removed in favor of subtle shadows
    - Hero section features background image with dark overlay
    - All components use consistent, subdued color palette
  - Implemented dual chat system:
    - Dedicated AgentHub Assistant page at /chat for general AI assistance
    - Individual agent chat panels slide in from the right sidebar when deploying agents
    - AgentChatContext manages active agent chat state across the app
    - "Deploy Agent" button both deploys the agent AND opens its chat panel

## Deployment

Configured for VM deployment to keep the Python backend process running continuously.
- Build: `npm run build`
- Start: `npm run start`
