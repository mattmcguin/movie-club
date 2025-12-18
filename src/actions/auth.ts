"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types/database";

// Use environment variable or fall back to production domain
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://navajomovietalkers.com";

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

export async function sendPhoneOtp(phone: string, displayName: string | null) {
  if (!phone) {
    return { error: "Phone number is required" };
  }

  // Normalize phone number - strip non-digits, then format
  const digits = phone.replace(/\D/g, "");
  let normalizedPhone: string;
  
  if (digits.length === 10) {
    // US number without country code
    normalizedPhone = `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    // US number with country code but no +
    normalizedPhone = `+${digits}`;
  } else {
    // Assume it's already properly formatted or international
    normalizedPhone = `+${digits}`;
  }

  console.log("[Phone Auth] Sending OTP to:", normalizedPhone);

  const supabase = await createClient();

  // For new users without a display name, use phone as fallback
  const effectiveDisplayName = displayName?.trim() || normalizedPhone;

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: normalizedPhone,
    options: {
      data: { display_name: effectiveDisplayName },
    },
  });

  console.log("[Phone Auth] Supabase response:", { data, error });

  if (error) {
    return { error: error.message };
  }

  return { success: true, phone: normalizedPhone };
}

export async function verifyPhoneOtp(phone: string, code: string) {
  if (!phone || !code) {
    return { error: "Phone and code are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: "sms",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
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
  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as Profile | null;
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
