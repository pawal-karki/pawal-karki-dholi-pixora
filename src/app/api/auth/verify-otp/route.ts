import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find the token
    const token = await db.passwordResetToken.findFirst({
      where: {
        email: email.toLowerCase(),
        otp,
        used: false,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please try again." },
        { status: 400 }
      );
    }

    // Mark token as verified
    await db.passwordResetToken.update({
      where: { id: token.id },
      data: { verified: true },
    });

    // Generate a short-lived JWT for password reset
    const resetToken = jwt.sign(
      { 
        email: email.toLowerCase(), 
        tokenId: token.id,
        purpose: "password-reset"
      },
      JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes to complete password reset
    );

    return NextResponse.json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}


