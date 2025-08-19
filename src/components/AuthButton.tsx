// === Imports ===
import React, { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, User, ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// === Props ===
interface AuthButtonProps {
  user: SupabaseUser | null;
  onAuthChange: () => void;
  showSignIn: boolean;
  setShowSignIn: (show: boolean) => void;
}

// === Component ===
export default function AuthButton({ user, onAuthChange, showSignIn, setShowSignIn }: AuthButtonProps) {
  // === States ===
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [authMode, setAuthMode] = useState<"pin" | "email">("pin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // === Effects ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Handlers ===
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      setShowSignIn(false);
      setEmail("");
      setPassword("");
      onAuthChange();
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const sha256 = async (text: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      };

      const sha = await sha256(pin);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, pin_hash")
        .eq("pin_sha256", sha)
        .single();

      if (profileError || !profile) throw new Error("Invalid PIN");

      const bcrypt = await import("bcryptjs");
      const isValid = bcrypt.compareSync(pin, profile.pin_hash);
      if (!isValid) throw new Error("Invalid PIN");

      localStorage.setItem("pin_user_id", profile.id); // stores logged in user locally to allow App.tsx to use it
      setShowSignIn(false);
      setPin("");
      onAuthChange();
    } catch (err: any) {
      setError(err.message || "PIN login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("pin_user_id"); // clears logged in user on signing out
      setShowDropdown(false);
      onAuthChange();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // === Render (Logged In) ===
  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-gray-600 hover:text-blue-900 hover:bg-blue-50"
        >
          <User className="w-5 h-5 mr-2" />
          Admin
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${
              showDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Signed in</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email ?? 'PIN login'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  // === Render (Sign In Modal) ===
  if (showSignIn) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <LogIn className="w-6 h-6 text-blue-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Sign In
            </h2>
            <p className="text-gray-600">
              {authMode === "pin"
                ? "Enter your admin PIN to continue"
                : "Enter your email and password"}
            </p>
          </div>

          {/* PIN Login Form */}
          {authMode === "pin" ? (
            <form onSubmit={handlePinSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin PIN
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="pin"
                  name="admin-pin"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Enter your PIN"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 password-mask-style"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignIn(false);
                    setError(null);
                    setPin("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </div>

              <p className="text-sm text-center text-gray-500 mt-4">
                <button
                  type="button"
                  className="underline"
                  onClick={() => setAuthMode("email")}
                >
                  Login with email instead
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignIn(false);
                    setError(null);
                    setEmail("");
                    setPassword("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </div>

              <p className="text-sm text-center text-gray-500 mt-4">
                <button
                  type="button"
                  className="underline"
                  onClick={() => setAuthMode("pin")}
                >
                  Login with PIN instead
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // === Render (Sign In Button) ===
  return (
    <button
      onClick={() => setShowSignIn(true)}
      className="flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-gray-600 hover:text-blue-900 hover:bg-blue-50"
    >
      <LogIn className="w-5 h-5 mr-2" />
      Admin
    </button>
  );
}
