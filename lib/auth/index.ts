import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "../env";

export const auth = betterAuth({
  database: new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    database: env.DB_DATABASE,
    password: env.DB_PASSWORD,
  }),
  socialProviders: {
    spotify: {
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    },
  },
});
