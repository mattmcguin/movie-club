"use client";

import Image from "next/image";
import { RatingCell } from "@/components/rating-cell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="sticky left-0 z-10 bg-zinc-950 p-4 text-left font-medium text-zinc-400 min-w-[280px]">
              Movie
            </th>
            {profiles.map((profile) => (
              <th
                key={profile.id}
                className="p-4 text-center font-medium text-zinc-400 min-w-[140px]"
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
            <tr
              key={movie.id}
              className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
            >
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
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-zinc-100 line-clamp-2">
                      {movie.title}
                    </h3>
                    {movie.year && (
                      <span className="text-sm text-zinc-500">{movie.year}</span>
                    )}
                    {movie.description && (
                      <p className="text-xs text-zinc-500 line-clamp-2 max-w-[200px]">
                        {movie.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              {profiles.map((profile) => {
                const rating = movie.ratings.find(
                  (r) => r.user_id === profile.id
                ) ?? null;
                return (
                  <td key={profile.id} className="p-2 text-center">
                    <RatingCell
                      movieId={movie.id}
                      rating={rating}
                      isCurrentUser={profile.id === currentUserId}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
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

