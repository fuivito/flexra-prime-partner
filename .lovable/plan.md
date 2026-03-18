
# Flexra MVP — Phase 1: UI Shell & Core Flows

## Overview
Build the complete UI framework for a premium finance platform with two separate portals (Broker & Policyholder), using mock data and local state. Professional, sleek, and modern design — think clean typography, subtle shadows, plenty of whitespace, with a refined color palette (deep navy primary, cool grays, crisp whites, accent color for CTAs).

---

## 1. Landing & Authentication Pages
- **Landing page** at `/` — brief product overview with two clear CTAs: "Broker Login" and "Policyholder Login"
- **Broker login page** at `/broker/login` — email/password form (mock auth, stores role in local state)
- **Policyholder login page** at `/portal/login` — email/password form (mock auth)
- Role-based route protection redirecting unauthorized users

## 2. B2B Portal — Broker Experience (`/broker/*`)
### Layout
- Collapsible sidebar with navigation: Dashboard, Clients, New Deal, Agreements
- Top header with user info and logout

### Dashboard (`/broker/dashboard`)
- Overview cards: Active Agreements count, Total Financing Volume, Pending Deals
- Recent activity feed (mock data)
- Agreements table with status filters and client name search

### Client Management (`/broker/clients`)
- Client list with search functionality
- Add new client form (manual entry with fields: company name, contact person, email, phone, business type)
- Mock PDF drop zone (visual only, no processing)
- Client profile page (`/broker/clients/:id`) showing client details and linked agreements

### Deal Builder (`/broker/deals/new`)
- Multi-step form flow:
  - **Step 1**: Select existing client from dropdown
  - **Step 2**: Policy details — premium amount, policy period, insurer name
  - **Step 3**: Configure terms — down payment %, instalment count (6 or 12 months)
  - **Step 4**: Review — auto-calculated instalment schedule with dates and amounts
- Create agreement action → redirects to agreement detail page
- Agreement detail page (`/broker/agreements/:id`) showing full breakdown

## 3. B2C Portal — Policyholder Experience (`/portal/*`)
### Layout
- Clean sidebar with navigation: Dashboard, Payments, Profile

### Dashboard (`/portal/dashboard`)
- Current agreements overview cards
- Upcoming payment schedule (next 3 payments)
- Visual progress: total financed vs remaining balance (progress bar)

### Payment Management (`/portal/payments`)
- Full instalment schedule table with dates and amounts
- Payment history list with status indicators (paid, upcoming, overdue)
- Instalment adjustment feature: edit individual amounts while keeping total constant (rebalances remaining instalments)

### Profile (`/portal/profile`)
- View/edit form: name, email, phone, business details
- List of linked financing agreements with links to details

## 4. Shared Foundation
- Mock data store with realistic sample data (3-4 clients, 5-6 agreements, payment schedules)
- Instalment calculator utility (computes schedule from premium, down payment %, and term)
- Consistent design system: refined color palette, card-based layouts, clean tables
- Fully mobile responsive across all pages
- Toast notifications for actions (agreement created, profile updated, etc.)
- Form validation on all inputs with clear error messages
