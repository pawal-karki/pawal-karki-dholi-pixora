# Pixora

A modern platform built with Next.js 15 and Bun.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Framework**: [Next.js 15](https://nextjs.org) - React framework with Turbopack
- **Database**: [Prisma](https://prisma.io) - Type-safe ORM
- **Auth**: [Clerk](https://clerk.com) - Authentication
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- **UI**: [shadcn/ui](https://ui.shadcn.com) - Re-usable components
- **File Upload**: [UploadThing](https://uploadthing.com) - File uploads

## Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- PostgreSQL database

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `UPLOADTHING_TOKEN` - UploadThing API token
- `JWT_SECRET` - Secret for JWT tokens

### 3. Set up the database

```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# (Optional) Open Prisma Studio
bun run db:studio
```

### 4. Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with Turbopack |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Fix ESLint errors |
| `bun run format` | Format code with Prettier |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:push` | Push schema changes to database |
| `bun run db:migrate` | Run database migrations |
| `bun run db:studio` | Open Prisma Studio |
| `bun run clean` | Clean build artifacts |

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (main)/         # Main app routes
│   ├── api/            # API routes
│   └── site/           # Public site
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── forms/         # Form components
│   └── global/        # Global components
├── lib/               # Utility functions
├── hooks/             # Custom React hooks
└── providers/         # Context providers
```

## Deployment

### Vercel (Recommended)

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Docker

```bash
# Build
docker build -t pixora .

# Run
docker run -p 3000:3000 pixora
```

## License

MIT
