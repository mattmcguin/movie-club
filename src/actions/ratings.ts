"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MovieRating } from "@/lib/types/database";

export async function submitReview(
  movieId: string,
  score: number,
  review: string | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  if (score < 0 || score > 10) {
    return { error: "Score must be between 0 and 10" };
  }

  // Check if rating exists
  const { data } = await supabase
    .from("movie_ratings")
    .select("*")
    .eq("movie_id", movieId)
    .eq("user_id", user.id)
    .single();

  const existingRating = data as MovieRating | null;

  if (existingRating) {
    const { error } = await supabase
      .from("movie_ratings")
      .update({
        watched: true,
        score,
        review: review || null,
      })
      .eq("id", existingRating.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("movie_ratings").insert({
      movie_id: movieId,
      user_id: user.id,
      watched: true,
      score,
      review: review || null,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function toggleWatched(movieId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if rating exists
  const { data } = await supabase
    .from("movie_ratings")
    .select("*")
    .eq("movie_id", movieId)
    .eq("user_id", user.id)
    .single();

  const existingRating = data as MovieRating | null;

  if (existingRating) {
    // Toggle watched status
    const { error } = await supabase
      .from("movie_ratings")
      .update({ watched: !existingRating.watched })
      .eq("id", existingRating.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Create new rating with watched = true
    const { error } = await supabase.from("movie_ratings").insert({
      movie_id: movieId,
      user_id: user.id,
      watched: true,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateScore(movieId: string, score: number | null) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if rating exists
  const { data } = await supabase
    .from("movie_ratings")
    .select("*")
    .eq("movie_id", movieId)
    .eq("user_id", user.id)
    .single();

  const existingRating = data as MovieRating | null;

  if (existingRating) {
    const { error } = await supabase
      .from("movie_ratings")
      .update({ score })
      .eq("id", existingRating.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("movie_ratings").insert({
      movie_id: movieId,
      user_id: user.id,
      watched: true,
      score,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateReview(movieId: string, review: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if rating exists
  const { data } = await supabase
    .from("movie_ratings")
    .select("*")
    .eq("movie_id", movieId)
    .eq("user_id", user.id)
    .single();

  const existingRating = data as MovieRating | null;

  if (existingRating) {
    const { error } = await supabase
      .from("movie_ratings")
      .update({ review: review || null })
      .eq("id", existingRating.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("movie_ratings").insert({
      movie_id: movieId,
      user_id: user.id,
      watched: false,
      review: review || null,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/");
  return { success: true };
}
