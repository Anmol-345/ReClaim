"use client";

import { useRouter } from "next/navigation";

export default function HomeLogoHome() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      aria-label="Go to Home"
      className="
        fixed top-4 left-4 z-50
        w-14 h-14
        rounded-xl
        bg-[#020617]
        border border-gray-700
        flex items-center justify-center
        hover:border-blue-500
        hover:scale-105
        transition-all
        shadow-lg
      "
    >
      <img
        src="/logo.png"
        alt="App Logo"
        className="w-8 h-8 object-contain"
      />
    </button>
  );
}
