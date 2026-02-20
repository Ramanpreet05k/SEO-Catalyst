"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpUser } from "./actions";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const res = await signUpUser(formData);

    if (res.success) {
      router.push("/login");
    } else {
      setError(res.error || "Something went wrong.");
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Get started with SEO Catalyst
      </h1>
      <p className="text-sm text-muted-foreground">
        Create a new account to start optimizing your content.
      </p>

      <div className="grid gap-6 pt-6">
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            
            {error && (
              <div className="p-3 text-sm text-red-500 rounded-md bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="Example@email.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="Create a password"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                required
              />
            </div>
            
            <Button disabled={isLoading} className="mt-2 w-full bg-black text-white hover:bg-zinc-900">
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
              ) : null}
              Create Account
            </Button>
          </div>
        </form>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}