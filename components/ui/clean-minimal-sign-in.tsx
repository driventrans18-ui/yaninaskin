"use client";

import * as React from "react";
import { useState } from "react";
import { LogIn, Lock, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type SignIn2Props = {
  onSignIn: (email: string, password: string) => void | Promise<void>;
  error?: string;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  submitLabel?: string;
  loadingLabel?: string;
  websiteLabel?: string;
  websiteHref?: string;
  topRight?: React.ReactNode;
};

const SignIn2 = ({
  onSignIn,
  error,
  loading,
  title = "Sign in",
  subtitle = "Authorized access only",
  emailPlaceholder = "Email",
  passwordPlaceholder = "Password",
  submitLabel = "Sign in",
  loadingLabel = "Signing in…",
  websiteLabel = "← Website",
  websiteHref = "/",
  topRight,
}: SignIn2Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const submit = () => {
    if (loading) return;
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    setLocalError("");
    onSignIn(email.trim(), password);
  };

  const shownError = localError || error;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-8 flex flex-col items-center text-foreground">
        <div className="w-full flex items-center justify-between mb-6">
          <a
            href={websiteHref}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {websiteLabel}
          </a>
          {topRight}
        </div>
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary mb-6">
          <LogIn className="w-7 h-7 text-foreground" />
        </div>
        <h2 className="text-2xl mb-2 text-center">{title}</h2>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          {subtitle}
        </p>
        <form
          className="w-full flex flex-col gap-3 mb-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder={emailPlaceholder}
              type="email"
              autoComplete="email"
              value={email}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder={passwordPlaceholder}
              type="password"
              autoComplete="current-password"
              value={password}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {shownError && (
            <div className="text-sm text-destructive text-left">
              {shownError}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? loadingLabel : submitLabel}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export { SignIn2 };
