"use client";

import { useState } from "react";
import Image from "next/image";
import { RatingCell } from "@/components/rating-cell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const currentUserProfile = profiles.find((p) => p.id === currentUserId);
  const otherProfiles = profiles.filter((p) => p.id !== currentUserId);
  const currentUserRating = movie.ratings.find((r) => r.user_id === currentUserId) ?? null;

  // Count how many others have watched
  const othersWatched = movie.ratings.filter(
    (r) => r.user_id !== currentUserId && r.watched
  ).length;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Movie Info Section */}
      <div className="flex gap-4 p-4">
        {movie.poster_url ? (
          <div className="relative h-32 w-22 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
            <Image
              src={movie.poster_url}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="88px"
            />
          </div>
        ) : (
          <div className="flex h-32 w-22 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800">
            <FilmIcon className="h-8 w-8 text-zinc-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-100 text-lg leading-tight">
            {movie.title}
          </h3>
          {movie.year && (
            <span className="text-sm text-zinc-500">{movie.year}</span>
          )}
          {movie.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 mt-2">
              {movie.description}
            </p>
          )}
          {othersWatched > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
              <UsersIcon className="h-3.5 w-3.5" />
              <span>{othersWatched} other{othersWatched !== 1 ? "s" : ""} watched</span>
            </div>
          )}
        </div>
      </div>

      {/* Current User Rating Section */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-zinc-700">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs">
                {currentUserProfile ? getInitials(currentUserProfile.display_name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-zinc-300">Your Rating</span>
          </div>
        </div>
        <RatingCell
          movieId={movie.id}
          rating={currentUserRating}
          isCurrentUser={true}
          variant="mobile"
        />
      </div>

      {/* Other Ratings Section */}
      {otherProfiles.length > 0 && (
        <div className="border-t border-zinc-800">
          <button
            onClick={() => setShowAllRatings(!showAllRatings)}
            className="w-full flex items-center justify-between p-4 text-sm text-zinc-400 hover:bg-zinc-800/50 transition-colors"
          >
            <span>See {otherProfiles.length} other rating{otherProfiles.length !== 1 ? "s" : ""}</span>
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
                            <span className="flex items-center gap-1 text-emerald-400 text-xs">
                              <EyeIcon className="h-3.5 w-3.5" />
                              Watched
                            </span>
                            {rating.score !== null && (
                              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                                {rating.score}/10
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-zinc-500">Not watched</span>
                        )}
                      </div>
                      {rating?.review && (
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-3">
                          &ldquo;{rating.review}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

