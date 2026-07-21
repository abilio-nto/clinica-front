"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}

const FROM_CLASS: Record<NonNullable<RevealProps["from"]>, string> = {
  bottom: "slide-in-from-bottom-6",
  left: "slide-in-from-left-8",
  right: "slide-in-from-right-8",
};

export function Reveal({ children, className = "", delay = 0, from = "bottom" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
      className={`${visible ? `animate-in fade-in ${FROM_CLASS[from]} duration-700 fill-mode-both` : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}
