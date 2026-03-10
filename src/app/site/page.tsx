import { pricingCards } from "@/lib/constant";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import clsx from "clsx";
import { Check } from "lucide-react";
import Link from "next/link";
import TestimonialsSection from "@/components/site/testimonials";
import { getAllTestimonials } from "@/lib/queries";
import SiteContactForm from "@/components/site/contact-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const testimonials = await getAllTestimonials();
  return (
    <>
      <section className="h-full w-full pt-36 md:pt-44 relative flex items-center justify-center flex-col" id="features">
        {/* grid */}

        {/* Grid - light mode uses dark lines, dark mode uses lighter lines */}
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#2a2a2a_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />

        <p className="text-center mt-4 text-lg text-muted-foreground">
          Build your site with drag-and-drop for your online presence.
        </p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Pixora
          </h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-70px]">
          <Image
            src="/site.png"
            alt="site"
            width={1200}
            height={1200}
            className="rounded-tl-2xl rounded-br-2xl rounded-tr-2xl border-2 border-muted"
          />
          <div className="bottom-0 top-[-50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
      {/* Pricing section – target for navbar `#pricing` link */}
      <section
        id="pricing"
        className="flex justify-center items-center flex-col gap-4 md:mt-20 px-4 pb-20 scroll-mt-32 md:scroll-mt-40 lg:scroll-mt-48"
      >
        <h2 className="text-4xl font-bold text-center">
          Create your website in minutes
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-lg">
          Create your website in minutes with our easy to use drag and drop
          builder.
        </p>
        {/* pricing cards link from the navigation bar*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-6xl">
          {pricingCards.map((card) => (
            <Card
              key={card.title}
              className={clsx(
                "flex flex-col h-full transition-all duration-300",
                {
                  "border-2 border-primary card-glow card-glow-hover":
                    card.title === "Pro",
                  "card-subtle-glow": card.title !== "Pro",
                }
              )}
            >
              <CardHeader className="pb-4">
                <CardTitle
                  className={clsx("text-xl font-bold", {
                    "text-primary": card.title === "Pro",
                  })}
                >
                  {card.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground min-h-[40px]">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 flex-grow">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{card.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {card.duration}
                  </span>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold mb-3">{card.highlight}</p>
                  <ul className="flex flex-col gap-2">
                    {card.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-4 mt-auto">
                <Link
                  href={`/agency?plan=${card.priceId}`}
                  className={clsx(
                    "w-full text-center py-2.5 rounded-md font-medium transition-all duration-300",
                    {
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_4px_20px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]":
                        card.title === "Pro",
                      "bg-muted hover:bg-muted/80 hover:shadow-sm":
                        card.title !== "Pro",
                    }
                  )}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section – target for navbar `#about` link */}
      <section
        id="about"
        className="w-full bg-muted/30 border-y border-border/60 py-16 md:py-20 px-4 scroll-mt-32 md:scroll-mt-40 lg:scroll-mt-48"
      >
        <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for modern agencies and creators
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Pixora combines a powerful drag-and-drop funnel builder with a CRM and client
              portal so you can manage everything from one place. Launch high-converting
              pages, track leads, and handle client communication without jumping between
              tools.
            </p>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Whether you&apos;re a solo creator or a growing agency, Pixora helps you ship
              faster, stay organized, and deliver a premium experience to your clients.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-sm font-semibold">Drag-and-drop funnels</p>
                <p className="text-xs text-muted-foreground">
                  Launch beautiful, responsive pages in minutes with reusable blocks.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Client workspaces</p>
                <p className="text-xs text-muted-foreground">
                  Give each client their own sub-account, pipelines, and reporting.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Automation-ready</p>
                <p className="text-xs text-muted-foreground">
                  Connect payments, triggers, and notifications to keep work flowing.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-amber-500/10 blur-2xl" />
            <div className="relative rounded-2xl border border-border/70 bg-background/80 p-5 shadow-lg space-y-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Why teams choose Pixora
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Unified workspace for funnels, contacts, and pipelines.</li>
                <li>• Built-in client chat to keep conversations in context.</li>
                <li>• Stripe-powered billing and subscription management.</li>
                <li>• Fine-grained permissions for agency owners and team members.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection customTestimonials={testimonials} />

      {/* Contact Section – target for navbar `#contact` link */}
      <section
        id="contact"
        className="w-full py-16 md:py-20 px-4 bg-gradient-to-b from-background via-background to-muted/40 scroll-mt-32 md:scroll-mt-40 lg:scroll-mt-48"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
          <div className="text-center max-w-2xl space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Let&apos;s talk about your next project
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Send us a message and our team will reach out with next steps. All inquiries
              land directly in your agency dashboard so nothing slips through the cracks.
            </p>
          </div>
          <SiteContactForm />
        </div>
      </section>
    </>
  );
}
