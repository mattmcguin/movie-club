import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMoviesWithRatings, getAllProfiles } from "@/actions/movies";
import { MovieTable } from "@/components/movie-table";
import { Header } from "@/components/header";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { MobilePageWrapper } from "@/components/mobile-page-wrapper";
import type { Profile, Movie, MovieRating } from "@/lib/types/database";

type MovieWithRatings = Movie & {
  ratings: (MovieRating & { profile: Profile })[];
  added_by_profile: Profile;
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
      <Header profile={profile} showAddMovie />

      <MobilePageWrapper>
        <main className="container mx-auto px-4 py-6 md:py-8">
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

          {/* Container: only visible on desktop */}
          <div className="md:rounded-xl md:border md:border-zinc-800 md:bg-zinc-900/50 overflow-hidden -mx-4 md:mx-0">
            <MovieTable
              movies={movies as MovieWithRatings[]}
              profiles={profiles}
              currentUserId={user.id}
            />
          </div>
        </main>
      </MobilePageWrapper>
    </div>
  );
}
