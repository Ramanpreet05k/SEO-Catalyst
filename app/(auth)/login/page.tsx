"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/auth-callback");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Build content that ranks — and gets answered by AI
      </h1>
      <p className="text-sm text-muted-foreground">
        Set up your SEO & AEO engine in under 2 minutes.
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
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Forgot Password?
              </Link>
            </div>
            {/* The tag is now properly closed with </Button> */}
            <Button disabled={isLoading} className="mt-2 w-full bg-black text-white hover:bg-zinc-900">
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
              ) : null}
              Continue
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        
        <Button variant="outline" type="button" disabled={isLoading} className="w-full">
          <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
            <path
              fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            />
          </svg>
          Sign in with Google
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}