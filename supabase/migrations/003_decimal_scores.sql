-- Change score from integer to numeric to support decimal values (e.g., 7.5)
alter table public.movie_ratings 
  alter column score type numeric(3,1) using score::numeric(3,1);

-- Update the check constraint to allow decimals
alter table public.movie_ratings 
  drop constraint if exists movie_ratings_score_check;

alter table public.movie_ratings 
  add constraint movie_ratings_score_check 
  check (score >= 0 and score <= 10);

