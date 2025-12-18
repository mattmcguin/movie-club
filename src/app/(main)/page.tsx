import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMoviesWithRatings, getAllProfiles } from "@/actions/movies";
import { MovieTable } from "@/components/movie-table";
import { Header } from "@/components/header";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import type { Profile, Movie, MovieRating } from "@/lib/types/database";

type MovieWithRatings = Movie & {
  ratings: (MovieRating & { profile: Profile })[];
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  const [movies, profiles] = await Promise.all([
    getMoviesWithRatings(),
    getAllProfiles(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header profile={profile} />

      <main className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="mb-6 md:mb-8 flex items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">Movies</h1>
            <p className="mt-1 text-sm md:text-base text-zinc-500">
              Track and rate movies with your club
            </p>
          </div>
          {/* Desktop: inline button */}
          <div className="hidden md:block">
            <AddMovieDialog />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <MovieTable
            movies={movies as MovieWithRatings[]}
            profiles={profiles}
            currentUserId={user.id}
          />
        </div>
      </main>

      {/* Mobile: Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent md:hidden">
        <AddMovieDialog fullWidth />
      </div>
    </div>
  );
}
