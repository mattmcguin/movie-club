"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types/database";
import { User } from "@supabase/supabase-js";

// Use environment variable or fall back to production domain
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://navajomovietalkers.com";

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;
  const displayName = formData.get("displayName") as string | null;

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createClient();

  // For new users without a display name, use email prefix as fallback
  const effectiveDisplayName = displayName?.trim() || email.split("@")[0];

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback`,
      data: { display_name: effectiveDisplayName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/verify");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return user;
  }
  redirect("/login");
}

export async function getProfileWithUserId(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as Profile | null;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const user = await getUser();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (data) {
    return { user, profile: data } as { user: User; profile: Profile };
  }
  return { user, profile: null };
}

export async function updateProfile(formData: FormData) {
  const displayName = formData.get("displayName") as string;

  if (!displayName) {
    return { error: "Display name is required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName } as Partial<Profile>)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
