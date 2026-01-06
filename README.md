# SpendSmart 💰

> ⚠️ **This project is currently in active development.** Features may change and some functionality may be incomplete.

A modern, full-stack budget tracking application built to help you take control of your finances with smart insights and an intuitive interface.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **TanStack Router** for type-safe routing
- **TanStack Query** for data fetching & caching
- **shadcn/ui** - Beautifully designed components
- **Tailwind CSS** for styling
- **Recharts** for data visualization

### Backend
- **Hono** - Ultrafast web framework
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure token-based auth

### Infrastructure
- **Vercel** - Hosting & deployment
- **Bun** - JavaScript runtime & package manager

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) v1.3.0 or higher
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spendsmart.git
cd spendsmart

# Install dependencies
bun install
```

### Development

```bash
# Start the frontend (web)
cd web
bun run dev

# Start the backend (server)
cd server
bun run dev
```

## Project Structure

```
├── web/          # React frontend
│   └── src/
│       ├── components/
│       └── ...
├── server/       # Hono backend API
│   └── src/
└── README.md
```

## License

MIT
