import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "spendsmart.noreply@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function main() {
  console.log("Testing email configuration...");
  console.log(`User: spendsmart.noreply@gmail.com`);
  console.log(`Password configured: ${process.env.GMAIL_APP_PASSWORD ? "YES" : "NO"}`);

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("ERROR: GMAIL_APP_PASSWORD is not set in .env file");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: '"SpendSmart Test" <spendsmart.noreply@gmail.com>',
      to: "spendsmart.noreply@gmail.com", // Send to self to test
      subject: "SpendSmart SMTP Test",
      text: "If you receive this, your email configuration is working correctly!",
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
