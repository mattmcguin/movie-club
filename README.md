# Movie Club

A web app for tracking and rating movies with your friends. Built with Next.js, Supabase, and TMDB.

## Features

- **Movie Tracking**: Track movies you've watched with your club
- **Ratings & Reviews**: Rate movies out of 10 and write reviews
- **TMDB Integration**: Search and import movies from The Movie Database
- **Magic Link Auth**: Passwordless authentication via email
- **Real-time Updates**: See when others update their ratings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links)
- **Movie Data**: TMDB API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- TMDB API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd movie-club
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the migration in `supabase/migrations/001_initial_schema.sql`
3. Go to Project Settings > API to get your URL and anon key

### 3. Set Up TMDB

1. Create an account at [themoviedb.org](https://www.themoviedb.org)
2. Go to Settings > API and request an API key
3. Copy the API Read Access Token

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TMDB_API_KEY=your_tmdb_api_key
```

### 5. Configure Supabase Auth

In your Supabase dashboard:

1. Go to Authentication > URL Configuration
2. Set Site URL to `http://localhost:3000` (development)
3. Add `http://localhost:3000/auth/callback` to Redirect URLs

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel's project settings
4. Deploy

### Update Supabase for Production

After deploying to Vercel:

1. Update Site URL to your Vercel domain
2. Add `https://your-app.vercel.app/auth/callback` to Redirect URLs

## Database Schema

### Tables

- **profiles**: User profiles (extends Supabase auth)
- **movies**: Movie data (title, year, poster, description)
- **movie_ratings**: User ratings and reviews for movies

### Row Level Security

All tables have RLS enabled:
- Users can read all data
- Users can only modify their own ratings
- Users can only delete movies they added

## License

MIT
