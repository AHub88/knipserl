"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieIconProps {
  src: string;
  className?: string;
}

export default function LottieIcon({ src, className }: LottieIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animationData, setAnimationData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    fetch(src + "?v=2")
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => {});
  }, [isVisible, src]);

  return (
    <div ref={containerRef} className={className}>
      {animationData && (
        <Lottie
          animationData={animationData}
          loop
          className="w-full h-full"
        />
      )}
    </div>
  );
}
