"use client";
import { Button } from "@/components/atoms/button";
import { authClient } from "@/lib/auth/client";

export const SignInWithSpotify = () => {
  return (
    <Button
      onClick={async () =>
        await authClient.signIn.social({ provider: "spotify" })
      }
    >
      Sign in with Spotify
    </Button>
  );
};
