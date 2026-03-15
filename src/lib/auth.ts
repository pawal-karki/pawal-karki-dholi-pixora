import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//Environment variables
//JWT_SECRET is used to sign and verify jwt tokens
//JWT_EXPIRES_IN is used to set the expiration time for jwt tokens

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
//JWT_EXPIRES_IN is set to 7 days
const JWT_EXPIRES_IN = "7d";

//JWTPayload is the payload of the jwt token
//userId is the id of the user
//email is the email of the user
//role is the role of the user
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

//hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

//verify password using bcrypt
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

//generate jwt token

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

//verify jwt token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
