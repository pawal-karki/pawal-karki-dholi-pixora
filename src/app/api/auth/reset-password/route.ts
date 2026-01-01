import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

interface ResetTokenPayload {
  email: string;
  tokenId: string;
  purpose: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Verify the JWT token
    let decoded: ResetTokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please restart the password reset process." },
        { status: 400 }
      );
    }

    // Check if this is a valid password reset token
    if (decoded.purpose !== "password-reset") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 400 }
      );
    }

    // Find the original password reset token in database
    const resetToken = await db.passwordResetToken.findUnique({
      where: { id: decoded.tokenId },
    });

    if (!resetToken || resetToken.used || !resetToken.verified) {
      return NextResponse.json(
        { error: "This reset token has already been used or is invalid" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark the token as used
    await db.passwordResetToken.update({
      where: { id: decoded.tokenId },
      data: { used: true },
    });

    return NextResponse.json({
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}


