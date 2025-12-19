import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Metadata } from "next"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStripeOAuthLink = (
  accountType: "agency" | "subaccount",
  state: string
) => {
  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&state=${state}`
}

export const logger = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[LOG] ${message}`, data)
  }
}

export function constructMetadata({
  title = "Pixora - Agency Management Platform",
  description = "All in one Agency Solution",
  image = "/assets/pixora-logo.svg",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    icons,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"
    ),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
