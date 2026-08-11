"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export interface MoonScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  breakdown?: {
    community: number;
    liquidity: number;
    growth: number;
    security: number;
  };
}

export function MoonScore({
  score,
  size = "md",
  showBreakdown = false,
  breakdown,
}: MoonScoreProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine color based on score
  const getColor = (s: number) => {
    if (s <= 30) return "#F43F5E"; // Red
    if (s <= 60) return "#F59E0B"; // Gold
    return "#10B981"; // Green
  };

  const scoreColor = getColor(score);
  const borderClass = `border-2 ${
    isDark ? "border-[rgba(255,255,255,0.15)]" : "border-black"
  }`;
  const shadowClass = "shadow-[4px_4px_0px_0px_#000]";
  const bgClass = isDark ? "bg-[#050510]" : "bg-white";
  const textClass = isDark ? "text-white" : "text-black";

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={`animate-pulse rounded-full bg-gray-200`} />;
  }

  if (size === "sm") {
    return (
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${borderClass} ${shadowClass} ${bgClass}`}
        style={{ color: scoreColor }}
      >
        {score}
      </div>
    );
  }

  // Configuration for md and lg gauges
  const radius = size === "lg" ? 60 : 40;
  const stroke = size === "lg" ? 12 : 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-6 font-mono ${textClass}`}>
      <div
        className={`relative flex items-center justify-center rounded-full ${borderClass} ${shadowClass} ${bgClass} p-4`}
      >
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg]"
        >
          {/* Background Circle */}
          <circle
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Animated Score Circle */}
          <motion.circle
            stroke={scoreColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="square"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span
            className={`font-bold ${size === "lg" ? "text-4xl" : "text-2xl"}`}
            style={{ color: scoreColor }}
          >
            {score}
          </span>
          <span
            className={`uppercase tracking-wider ${
              size === "lg" ? "text-sm" : "text-[10px]"
            } opacity-70`}
          >
            MoonScore
          </span>
        </div>
      </div>

      {size === "lg" && showBreakdown && breakdown && (
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Community", value: breakdown.community },
            { label: "Liquidity", value: breakdown.liquidity },
            { label: "Growth", value: breakdown.growth },
            { label: "Security", value: breakdown.security },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center p-3 ${borderClass} ${shadowClass} ${bgClass}`}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                {item.label}
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: getColor(item.value) }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
