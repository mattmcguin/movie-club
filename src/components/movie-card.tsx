"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ReviewDialog } from "@/components/review-dialog";
import { MovieInfoDialog } from "@/components/movie-info-dialog";
import { setCurrentMovie, clearCurrentMovie } from "@/actions/movies";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Profile, Movie, MovieRating } from "@/lib/types/database";

type MovieWithRatings = Movie & {
  ratings: (MovieRating & { profile: Profile })[];
};

interface MovieCardProps {
  movie: MovieWithRatings;
  profiles: Profile[];
  currentUserId: string;
}

export function MovieCard({ movie, profiles, currentUserId }: MovieCardProps) {
  const [showAllRatings, setShowAllRatings] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentUserProfile = profiles.find((p) => p.id === currentUserId);
  const otherProfiles = profiles.filter((p) => p.id !== currentUserId);
  const currentUserRating = movie.ratings.find((r) => r.user_id === currentUserId) ?? null;

  // User has reviewed if they have a rating with watched=true
  const userHasReviewed = currentUserRating?.watched ?? false;

  // Count how many others have watched
  const othersWatched = movie.ratings.filter(
    (r) => r.user_id !== currentUserId && r.watched
  ).length;

  const handleSetCurrent = () => {
    startTransition(async () => {
      const result = await setCurrentMovie(movie.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${movie.title}" is now the current movie!`);
      }
    });
  };

  const handleClearCurrent = () => {
    startTransition(async () => {
      const result = await clearCurrentMovie(movie.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Current movie cleared");
      }
    });
  };

  return (
    <div className={`bg-zinc-900/80 border rounded-xl overflow-hidden ${
      movie.is_current ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-zinc-800"
    }`}>
      {/* Currently Watching Badge */}
      {movie.is_current && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 flex items-center gap-2">
          <PlayCircleIcon className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">Currently Watching</span>
        </div>
      )}

      {/* Movie Info Section */}
      <div className="flex gap-4 p-4">
        <MovieInfoDialog movie={movie}>
          {movie.poster_url ? (
            <button className="relative h-32 w-22 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 hover:ring-2 hover:ring-amber-500/50 transition-all">
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="88px"
              />
            </button>
          ) : (
            <button className="flex h-32 w-22 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 hover:ring-2 hover:ring-amber-500/50 transition-all">
              <FilmIcon className="h-8 w-8 text-zinc-600" />
            </button>
          )}
        </MovieInfoDialog>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <MovieInfoDialog movie={movie}>
              <h3 className="font-semibold text-zinc-100 text-lg leading-tight cursor-pointer hover:text-amber-400 transition-colors text-left">
                {movie.title}
              </h3>
            </MovieInfoDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-300">
                  <MoreIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                {movie.is_current ? (
                  <DropdownMenuItem
                    onClick={handleClearCurrent}
                    disabled={isPending}
                    className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
                  >
                    <XIcon className="mr-2 h-4 w-4" />
                    Remove from current
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleSetCurrent}
                    disabled={isPending}
                    className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
                  >
                    <PlayCircleIcon className="mr-2 h-4 w-4" />
                    Set as currently watching
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {movie.year && (
            <span className="text-sm text-zinc-500">{movie.year}</span>
          )}
          {movie.description && (
            <MovieInfoDialog movie={movie}>
              <p className="text-sm text-zinc-400 line-clamp-2 mt-2 cursor-pointer hover:text-zinc-300 transition-colors text-left">
                {movie.description}
              </p>
            </MovieInfoDialog>
          )}
          {othersWatched > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
              <UsersIcon className="h-3.5 w-3.5" />
              <span>{othersWatched} other{othersWatched !== 1 ? "s" : ""} reviewed</span>
            </div>
          )}
        </div>
      </div>

      {/* Current User Review Section */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-zinc-700">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs">
                {currentUserProfile ? getInitials(currentUserProfile.display_name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-zinc-300">Your Review</span>
          </div>
          <ReviewDialog
            movieId={movie.id}
            movieTitle={movie.title}
            existingRating={currentUserRating}
            variant="mobile"
          />
        </div>
        {userHasReviewed && currentUserRating?.review && (
          <p className="text-sm text-zinc-400 mt-3 italic">
            &ldquo;{currentUserRating.review}&rdquo;
          </p>
        )}
      </div>

      {/* Other Ratings Section - Only show if user has reviewed */}
      {otherProfiles.length > 0 && (
        <div className="border-t border-zinc-800">
          {userHasReviewed ? (
            <>
              <button
                onClick={() => setShowAllRatings(!showAllRatings)}
                className="w-full flex items-center justify-between p-4 text-sm text-zinc-400 hover:bg-zinc-800/50 transition-colors"
              >
                <span>See {otherProfiles.length} other review{otherProfiles.length !== 1 ? "s" : ""}</span>
                <ChevronIcon className={`h-4 w-4 transition-transform ${showAllRatings ? "rotate-180" : ""}`} />
              </button>

              {showAllRatings && (
                <div className="px-4 pb-4 space-y-4">
                  {otherProfiles.map((profile) => {
                    const rating = movie.ratings.find((r) => r.user_id === profile.id) ?? null;
                    return (
                      <div key={profile.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 border border-zinc-700 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-zinc-600 to-zinc-700 text-white text-xs">
                            {getInitials(profile.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-300 truncate">
                            {profile.display_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {rating?.watched ? (
                              <>
                                <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                                  {rating.score}/10
                                </Badge>
                              </>
                            ) : (
                              <span className="text-xs text-zinc-500">Not reviewed</span>
                            )}
                          </div>
                          {rating?.review && (
                            <p className="text-xs text-zinc-400 mt-2 line-clamp-3 italic">
                              &ldquo;{rating.review}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-sm text-zinc-500 flex items-center gap-2">
              <LockIcon className="h-4 w-4" />
              <span>Submit your review to see what others think</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PlayCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
