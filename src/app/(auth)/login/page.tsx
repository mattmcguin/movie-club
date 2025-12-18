"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { sendPhoneOtp, verifyPhoneOtp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Step = "phone" | "code";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSendCode = () => {
    setError(null);
    startTransition(async () => {
      const result = await sendPhoneOtp(phone, displayName || null);
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.phone) {
        setNormalizedPhone(result.phone);
        setStep("code");
      }
    });
  };

  const handleVerifyCode = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyPhoneOtp(normalizedPhone, code);
      if (result?.error) {
        setError(result.error);
      }
      // On success, the action redirects to /
    });
  };

  const handleBack = () => {
    setStep("phone");
    setCode("");
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      
      <Card className="w-full max-w-md relative bg-zinc-900/80 border-zinc-800 backdrop-blur-sm mx-4 sm:mx-0">
        <CardHeader className="space-y-1 text-center">
          <Image
            src="/logo.png"
            alt="Navajo Movie Talkers Logo"
            width={80}
            height={80}
            className="mx-auto mb-4 h-20 w-20 rounded-full"
          />
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">
            Navajo Movie Talkers
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {step === "phone" 
              ? "A Film Discussion Club - Sign in below" 
              : "Enter the code sent to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                  autoComplete="tel"
                  className="h-12 text-base bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-500 disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-zinc-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isPending}
                  autoComplete="name"
                  className="h-12 text-base bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-500 disabled:opacity-50"
                />
                <p className="text-xs text-zinc-500">
                  New user? Enter your name. Existing user? Leave blank.
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md p-3">
                  {error}
                </p>
              )}
              <Button
                onClick={handleSendCode}
                disabled={isPending || !phone}
                className="w-full h-12 text-base bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium disabled:opacity-50"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Sending code...
                  </span>
                ) : (
                  "Send Code"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-zinc-300">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isPending}
                  autoComplete="one-time-code"
                  className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 placeholder:tracking-[0.5em] focus-visible:ring-amber-500 disabled:opacity-50"
                />
                <p className="text-xs text-zinc-500 text-center">
                  Sent to {normalizedPhone}
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md p-3">
                  {error}
                </p>
              )}
              <Button
                onClick={handleVerifyCode}
                disabled={isPending || code.length !== 6}
                className="w-full h-12 text-base bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium disabled:opacity-50"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Sign In"
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isPending}
                className="w-full h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                ← Use a different number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
