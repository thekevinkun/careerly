"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { SignInResponse } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { openOAuthPopup } from "@/lib/oauth-popup";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result: SignInResponse | undefined = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError(
          result?.error ||
            "Something went wrong while you're login. Please try again later."
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while you're login. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    openOAuthPopup(
      "google",
      "/auth/google-callback",
      () => {
        setGoogleLoading(false);
        router.push("/dashboard");
      },
      (error) => {
        setGoogleLoading(false);
        setError(error);
      }
    );
  };

  return (
    <div className="min-h-screen flex-center bg-muted/30 p-4">
      <Card className="w-full max-w-md bg-card shadow-xl rounded-lg border border-muted">
        <CardHeader>
          <h2 className="logo text-2xl font-bold text-center">Careerly</h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Continue your journey with
            <span className="font-semibold">&nbsp;Careerly</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive font-medium">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-3"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            <Image
              src="/icons/google-logo.svg"
              alt="Google Logo"
              width={20}
              height={20}
            />
            {googleLoading ? "Opening Google..." : "Continue with Google"}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?
            <Link href="/register" className="text-primary hover:underline">
              &nbsp;Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
