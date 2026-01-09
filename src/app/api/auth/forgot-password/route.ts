import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOTP, sendPasswordResetOTP } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // TODO: add simple per-IP/email rate limiting to slow brute force attempts
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (!user) {
      return NextResponse.json({
        message: "If this email exists, we have sent an OTP to your inbox.",
      });
    }

    // Delete any existing unused tokens for this email
    await db.passwordResetToken.deleteMany({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
    });

    // Generate OTP and expiry (10 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the token in database
    await db.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        otp,
        expiresAt,
        verified: false,
        used: false,
      },
    });

    // Send email with OTP
    const emailSent = await sendPasswordResetOTP({
      to: email,
      otp,
      userName: user.name,
    });

    if (!emailSent) {
      // Delete the token if email failed
      await db.passwordResetToken.deleteMany({
        where: {
          email: email.toLowerCase(),
          otp,
        },
      });

      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "If this email exists, we have sent an OTP to your inbox.",
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}


