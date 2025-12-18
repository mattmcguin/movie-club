"use client";

import { useTransition } from "react";
import Image from "next/image";
import { MovieCard } from "@/components/movie-card";
import { ReviewDialog } from "@/components/review-dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Profile, Movie, MovieRating } from "@/lib/types/database";

type MovieWithRatings = Movie & {
  ratings: (MovieRating & { profile: Profile })[];
};

interface MovieTableProps {
  movies: MovieWithRatings[];
  profiles: Profile[];
  currentUserId: string;
}

export function MovieTable({ movies, profiles, currentUserId }: MovieTableProps) {
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
      <div className="md:hidden space-y-4 p-4">
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
              {profiles.map((profile) => (
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
                profiles={profiles}
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
  const currentUserRating = movie.ratings.find((r) => r.user_id === currentUserId) ?? null;
  const userHasReviewed = currentUserRating?.watched ?? false;

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

  return (
    <tr className={`border-b border-zinc-800/50 transition-colors ${
      movie.is_current ? "bg-amber-500/5" : "hover:bg-zinc-900/50"
    }`}>
      <td className="sticky left-0 z-10 bg-zinc-950 p-4">
        <div className="flex items-start gap-3">
          {movie.poster_url ? (
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-md bg-zinc-800">
              <FilmIcon className="h-6 w-6 text-zinc-600" />
            </div>
          )}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-zinc-100 line-clamp-2">
                {movie.title}
              </h3>
              {movie.is_current && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-[10px] flex-shrink-0">
                  Now Watching
                </Badge>
              )}
            </div>
            {movie.year && (
              <span className="text-sm text-zinc-500">{movie.year}</span>
            )}
            {movie.description && (
              <p className="text-xs text-zinc-500 line-clamp-2 max-w-[220px]">
                {movie.description}
              </p>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-fit h-6 px-2 text-xs text-zinc-500 hover:text-zinc-300 mt-1">
                  <MoreIcon className="h-3 w-3 mr-1" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-700">
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
        {hasReviewed && rating?.review && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-amber-400 cursor-help">
                  <MessageIcon className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-zinc-900 border-zinc-700">
                <p className="text-sm text-zinc-300">{rating.review}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
        <>
          <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
            {rating?.score}/10
          </Badge>
          {rating?.review && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-amber-400 cursor-help">
                    <MessageIcon className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-zinc-900 border-zinc-700">
                  <p className="text-sm text-zinc-300">{rating.review}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
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
