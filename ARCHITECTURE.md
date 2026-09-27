# Architecture notes

- React/Vite frontend in `client`
- Express/TypeScript API in `server`
- PostgreSQL schema in `server/prisma/schema.prisma`
- Shared lightweight types in `shared`
- IndexedDB queues offline operations and retries on reconnect
- Socket.IO provides doctor availability, referral events, emergency events, and WebRTC signaling
- WebRTC media is peer-to-peer; the server is signaling only
- Bhashini and SMS are adapters and never receive secrets from the browser
- Seeded Maharashtra-style locations are explicitly demo data
- Referral delay worker changes only referrals whose expectedBy has passed; it does not infer why the delay happened
