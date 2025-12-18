"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { MovieCard } from "@/components/movie-card";
import { ReviewDialog } from "@/components/review-dialog";
import { MovieInfoDialog } from "@/components/movie-info-dialog";
import { setCurrentMovie, clearCurrentMovie, deleteMovie } from "@/actions/movies";
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
import { getScoreColor } from "@/lib/utils";
import type { Profile, Movie, MovieRating } from "@/lib/types/database";

type MovieWithRatings = Movie & {
  ratings: (MovieRating & { profile: Profile })[];
  added_by_profile: Profile;
};

interface MovieTableProps {
  movies: MovieWithRatings[];
  profiles: Profile[];
  currentUserId: string;
}

export function MovieTable({ movies, profiles, currentUserId }: MovieTableProps) {
  // Sort profiles so current user is always first
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
          <FilmIcon className="h-10 w-10 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-300">No movies yet</h3>
        <p className="mt-2 text-zinc-500 max-w-sm">
          Add your first movie to start tracking what everyone has watched and their ratings.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3 px-4 py-2">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            profiles={profiles}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="sticky left-0 z-10 bg-zinc-950 p-4 text-left font-medium text-zinc-400 min-w-[320px]">
                Movie
              </th>
              {sortedProfiles.map((profile) => (
                <th
                  key={profile.id}
                  className="p-4 text-center font-medium text-zinc-400 min-w-[120px]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-8 w-8 border border-zinc-700">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs">
                        {getInitials(profile.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs truncate max-w-[100px]">
                      {profile.display_name}
                      {profile.id === currentUserId && (
                        <Badge
                          variant="outline"
                          className="ml-1 text-[10px] border-amber-500/50 text-amber-400"
                        >
                          You
                        </Badge>
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <MovieRow
                key={movie.id}
                movie={movie}
                profiles={sortedProfiles}
                currentUserId={currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MovieRow({
  movie,
  profiles,
  currentUserId,
}: {
  movie: MovieWithRatings;
  profiles: Profile[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const currentUserRating = movie.ratings.find((r) => r.user_id === currentUserId) ?? null;
  const userHasReviewed = currentUserRating?.watched ?? false;

  // Get reviews that have text (not just scores)
  const reviewsWithText = (movie.ratings ?? []).filter((r) => r.watched && r.review);
  const hasAnyReviews = reviewsWithText.length > 0;

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
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMovie(movie.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${movie.title}" deleted`);
      }
    });
  };

  // Can delete if not current and has no reviews
  const hasRatings = (movie.ratings ?? []).some((r) => r.watched);
  const canDelete = !movie.is_current && !hasRatings;

  return (
    <>
      <tr 
        className={`border-b border-zinc-800/50 transition-colors ${
          movie.is_current ? "bg-amber-500/5" : "hover:bg-zinc-900/50"
        } ${isExpanded ? "border-b-0" : ""}`}
      >
        <td className="sticky left-0 z-10 bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            {movie.poster_url ? (
            <MovieInfoDialog movie={movie}>
              <button className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800 hover:ring-2 hover:ring-amber-500/50 transition-all cursor-pointer">
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            </MovieInfoDialog>
          ) : (
            <MovieInfoDialog movie={movie}>
              <button className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-md bg-zinc-800 hover:ring-2 hover:ring-amber-500/50 transition-all cursor-pointer">
                <FilmIcon className="h-6 w-6 text-zinc-600" />
              </button>
            </MovieInfoDialog>
          )}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-semibold text-zinc-100 line-clamp-1">
                    {movie.title}
                    {movie.year && (
                      <span className="text-zinc-500 font-normal ml-1">({movie.year})</span>
                    )}
                  </h3>
                  <span className="text-[11px] text-zinc-500">
                    Added by {movie.added_by_profile?.display_name ?? "Unknown"}
                  </span>
                </div>
                {movie.is_current && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-[10px] flex-shrink-0">
                    Now Watching
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300 flex-shrink-0">
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
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isPending}
                      className="text-red-400 focus:text-red-300 focus:bg-red-950/50"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete movie
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                {movie.description && (
                  <MovieInfoDialog movie={movie}>
                    <p className="text-xs text-zinc-500 line-clamp-2 max-w-[220px] cursor-pointer hover:text-zinc-400 transition-colors text-left">
                      {movie.description}
                    </p>
                  </MovieInfoDialog>
                )}
              </div>
              {/* Expand Reviews Button */}
              {userHasReviewed && hasAnyReviews && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isExpanded 
                      ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <MessageIcon className="h-3.5 w-3.5" />
                  {isExpanded ? "Hide" : `Reviews (${reviewsWithText.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </td>
        {profiles.map((profile) => {
          const rating = movie.ratings.find((r) => r.user_id === profile.id) ?? null;
          const isCurrentUser = profile.id === currentUserId;

          return (
            <td key={profile.id} className="p-2 text-center">
              <DesktopRatingCell
                movieId={movie.id}
                movieTitle={movie.title}
                rating={rating}
                isCurrentUser={isCurrentUser}
                userHasReviewed={userHasReviewed}
              />
            </td>
          );
        })}
      </tr>

      {/* Expanded Reviews Row */}
      {isExpanded && userHasReviewed && (
        <tr className="bg-zinc-900/50">
          <td colSpan={profiles.length + 1} className="p-0">
            <div className="border-b border-zinc-800/50 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile) => {
                  const rating = movie.ratings.find((r) => r.user_id === profile.id);
                  if (!rating?.watched) return null;

                  return (
                    <div
                      key={profile.id}
                      className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10 border border-zinc-600">
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm">
                            {getInitials(profile.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-200 truncate">
                            {profile.display_name}
                            {profile.id === currentUserId && (
                              <span className="ml-2 text-xs text-amber-400">(You)</span>
                            )}
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{ color: getScoreColor(rating.score ?? 0) }}
                          >
                            {rating.score?.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      {rating.review ? (
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {rating.review}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-500 italic">No written review</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DesktopRatingCell({
  movieId,
  movieTitle,
  rating,
  isCurrentUser,
  userHasReviewed,
}: {
  movieId: string;
  movieTitle: string;
  rating: (MovieRating & { profile: Profile }) | null;
  isCurrentUser: boolean;
  userHasReviewed: boolean;
}) {
  const hasReviewed = rating?.watched ?? false;

  if (isCurrentUser) {
    return (
      <div className="flex flex-col items-center gap-2 p-2">
        <ReviewDialog
          movieId={movieId}
          movieTitle={movieTitle}
          existingRating={rating}
          variant="default"
        />
      </div>
    );
  }

  // Other users - only show if current user has reviewed
  if (!userHasReviewed) {
    return (
      <div className="flex flex-col items-center gap-1 p-2 text-zinc-600">
        <LockIcon className="h-4 w-4" />
        <span className="text-[10px]">Hidden</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {hasReviewed ? (
        <span 
          className="text-lg font-bold"
          style={{ color: getScoreColor(rating?.score ?? 0) }}
        >
          {rating?.score?.toFixed(1)}
        </span>
      ) : (
        <span className="text-xs text-zinc-500">-</span>
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

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
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

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

