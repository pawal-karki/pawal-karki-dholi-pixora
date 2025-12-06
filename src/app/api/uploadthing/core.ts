import {
  createUploadthing,
  type FileRouter as UploadthingFileRouter,
} from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

/**
 * Authenticate user from either Clerk or JWT session
 * Returns user metadata for upload tracking
 */
const authenticateUser = async () => {
  try {
    // Try Clerk auth first
    const clerkUser = await currentUser();
    if (clerkUser) {
      // For Clerk users, we can allow upload even if not in DB yet
      // (they might be creating their agency)
      const user = await db.user.findUnique({
        where: { email: clerkUser.emailAddresses[0].emailAddress },
      });

      return {
        userId: user?.id || clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        role: user?.role || "AGENCY_OWNER",
        agencyId: user?.agencyId || null,
      };
    }

    // Fall back to JWT auth
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await db.user.findUnique({
          where: { email: decoded.email },
        });

        if (user) {
          return {
            userId: user.id,
            email: user.email,
            role: user.role,
            agencyId: user.agencyId,
          };
        }

        // JWT user not in DB yet - allow with JWT data
        return {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role || "AGENCY_OWNER",
          agencyId: null,
        };
      }
    }

    // No valid auth found
    throw new UploadThingError("Unauthorized - Please sign in to upload files");
  } catch (error) {
    console.error("Upload auth error:", error);
    if (error instanceof UploadThingError) {
      throw error;
    }
    throw new UploadThingError("Authentication failed");
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  subaccountLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Subaccount logo uploaded by:", metadata.userId);
      return { uploadedBy: metadata.userId };
    }),

  avatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploaded by:", metadata.userId);
      return { uploadedBy: metadata.userId };
    }),

  agencyLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Agency logo uploaded by:", metadata.userId);
      return { uploadedBy: metadata.userId };
    }),

  media: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Media uploaded by:", metadata.userId);
      return { uploadedBy: metadata.userId };
    }),
} satisfies UploadthingFileRouter;

export type OurFileRouter = typeof ourFileRouter;
