"use client";

import * as React from "react";
import { useState } from "react";
import { LogIn, Lock, Mail } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-white z-1">
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl shadow-opacity-10 p-8 flex flex-col items-center border border-blue-100 text-black">
        {topRight && (
          <div className="w-full flex justify-end mb-2">{topRight}</div>
        )}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg shadow-opacity-5">
          <LogIn className="w-7 h-7 text-black" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center">{title}</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">{subtitle}</p>
        <form
          className="w-full flex flex-col gap-3 mb-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder={emailPlaceholder}
              type="email"
              autoComplete="email"
              value={email}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder={passwordPlaceholder}
              type="password"
              autoComplete="current-password"
              value={password}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {shownError && (
            <div className="text-sm text-red-500 text-left">{shownError}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 cursor-pointer transition mb-1 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
};

export { SignIn2 };
