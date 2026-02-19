"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-5xl font-bold mb-8">Welcome to SEO Catalyst</h1>
      
      {session ? (
        <div className="text-center">
          <p className="text-xl mb-4">Logged in as {session.user?.email}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded">Go to Dashboard</Link>
            <button onClick={() => signOut()} className="px-6 py-2 bg-red-600 text-white rounded">Logout</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Login</Link>
          <Link href="/signup" className="px-6 py-2 bg-gray-200 text-black rounded font-bold hover:bg-gray-300">Sign Up</Link>
        </div>
      )}
    </main>
  );
}