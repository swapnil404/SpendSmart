
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import * as schema from "./db/schema";
import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "spendsmart.noreply@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

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
            try {
              await transporter.sendMail({
                from: '"SpendSmart" <spendsmart.noreply@gmail.com>',
                to: email,
                subject: "Your SpendSmart OTP",
                text: `Your One-Time Password is: ${otp}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>SpendSmart Verification</h2>
                    <p>Your One-Time Password (OTP) is:</p>
                    <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                    <p>This code will expire in 5 minutes.</p>
                  </div>
                `,
              });
              console.log(`Email sent to ${email}`);
            } catch (error) {
              console.error("Error sending OTP email:", error);
            }
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
