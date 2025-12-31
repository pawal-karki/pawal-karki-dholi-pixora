"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  handle: string;
  quote: string;
  avatarColor: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Prashant Sharma",
    handle: "@prashant_sharma",
    quote:
      "As a marketing professional, I rely on data to drive my campaigns. Pixora has been instrumental in helping me analyze and visualize data effectively.",
    avatarColor: "bg-purple-500",
    initials: "PS",
  },
  {
    id: "2",
    name: "Sita Rai",
    handle: "@sita_rai",
    quote:
      "Pixora transformed my small business. The order management system is incredibly intuitive and has saved me hours of manual work every day.",
    avatarColor: "bg-purple-500",
    initials: "SR",
  },
  {
    id: "3",
    name: "Ramesh Thapa",
    handle: "@ramesh_thapa",
    quote:
      "The SMS automation feature reduced our return rates by 40%. Customers love getting real-time updates about their orders.",
    avatarColor: "bg-blue-500",
    initials: "RT",
  },
  {
    id: "4",
    name: "Anjali Gurung",
    handle: "@anjali_gurung",
    quote:
      "Setting up my online store was so easy with Pixora. Within minutes, I had a professional website running and taking orders.",
    avatarColor: "bg-green-500",
    initials: "AG",
  },
  {
    id: "5",
    name: "Bikash Shrestha",
    handle: "@bikash_shrestha",
    quote:
      "The logistics integration is a game-changer. No more manual data entry across multiple portals. Everything syncs perfectly.",
    avatarColor: "bg-orange-500",
    initials: "BS",
  },
  {
    id: "6",
    name: "Maya Tamang",
    handle: "@maya_tamang",
    quote:
      "Customer support is exceptional. They helped me customize everything to match my brand perfectly. Highly recommended!",
    avatarColor: "bg-red-500",
    initials: "MT",
  },
  {
    id: "7",
    name: "Dipesh Karki",
    handle: "@dipesh_karki",
    quote:
      "The analytics dashboard gives me insights I never had before. I can track everything from sales to customer behavior in real-time.",
    avatarColor: "bg-teal-500",
    initials: "DK",
  },
  {
    id: "8",
    name: "Sunita Magar",
    handle: "@sunita_magar",
    quote:
      "Pixora's payment integration made it so easy for my customers to pay. Sales increased by 60% in the first month!",
    avatarColor: "bg-pink-500",
    initials: "SM",
  },
];

// Duplicate testimonials for seamless infinite scroll
const duplicatedTestimonials = [...testimonials, ...testimonials];

interface TestimonialsSectionProps {
  customTestimonials?: any[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ customTestimonials }) => {
  const items = React.useMemo(() => {
    if (customTestimonials && customTestimonials.length > 0) {
      return customTestimonials.map((t) => ({
        id: t.id,
        name: t.name,
        handle: `@${t.name.split(' ')[0].toLowerCase()}`,
        quote: t.message,
        avatarUrl: t.avatarUrl,
        initials: t.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
        avatarColor: 'bg-primary'
      }));
    }
    return testimonials;
  }, [customTestimonials]);

  const displayItems = [...items, ...items];

  return (
    <section
      id="testimonials"
      className="py-20 px-4 md:px-6 lg:px-8 bg-background scroll-mt-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Here's what real businesses are saying about their experience with
            Pixora
          </h2>
        </div>

        {/* Left to Right Moving Cards */}
        <div className="mb-12">
          <InfiniteMovingCards
            items={displayItems}
            direction="right"
            speed="slow"
          />
        </div>

        {/* Right to Left Moving Cards */}
        <div>
          <InfiniteMovingCards
            items={displayItems}
            direction="left"
            speed="slow"
          />
        </div>
      </div>
    </section>
  );
};

interface InfiniteMovingCardsProps {
  items: any[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      }

      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "60s");
      }
    }
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((testimonial, idx) => (
          <li
            className="w-[350px] h-[200px] max-w-full relative shrink-0"
            key={`${testimonial.id}-${idx}`}
          >
            <TestimonialCard testimonial={testimonial} />
          </li>
        ))}
        {items.map((testimonial, idx) => (
          <li
            className="w-[350px] h-[200px] max-w-full relative shrink-0"
            key={`${testimonial.id}-duplicate-${idx}`}
          >
            <TestimonialCard testimonial={testimonial} />
          </li>
        ))}
      </ul>
    </div>
  );
};

interface TestimonialCardProps {
  testimonial: any;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full w-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Quote Icon */}
        <div className="absolute top-4 right-4 opacity-20 z-0">
          <Quote className="h-12 w-12 text-primary" />
        </div>

        {/* Avatar */}
        <div className="flex items-start gap-4 mb-4 flex-shrink-0 relative z-10">
          <div
            className={cn(
              "h-12 w-12 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 relative",
              testimonial.avatarColor || "bg-primary"
            )}
          >
            {testimonial.avatarUrl ? (
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="h-full w-full object-cover"
              />
            ) : (
              testimonial.initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-0.5 truncate">
              {testimonial.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {testimonial.handle}
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="flex-1 overflow-hidden relative z-10">
          <p
            className="text-sm text-foreground leading-relaxed"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            "{testimonial.quote}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsSection;
