"use client";

import Link from "next/link";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Profile } from "@/lib/types/database";

interface HeaderProps {
  profile: Profile | null;
}

export function Header({ profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <FilmIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <span className="text-base md:text-lg font-bold text-zinc-100">Navajo Movie Talkers</span>
        </Link>

        {profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 h-10 px-2 md:px-3"
              >
                <Avatar className="h-8 w-8 border border-zinc-700">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs">
                    {getInitials(profile.display_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden sm:inline">{profile.display_name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-900 border-zinc-700 min-w-[180px]"
            >
              <DropdownMenuItem className="text-zinc-400 focus:text-zinc-400 focus:bg-transparent cursor-default sm:hidden">
                <span className="text-sm font-medium">{profile.display_name}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800 sm:hidden" />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800 cursor-pointer h-11"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
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

function LogOutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
