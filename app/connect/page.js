"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
} from "@/lib/auth"; // adjust path

import loader from "@/components/Loader";

export default function ConnectPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false); // toggle mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    try {
      setLoading(true);
      setError("");

      if (isSignup) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm md:max-w-md text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

        <p className="text-sm text-gray-400 text-center mb-4">
          {isSignup
            ? "Already have an account?"
            : "Don’t have an account yet?"}{" "}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Sign in" : "Sign up"}
          </span>
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full p-2 mb-4 bg-purple-600 hover:bg-purple-700 rounded font-semibold"
        >
          {loading ? "Processing..." : isSignup ? "Sign up" : "Sign in"}
        </button>

        <div className="flex items-center text-gray-400 mb-4">
          <hr className="flex-1 border-gray-600" />
          <span className="px-2 text-sm">OR</span>
          <hr className="flex-1 border-gray-600" />
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center gap-2 font-semibold"
        >
          <span>Connect with Google</span>
          <span className="text-lg">G</span>
        </button>

        {error && <p className="mt-3 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
}
