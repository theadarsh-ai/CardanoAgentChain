# AgentHub Design Guidelines

## Design Approach
**Hybrid System**: Drawing from Linear's precision + Stripe's data clarity + modern crypto platforms (Coinbase, Phantom) for blockchain credibility. This utility-focused marketplace demands clarity over decoration.

## Typography
**Font Stack**:
- Primary: Inter (headers, UI elements) - weights 400, 500, 600, 700
- Monospace: JetBrains Mono (blockchain addresses, transaction IDs, metrics)

**Hierarchy**:
- Page titles: text-4xl/5xl font-bold
- Section headers: text-2xl/3xl font-semibold
- Agent names: text-xl font-semibold
- Body text: text-base font-normal
- Captions/metrics: text-sm font-medium
- Micro text (addresses): text-xs font-mono

## Layout System
**Spacing Primitives**: Use Tailwind units 2, 4, 6, 8, 12, 16, 20
- Component padding: p-6, p-8
- Section spacing: space-y-8, space-y-12
- Grid gaps: gap-6, gap-8
- Container max-width: max-w-7xl

**Grid Patterns**:
- Agent cards: 3-column desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Metrics dashboard: 4-column (grid-cols-2 lg:grid-cols-4)
- System architecture: 2-column split (Hydra L2 | Cardano L1)

## Core Components

**Agent Cards**:
- Rounded borders (rounded-xl)
- Subtle shadow (shadow-sm hover:shadow-md)
- Badge/pill for domain category (top-right)
- Icon (64x64) + Name + Description + Stats row (uses served, avg response)
- "Deploy Agent" CTA button (full-width at bottom)

**Blockchain Panels**:
- Distinct visual treatment for Hydra vs Cardano sections
- Live metrics (TPS, cost, transaction count) in monospace
- Visual indicators for transaction status (pending/confirmed)
- Transaction history table with truncated addresses

**Master Chat Interface**:
- Fixed bottom input bar with @ mention autocomplete
- Message bubbles: user (right-aligned) vs agent responses (left-aligned)
- Agent avatar + name tag on responses
- Inline transaction confirmations when agents collaborate

**Decision Log**:
- Timeline visualization (vertical line with nodes)
- Each entry: timestamp + agent + action + blockchain transaction link
- Expandable details showing full JSON/payload

**Navigation**:
- Left sidebar (fixed, 240px width)
- Category sections: Workflow Automation, Data & Compliance, Customer Support, DeFi Services
- Active state: subtle background highlight + border accent

## Visual Elements

**Blockchain Credibility**:
- Gradient accents (green) for blockchain-specific features
- Masumi DID verified badges (checkmark icon in circle)
- Hydra lightning icon for L2 transactions
- Cardano logo/branding in footer

**Status Indicators**:
- Agent availability: green dot (online), yellow (busy), gray (offline)
- Transaction status: blue (pending), green (confirmed), red (failed)
- DID verification: verified checkmark badge

**Data Visualization**:
- Horizontal bar graphs for agent utilization
- Sparkline charts for transaction volume trends
- Pie chart for platform fee breakdown
- Network topology diagram for agent collaboration (nodes + edges)

## Images

**Hero Section**: 
Large hero image (h-96) showing abstract AI/blockchain visualization - geometric networks, glowing nodes, digital pathways. Overlay with blurred-background buttons for "Deploy Your First Agent" and "Explore Marketplace".

**Agent Icons**:
Use Heroicons library via CDN for agent category icons:
- Workflow: SparklesIcon, EnvelopeIcon
- Data: ShieldCheckIcon, ChartBarIcon  
- Customer: ShoppingBagIcon, SwatchIcon
- DeFi: BanknotesIcon, ArrowTrendingUpIcon

**System Diagrams**:
Custom SVG illustrations for 7-layer architecture showing data flow from User → Master Agent → Registry → Specialists → Hydra → Cardano

## Interaction Patterns

**Agent Discovery**:
- Search bar with instant filtering
- Category filter chips (all active by default)
- Sort options: popularity, cost, response time

**Agent Collaboration Flow**:
- Visual pipeline showing: Request → Analysis → Agent Selection → Execution → Payment → Confirmation
- Animated progress indicators during multi-agent workflows

**Micropayment Feedback**:
- Toast notifications for completed transactions
- Running cost counter in bottom-right during active sessions
- Transaction receipt modal with blockchain explorer link

## Accessibility
- Semantic HTML structure
- ARIA labels for all interactive blockchain elements
- Keyboard navigation for agent selection and deployment
- High contrast for transaction status indicators
- Screen reader announcements for transaction confirmations

## Key Pages Structure

1. **Dashboard/Home**: Hero + Key metrics grid + Featured agents + Recent activity feed
2. **Agent Marketplace**: Category sidebar + Agent cards grid + Filters
3. **Chat Interface**: Full-height chat + Agent context panel
4. **Decision Log**: Timeline view + Transaction details + Blockchain links
5. **System Architecture**: Interactive diagram + Layer descriptions + Tech stack cards