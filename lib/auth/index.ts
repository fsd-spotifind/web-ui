import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "../env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: new Pool({
    connectionString: env.DATABASE_URL,
  }),
  socialProviders: {
    spotify: {
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/spotify`,
    },
  },
  logger: console,
  trustedOrigins: [env.BETTER_AUTH_URL],
});
