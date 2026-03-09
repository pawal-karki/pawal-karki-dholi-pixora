"use client";

import Link from "next/link";
import { Github, Twitter, Youtube, Mail } from "lucide-react";

import { cn } from "@/lib/utils";

const footerLinks = {
  product: [
    { label: "Overview", href: "/site#features" },
    { label: "Pricing", href: "/site#pricing" },
    { label: "Funnels", href: "/agency" },
  ],
  resources: [
    { label: "Docs (coming soon)", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  company: [
    { label: "About", href: "/site#about" },
    { label: "Contact", href: "/site#contact" },
  ],
};

export const SiteFooter: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className,
  ...props
}) => {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "w-full border-t border-border/60 bg-background/80 backdrop-blur",
        className
      )}
      {...props}
    >
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 flex flex-col gap-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr,1fr,1fr,1fr]">
          <div className="space-y-3">
            <Link href="/site" className="inline-flex items-center gap-2">
              <span className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Pixora
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Build, launch, and manage high‑converting funnels and client
              workspaces from a single, opinionated platform.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground/80">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:support@pixora.app"
                className="text-xs hover:text-primary transition-colors"
              >
                support@pixora.app
              </a>
            </div>
          </div>

          <FooterColumn title="Product" links={footerLinks.product} />
          <FooterColumn title="Resources" links={footerLinks.resources} />
          <FooterColumn title="Company" links={footerLinks.company} />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            © {year} Pixora. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <SocialIcon label="GitHub" href="https://github.com" Icon={Github} />
            <SocialIcon label="Twitter" href="https://x.com" Icon={Twitter} />
            <SocialIcon label="YouTube" href="https://youtube.com" Icon={Youtube} />
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterColumnProps {
  title: string;
  links: { label: string; href: string }[];
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, links }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground/90">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface SocialIconProps {
  label: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const SocialIcon: React.FC<SocialIconProps> = ({ label, href, Icon }) => {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="p-1.5 rounded-full border border-border/70 hover:border-primary/60 hover:bg-primary/5 transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
};

export default SiteFooter;

