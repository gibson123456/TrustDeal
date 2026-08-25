# TrustDeal — Protected Local Commerce

A web-based platform that connects buyers and suppliers through protected transactions.

## Features

- 🔒 **Protected Transactions** — Funds are secured in escrow until delivery is confirmed
- 👤 **User Dashboard** — Each user sees their own deals and statistics
- 🏢 **Admin Portal** — Full platform management with user and transaction oversight
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🔄 **Real-time Ready** — Structured for Supabase integration

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@trustdeal.test | admin123 |
| User | Sign up freely | Any password |

## How to Run

1. Download or clone this repository
2. Make sure all files are in the same folder
3. Open `index.html` in your browser
4. Sign up as a new user or use the admin credentials

## Navigation

- **Home** — Landing page with marketing content
- **Dashboard** — View your deals and statistics
- **New Deal** — Create a protected transaction
- **Transactions** — List of all your deals
- **Account** — Your profile and trust score

## Supabase Ready

The code is structured for easy migration to Supabase:

- `get()` → Replace with `supabase.from('table').select('*')`
- `set()` → Replace with `supabase.from('table').upsert()`
- `currentUser()` → Replace with `supabase.auth.getUser()`

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- localStorage for data persistence
- Modular file structure