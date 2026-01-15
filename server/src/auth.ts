
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import * as schema from "./db/schema";
import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";

const baseURL = (process.env.BETTER_AUTH_URL || process.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "") + '/api/auth';

const trustedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://spendsmart.swapnilchristian.dev",
  process.env.VITE_API_URL as string
];

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
  baseURL: baseURL,
  plugins: [
    emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
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
            } catch (error) {
              console.error("Error sending OTP email:", error);
            }
        },
    })
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url, token }) {
      try {
        await transporter.sendMail({
          from: '"SpendSmart" <spendsmart.noreply@gmail.com>',
          to: user.email,
          subject: "Reset your SpendSmart password",
          text: `Click the link to reset your password: ${url}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reset Your Password</h2>
              <p>You requested a password reset for your SpendSmart account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${url}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0;">Reset Password</a>
              <p style="color: #666; font-size: 14px;">If you didn't ask to reset your password, you can ignore this email.</p>
              <p style="color: #666; font-size: 12px; margin-top: 24px;">Link: ${url}</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Error sending reset password email:", error);
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
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
    },
    // Ensure email sending completes before response (required for Vercel/serverless)
    deferTasks: false
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
