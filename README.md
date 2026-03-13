# Your Wish AI

Modern AI SaaS dashboard with chat, logo generation, and social media image tools. Image generation is marked as coming soon.

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

## Environment

Create a `.env.local` file with your keys and MongoDB connection.

```
APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
OPENAI_API_KEY=your_key_here
MONGODB_URI=your_mongodb_connection
JWT_SECRET=replace_with_random_secret
RESEND_API_KEY=your_resend_key
EMAIL_FROM=no-reply@yourwish.ai
```

## Notes

- UI is built with Next.js App Router and Tailwind.
- Login uses email + password with OTP reset via Resend.
- Credits default to 10 for new users and decrement on logo/social generation.
