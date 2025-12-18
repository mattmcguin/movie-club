-- Create profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create movies table
create table public.movies (
  id uuid default gen_random_uuid() primary key,
  tmdb_id integer,
  title text not null,
  year integer,
  poster_url text,
  description text,
  added_by uuid references public.profiles(id) on delete set null not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create movie_ratings table (junction table for user ratings)
create table public.movie_ratings (
  id uuid default gen_random_uuid() primary key,
  movie_id uuid references public.movies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  watched boolean default false not null,
  score integer check (score >= 0 and score <= 10),
  review text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(movie_id, user_id)
);

-- Create indexes for performance
create index movies_added_by_idx on public.movies(added_by);
create index movies_created_at_idx on public.movies(created_at desc);
create index movie_ratings_movie_id_idx on public.movie_ratings(movie_id);
create index movie_ratings_user_id_idx on public.movie_ratings(user_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.movie_ratings enable row level security;

-- Profiles policies
-- Anyone can read profiles
create policy "Profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

-- Users can update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Movies policies
-- Anyone authenticated can read movies
create policy "Movies are viewable by authenticated users" 
  on public.movies for select 
  to authenticated
  using (true);

-- Authenticated users can add movies
create policy "Authenticated users can add movies" 
  on public.movies for insert 
  to authenticated
  with check (auth.uid() = added_by);

-- Only the user who added can update the movie
create policy "Users can update movies they added" 
  on public.movies for update 
  to authenticated
  using (auth.uid() = added_by);

-- Only the user who added can delete the movie
create policy "Users can delete movies they added" 
  on public.movies for delete 
  to authenticated
  using (auth.uid() = added_by);

-- Movie ratings policies
-- Anyone authenticated can read ratings
create policy "Ratings are viewable by authenticated users" 
  on public.movie_ratings for select 
  to authenticated
  using (true);

-- Users can insert their own ratings
create policy "Users can insert own ratings" 
  on public.movie_ratings for insert 
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own ratings
create policy "Users can update own ratings" 
  on public.movie_ratings for update 
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own ratings
create policy "Users can delete own ratings" 
  on public.movie_ratings for delete 
  to authenticated
  using (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger to update updated_at on movie_ratings
create trigger update_movie_ratings_updated_at
  before update on public.movie_ratings
  for each row execute procedure public.update_updated_at();

