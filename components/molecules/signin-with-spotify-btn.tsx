"use client";
import { Button } from "@/components/atoms/button";
import { authClient } from "@/lib/auth/client";
import { useState } from "react";

export const SignInWithSpotify = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({ provider: "spotify" });
      // The redirect will be handled by the auth redirect route
    } catch (error) {
      console.error("Error signing in with Spotify:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSignIn} disabled={isLoading}>
      {isLoading ? "Signing in..." : "Sign in with Spotify"}
    </Button>
  );
};
