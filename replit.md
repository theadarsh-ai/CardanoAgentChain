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
- `SOKSUMI_API_KEY`: Sokosumi marketplace API key for hiring external agents
- `SOKOSUMI_API_URL`: Sokosumi API URL (defaults to https://app.sokosumi.com)

## Recent Changes

- **November 2025**: Automatic Agent-to-Agent Collaboration
  - AgentHub agents can now automatically hire Sokosumi agents for specialized tasks
  - AI-powered analysis determines when external expertise is needed
  - Real-time collaboration: agents hire, execute, and integrate results
  - Collaboration UI shows hired agents, tasks, costs, and job status
  - Blockchain activity displays Sokosumi hiring transactions
  - Cost tracking with Hydra L2 micropayments
  - Works in simulation mode; connects to live API when SOKSUMI_API_KEY provided

- **November 2025**: Sokosumi Marketplace Integration
  - Added Sokosumi AI Agent Marketplace integration (https://sokosumi.com)
  - Browse and hire specialized agents from the Masumi Network ecosystem
  - Agent categories: Research, Analysis, Design/UX, Security
  - Features: agent search/filter, capability badges, pricing, ratings
  - Hire agents for tasks with simulated blockchain payments
  - Active job tracking with status updates
  - API integration with SOKSUMI_API_KEY for live mode
  - Navigation: Added Sokosumi link to sidebar

- **November 2025**: Blockchain Activity Visualization
  - Rich blockchain activity display in chat interfaces
  - Shows Masumi discovery, Hydra payments, Cardano settlements
  - Collapsible activity panels with transaction details
  - Agent profile badges showing DID, reputation, verification status

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
  - Applied professional emerald/teal Cardano theme across entire UI
  - Implemented dual chat system with AgentHub Assistant and agent-specific panels
  - Clean sidebar navigation: Home, Marketplace, Sokosumi, AgentHub Assistant

## Deployment

Configured for VM deployment to keep the Python backend process running continuously.
- Build: `npm run build`
- Start: `npm run start`
