# NyasaCars 🚗

A multi-tenant car marketplace platform built for the Malawian market. Sellers get their own minishop, list cars, run ads, and get noticed — all without needing a sales team.

## Features

- **Multi-tenant marketplaces** — Each seller gets a customizable minishop at `/sellers/[shop-slug]`
- **Car listings** — Full listings with photos, specs, features, and search/filter
- **Subscription tiers** — Free (3 listings), Pro $15/mo (15 listings), Premium $50/mo (unlimited)
- **Featured listings** — Sellers can feature cars for 7 days using ad credits
- **Ad credits** — Purchase packages (10/$5, 25/$10, 50/$18) to boost listings
- **Inquiry system** — Buyers contact sellers directly through the platform
- **Stripe payments** — Subscription billing and one-time ad credit purchases
- **Seller dashboard** — Manage listings, minishop, inquiries, and subscription
- **Admin panel** — Platform-level stats and oversight

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth.js (Credentials provider)
- **Payments:** Stripe
- **Image hosting:** Cloudinary
- **Icons:** lucide-react

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Cloudinary account (for image uploads)

### Installation

```bash
# Clone the repo
git clone https://github.com/geniuspulse/nyasacars.git
cd nyasacars

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env

# Set up the database
npx prisma db push
npm run db:seed

# Start the dev server
npm run dev
```

Visit `http://localhost:3000`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `NEXTAUTH_URL` | App URL (localhost:3000 in dev) |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register pages
│   ├── cars/            # Browse cars & car detail pages
│   ├── sellers/[slug]/  # Seller minishop pages
│   ├── dashboard/       # Seller dashboard (protected)
│   ├── admin/           # Admin panel
│   └── api/             # API route handlers
├── components/          # Shared React components
├── lib/                 # Prisma, auth, Stripe config
└── types/               # TypeScript type definitions
```

## Pricing Model

| Plan | Price | Listings | Features |
|------|-------|----------|----------|
| Free | $0 | 3 | Basic minishop |
| Pro | $15/mo | 15 | Branded minishop, analytics, 5 featured listings |
| Premium | $50/mo | Unlimited | Custom branding, priority placement, ad tools |

**Ad Credits:** 10 credits for $5 · 25 credits for $10 · 50 credits for $18

## License

Proprietary — © NyasaCars
