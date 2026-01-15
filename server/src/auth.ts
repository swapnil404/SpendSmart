
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import * as schema from "./db/schema";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema
  }),
  plugins: [
    emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
            console.log(`OTP for ${email}: ${otp}`);
        },
    })
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true
  },
  trustedOrigins: ["http://localhost:5173", "http://localhost:5174"],

});
