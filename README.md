# ChatWithSocketIO

Real-time chat with user auth, room management, and message history. Built as a small, end-to-end demo that recruiters can skim and run quickly.

## Highlights

- Email/password auth with JWT and protected routes (frontend guard + backend middleware).
- Room-based chat over Socket.IO with typing indicators and persisted history (SQLite via Prisma).
- Room discovery and deep-linking: share `?room=` URLs to jump straight into a conversation.
- Simple UX to register, log in, and start chatting in under a minute.

## Tech Stack

- Frontend: React 19 + Vite, TypeScript, socket.io-client, React Router.
- Backend: Node.js/Express, Socket.IO, Prisma ORM (SQLite), JSON Web Tokens.

## Run It Locally

Prereqs: Node 18+ and npm.

1. Backend

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-secret"
```

If you want a fresh DB: `npx prisma migrate reset` (or `npx prisma migrate dev`).  
Start the API and WebSocket server: `npm run dev` (listens on http://localhost:3000).

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (default http://localhost:5173). Register, then log in to access `/chat`.

## How It Works

- Login/Register hits `/auth/login` and `/auth/register`; responses return a JWT + user payload stored in `localStorage`.
- The frontend attaches the JWT to the Socket.IO handshake; the server validates it before joining rooms.
- Messages are persisted with Prisma; last 50 messages per room are replayed when someone joins.
- Typing events and join/leave notifications are broadcast to everyone in the room.
