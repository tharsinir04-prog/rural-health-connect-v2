# Rural Health Connect

Connect. Consult. Care.

A mobile-first rural healthcare coordination platform for Maharashtra. The project includes React/TypeScript/PWA frontend, Express/TypeScript backend, PostgreSQL + Prisma, JWT roles, Socket.IO signaling/realtime events, Leaflet/OpenStreetMap, offline IndexedDB queue, referral tracking, medicine stock, emergency workflow, WebRTC consultation scaffolding, multilingual UI, and configurable Bhashini/SMS adapters.

## Run locally

Requirements: Node.js 22+ and Docker.

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL:
   `docker compose up -d postgres`
3. Install:
   `npm install`
4. Generate Prisma:
   `npm run db:generate`
5. Create/apply development migration:
   `npm run db:migrate`
6. Seed demo data:
   `npm run db:seed`
7. Start both apps:
   `npm run dev`

Frontend: http://localhost:5173
Backend: http://localhost:4000

### Demo accounts

Seeded credentials are intentionally documented here rather than embedded in the UI:

- Patient: patient@demo.local / Patient@123
- ASHA: asha@demo.local / Asha@123
- Doctor: doctor@demo.local / Doctor@123
- Admin: admin@demo.local / Admin@123

Change these passwords before any real deployment.

## External services

Bhashini and SMS are adapters. If credentials are absent, the app returns an explicit demo/text fallback; it never claims a real external call succeeded.

Real healthcare inventory, ambulance dispatch and government eligibility verification are not fabricated. Seeded facilities/stock are marked DEMO DATA.

## Security

JWTs, bcrypt hashing, role checks, input validation, rate limiting, helmet, CORS, audit logging and protected patient routes are included. This repository is a hackathon implementation, not a production-certified medical system. Before real deployment, add professional security review, secret management, backups, monitoring, consent policy, encryption/key management, and jurisdiction-specific compliance.