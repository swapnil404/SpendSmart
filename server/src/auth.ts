
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import * as schema from "./db/schema";
import { emailOTP } from "better-auth/plugins";

const baseURL = (process.env.BETTER_AUTH_URL || process.env.VITE_API_URL || '').replace(/\/$/, "") + '/api/auth';
console.log(`Auth Base URL: ${baseURL}`);

const trustedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://spendsmart.swapnilchristian.dev",
  process.env.VITE_API_URL as string
];
console.log(`Auth Trusted Origins: ${trustedOrigins.join(', ')}`);

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema
  }),
  baseURL: (process.env.BETTER_AUTH_URL || process.env.VITE_API_URL || '').replace(/\/$/, "") + '/api/auth',
  plugins: [
    emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
            console.log(`OTP for ${email}: ${otp}`);
        },
    })
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true
  },
  trustedOrigins: [
    "http://localhost:5173", 
    "http://localhost:5174",
    "https://spendsmart.swapnilchristian.dev",
    process.env.VITE_API_URL as string
  ].filter(Boolean),
  advanced: {
    crossSubDomainCookies: {
      enabled: isProduction,
      domain: isProduction ? ".swapnilchristian.dev" : undefined
    }
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      options: {
        httpOnly: true,
        sameSite: isProduction ? "none" as const : "lax" as const,
        secure: isProduction,
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      }
    }
  }
});
