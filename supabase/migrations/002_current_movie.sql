-- Add is_current column to movies table
-- Only one movie can be "current" at a time
alter table public.movies add column is_current boolean default false not null;

-- Create index for current movie lookup
create index movies_is_current_idx on public.movies(is_current) where is_current = true;

-- Function to ensure only one movie is current at a time
create or replace function public.ensure_single_current_movie()
returns trigger
language plpgsql
as $$
begin
  if new.is_current = true then
    -- Set all other movies to not current
    update public.movies set is_current = false where id != new.id and is_current = true;
  end if;
  return new;
end;
$$;

-- Trigger to maintain single current movie
create trigger ensure_single_current_movie_trigger
  before insert or update of is_current on public.movies
  for each row
  when (new.is_current = true)
  execute procedure public.ensure_single_current_movie();

-- Allow any authenticated user to update is_current on any movie
create policy "Authenticated users can set current movie"
  on public.movies for update
  to authenticated
  using (true)
  with check (true);

