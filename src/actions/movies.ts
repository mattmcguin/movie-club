"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Profile, Movie, MovieRating } from "@/lib/types/database";

type MovieWithRatings = Movie & {
  ratings: (MovieRating & { profile: Profile })[];
};

export async function getMoviesWithRatings(): Promise<MovieWithRatings[]> {
  const supabase = await createClient();

  const { data: movies, error } = await supabase
    .from("movies")
    .select(
      `
      *,
      ratings:movie_ratings(
        *,
        profile:profiles(*)
      )
    `
    )
    .order("is_current", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching movies:", error);
    return [];
  }

  return movies as unknown as MovieWithRatings[];
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return profiles as Profile[];
}

export async function addMovie(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const title = formData.get("title") as string;
  const year = formData.get("year") as string | null;
  const tmdbId = formData.get("tmdbId") as string | null;
  const posterUrl = formData.get("posterUrl") as string | null;
  const description = formData.get("description") as string | null;

  if (!title) {
    return { error: "Title is required" };
  }

  const { error } = await supabase.from("movies").insert({
    title,
    year: year ? parseInt(year, 10) : null,
    tmdb_id: tmdbId ? parseInt(tmdbId, 10) : null,
    poster_url: posterUrl || null,
    description: description || null,
    added_by: user.id,
  });

  if (error) {
    console.error("Error adding movie:", error);
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteMovie(movieId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if movie exists and is not currently being watched
  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select("id, is_current")
    .eq("id", movieId)
    .single();

  if (movieError || !movie) {
    return { error: "Movie not found" };
  }

  if (movie.is_current) {
    return { error: "Cannot delete the currently watching movie" };
  }

  // Check if movie has any reviews
  const { data: ratings, error: ratingsError } = await supabase
    .from("movie_ratings")
    .select("id")
    .eq("movie_id", movieId)
    .eq("watched", true)
    .limit(1);

  if (ratingsError) {
    return { error: "Failed to check reviews" };
  }

  if (ratings && ratings.length > 0) {
    return { error: "Cannot delete a movie that has reviews" };
  }

  const { error } = await supabase.from("movies").delete().eq("id", movieId);

  if (error) {
    console.error("Error deleting movie:", error);
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function setCurrentMovie(movieId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Set this movie as current (trigger will unset others)
  const { error } = await supabase
    .from("movies")
    .update({ is_current: true })
    .eq("id", movieId);

  if (error) {
    console.error("Error setting current movie:", error);
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function clearCurrentMovie(movieId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("movies")
    .update({ is_current: false })
    .eq("id", movieId);

  if (error) {
    console.error("Error clearing current movie:", error);
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
