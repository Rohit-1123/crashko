"use client";

/**
 * ShinyText – renders children with an animated iridescent gradient.
 * Wraps an inline element; pass className for size / weight.
 */
interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function ShinyText({
  children,
  className = "",
  as: Tag = "span",
}: ShinyTextProps) {
  return (
    <Tag className={`gradient-text ${className}`}>
      {children}
    </Tag>
  );
}
