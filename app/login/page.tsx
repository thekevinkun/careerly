"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { SignInResponse } from "next-auth/react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
            setError(result?.error || "Invalid credentials");
        }
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex-center bg-muted/30 p-4">
      <Card className="w-full max-w-md bg-card shadow-xl rounded-lg border border-muted">
        <CardHeader>
          <h2 className="logo text-2xl font-bold text-center">Careerly</h2>

          <p className="text-sm text-muted-foreground text-center mt-1">
            Continue your journey with <span className="font-semibold">Careerly</span>
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

            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}

            <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90" 
            >
              {loading ? "Loging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
