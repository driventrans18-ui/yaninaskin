"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface ReviewCardProps {
  name: string;
  handle: string;
  review: string;
  rating: number;
  imageUrl?: string;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const ReviewCard = React.forwardRef<HTMLDivElement, ReviewCardProps>(
  ({ name, handle, review, rating, imageUrl, className }, ref) => {
    const initials = React.useMemo(
      () =>
        name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("") || "?",
      [name],
    );

    const authorId = React.useId();
    const contentId = React.useId();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "bg-card text-card-foreground border rounded-xl p-6 shadow-sm w-full max-w-md",
          className,
        )}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        role="article"
        aria-labelledby={authorId}
        aria-describedby={contentId}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`Avatar of ${name}`}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                aria-hidden
                className="w-12 h-12 rounded-full bg-accent/30 text-foreground/80 flex items-center justify-center text-sm font-semibold shrink-0"
              >
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h3 id={authorId} className="text-lg font-semibold truncate">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{handle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-lg font-bold shrink-0">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        <p id={contentId} className="mt-4 text-sm text-muted-foreground">
          {review}
        </p>
      </motion.div>
    );
  },
);

ReviewCard.displayName = "ReviewCard";

export { ReviewCard };
