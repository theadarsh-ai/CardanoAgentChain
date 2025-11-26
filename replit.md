# AgentHub - AI Agent Marketplace on Cardano

## Overview

AgentHub is an AI-powered agent marketplace built on the Cardano blockchain, featuring eight specialized AI agents across four domains (Workflow Automation, Data & Compliance, Customer Support, and DeFi Services). The platform leverages Cardano Layer 1 for final settlement and reputation management, while utilizing Hydra Layer 2 state channels for instant micropayments between agents. Agents collaborate autonomously using natural language interfaces, with all decisions and transactions logged on-chain for transparency.

The application provides a master chat interface where users can interact with multiple AI agents simultaneously using @ mentions. The system automatically routes requests to appropriate specialized agents, who can then collaborate with each other while processing transactions through Hydra's high-throughput layer.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Hybrid Frontend/Backend Architecture

**Frontend Stack**: React + TypeScript with Vite as the build tool. Uses Wouter for client-side routing instead of React Router. UI components built with Radix UI primitives and styled using Tailwind CSS with shadcn/ui component library following the "new-york" style preset.

**Backend Architecture**: Dual-stack approach with Node.js/Express (TypeScript) handling API routing and static file serving, while a Python Flask backend manages AI agent logic, database operations, and OpenAI integrations. The Node.js server acts as a reverse proxy, forwarding `/api/*` requests to the Python backend running on port 5001.

**Rationale**: This separation allows leveraging Python's superior AI/ML ecosystem (OpenAI SDK, agent frameworks) while maintaining a modern TypeScript development experience for the web application layer. The proxy pattern enables independent scaling and development of each backend component.

### Database Layer

**PostgreSQL with Drizzle ORM**: Uses Neon serverless PostgreSQL via `@neondatabase/serverless` driver with WebSocket support for connection pooling. Schema defined in TypeScript using Drizzle ORM's declarative API.

**Schema Design**: Six core tables:
- `users`: Basic authentication (username/password)
- `agents`: AI agent definitions with system prompts, performance metrics, verification status
- `conversations`: Chat sessions
- `messages`: Individual messages within conversations (links to agents when applicable)
- `transactions`: Hydra L2 micropayment records between agents
- `decision_logs`: On-chain audit trail of agent decisions and collaborations

**Dual Implementation**: Both Python (using psycopg2 with RealDictCursor) and Node.js (using Drizzle) can access the database, though the Python backend primarily handles data operations in the current architecture.

### AI Integration

**OpenAI GPT-4o**: All agent intelligence powered by OpenAI's chat completion API. Each agent has a unique system prompt defining its specialty, personality, and capabilities.

**Master Agent Pattern**: A coordinator agent analyzes user requests to determine which specialized agents should handle them. Supports multi-agent collaboration where agents can "hire" each other (e.g., SocialGenie hiring StyleAdvisor for visual recommendations).

**Conversation History**: Maintains last 10 messages of context per conversation to enable coherent multi-turn interactions.

### Blockchain Integration (Design Layer)

**Cardano Layer 1**: Designed for final settlement, agent reputation storage, and compliance record immutability. Uses Plutus/Aiken smart contracts (referenced in design but not implemented in current codebase).

**Hydra Layer 2**: State channels for instant micropayments (~$0.004 per transaction) with 1000+ TPS throughput and sub-1-second finality. Currently simulated in the application layer with mock transaction hash generation.

**Masumi Network**: Referenced for agent marketplace discovery, service registry, and reputation system (design phase, not yet implemented).

**Implementation Status**: The blockchain components are currently architectural concepts reflected in the UI/UX and data models, with transaction and decision logging prepared for future on-chain integration.

### Design System

**Typography**: Inter for UI elements (400-700 weights), JetBrains Mono for blockchain addresses and metrics. Hierarchy ranges from text-4xl/5xl for page titles to text-xs for monospaced addresses.

**Layout System**: Tailwind spacing primitives (2, 4, 6, 8, 12, 16, 20 units). Responsive grid patterns: 3-column agent cards, 4-column metrics dashboard, 2-column blockchain panels.

**Color System**: Custom HSL-based theme with CSS variables for light/dark mode support. Gradient backgrounds (purple-to-pink, blue-to-cyan) distinguish Hydra and Cardano layers.

**Component Philosophy**: Hybrid approach drawing from Linear's precision, Stripe's data clarity, and modern crypto platforms (Coinbase, Phantom) for blockchain credibility.

## External Dependencies

### Core Infrastructure

- **Neon PostgreSQL**: Serverless Postgres database with WebSocket connection pooling
- **OpenAI API**: GPT-4o model for all agent intelligence and natural language processing
- **Replit Platform**: Development environment with custom Vite plugins for runtime error overlay and cartographer integration

### UI Framework

- **Radix UI**: Headless component primitives (accordion, dialog, dropdown, toast, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **shadcn/ui**: Pre-built component library following "new-york" style preset
- **Lucide React**: Icon library for UI elements

### Backend Libraries

- **Express**: Node.js web server for routing and static file serving
- **Flask**: Python web framework for AI agent API endpoints
- **CORS**: Cross-origin resource sharing middleware
- **psycopg2**: PostgreSQL adapter for Python backend

### State Management

- **TanStack Query (React Query)**: Server state management with automatic caching, refetching (5-second intervals for transactions/logs)
- **Wouter**: Minimal client-side routing library

### Build Tools

- **Vite**: Frontend build tool and development server
- **esbuild**: Server-side bundling with selective dependency bundling to optimize cold start times
- **tsx**: TypeScript execution for development server
- **Drizzle Kit**: Database migration tool

### Blockchain (Future Integration)

- **Cardano**: Layer 1 settlement (Plutus/Aiken smart contracts)
- **Hydra**: Layer 2 state channels for micropayments
- **Masumi Network**: Agent discovery and reputation system