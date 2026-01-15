# SpendSmart 💰

> ⚠️ **This project is currently in active development.** Features may change and some functionality may be incomplete.

A modern, full-stack budget tracking application built to help you take control of your finances with smart insights and an intuitive interface.

## Tech Stack

### Frontend
- **React 19** - The latest version of the generic library
- **TanStack Router** - Type-safe routing for React applications
- **TanStack Query** - Powerful asynchronous state management
- **shadcn/ui** - Beautifully designed, accessible components
- **Tailwind CSS 4** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Better Auth** - Comprehensive authentication client

### Backend
- **Hono** - Ultrafast web framework running on Node.js/Bun
- **Drizzle ORM** - TypeScript ORM for SQL databases
- **PostgreSQL** (Neon) - Serverless Postgres database
- **Better Auth** - Complete authentication solution
- **Nodemailer** - Email sending service for OTPs

### Infrastructure & Tools
- **Bun** - All-in-one JavaScript runtime & toolkit
- **Vite** - Next Generation Frontend Tooling
- **Vercel** - Hosting & deployment platform

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) v1.0.0 or higher
- PostgreSQL database (Neon recommended)
- Gmail account for SMTP (if using email OTPs)

### Installation

```bash
# Clone the repository
git clone https://github.com/swapnil404/SpendSmart.git
cd SpendSmart

# Install dependencies (from root)
bun install
```

### Development

The project consists of a `web` frontend and a `server` backend. You can run them separately.

```bash
# Start the frontend (web)
cd web
bun run dev

# Start the backend (server)
cd server
bun run dev
```

### Environment Variables

You will need to set up `.env` files in both `web` and `server` directories. Check `.env.example` in each directory for required variables.

**Server (`server/.env`)**:
- Database credentials
- Better Auth secret & URL
- Google App Password (`GMAIL_APP_PASSWORD`) for email OTPs

**Web (`web/.env`)**:
- API URL
- Auth URL

## Project Structure

```
├── web/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── routes/
│       └── ...
├── server/       # Hono backend API
│   └── src/
│       ├── db/
│       └── ...
└── README.md
```

## License

MIT
