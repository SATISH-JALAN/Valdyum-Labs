'use client';

import React, { useRef, useState, useEffect } from 'react';

interface HoverBorderGradientProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  containerClassName?: string;
  className?: string;
  children: React.ReactNode;
}

export function HoverBorderGradient({
  children,
  containerClassName = '',
  className = '',
  as: Tag = 'button',
  ...props
}: HoverBorderGradientProps) {
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setAngle((prev) => (prev + 1.5) % 360);
    }, 16);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const gradient = `conic-gradient(from ${angle}deg, #799ee0, #c084fc, #f472b6, #fb923c, #facc15, #34d399, #799ee0)`;

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative inline-flex rounded-xl cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] ${containerClassName}`}
      {...props}
    >
      {/* Gradient border layer — uses background + mask trick to only show as border */}
      <span
        className="absolute inset-0 rounded-xl transition-opacity duration-500"
        style={{
          background: gradient,
          opacity: hovered ? 1 : 0.7,
        }}
      />

      {/* Inner content — covers the gradient, leaving only the edge visible */}
      <span
        className={`relative z-10 m-[2px] rounded-[10px] px-6 py-2.5 text-[14px] font-medium inline-flex items-center justify-center ${className}`}
      >
        {children}
      </span>
    </Tag>
  );
}
