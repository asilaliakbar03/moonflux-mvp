"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import {
  Code,
  Globe,
  AtSign,
  Wallet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
} from "lucide-react";

const MOCK_LISTINGS = [
  {
    id: "1",
    name: "DogeDoge",
    ticker: "$DDOGE",
    communitySize: 12500,
    askingPrice: 500,
    aiValuation: 450,
    moonScore: 85,
    status: "LISTED",
    assets: { code: true, domain: true, socials: true, treasury: true },
  },
  {
    id: "2",
    name: "CatCoinX",
    ticker: "$CCX",
    communitySize: 8200,
    askingPrice: 120,
    aiValuation: 150,
    moonScore: 92,
    status: "IN NEGOTIATION",
    assets: { code: true, domain: true, socials: true, treasury: false },
  },
  {
    id: "3",
    name: "ApeFi",
    ticker: "$APEFI",
    communitySize: 45000,
    askingPrice: 1500,
    aiValuation: 1400,
    moonScore: 78,
    status: "SOLD",
    assets: { code: true, domain: true, socials: true, treasury: true },
  },
  {
    id: "4",
    name: "MoonBase",
    ticker: "$MBASE",
    communitySize: 3100,
    askingPrice: 85,
    aiValuation: 90,
    moonScore: 65,
    status: "LISTED",
    assets: { code: true, domain: false, socials: true, treasury: false },
  },
  {
    id: "5",
    name: "SolRunner",
    ticker: "$SRUN",
    communitySize: 15600,
    askingPrice: 420,
    aiValuation: 400,
    moonScore: 88,
    status: "LISTED",
    assets: { code: true, domain: true, socials: true, treasury: true },
  },
  {
    id: "6",
    name: "PepeWifHat",
    ticker: "$PWH",
    communitySize: 22000,
    askingPrice: 800,
    aiValuation: 850,
    moonScore: 95,
    status: "IN NEGOTIATION",
    assets: { code: true, domain: true, socials: true, treasury: true },
  },
];

export default function MarketplacePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState("ALL");
  const [sortBy, setSortBy] = useState("PRICE");

  const borderClass = `border-2 ${
    isDark ? "border-[rgba(255,255,255,0.15)]" : "border-black"
  }`;
  const textClass = isDark ? "text-white" : "text-black";
  const bgClass = isDark ? "bg-[#050510]" : "bg-white";
  const cardBgClass = isDark ? "bg-[#0a0a1a]" : "bg-gray-50";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LISTED":
        return "text-[#10B981] bg-[#10B981]/10";
      case "IN NEGOTIATION":
        return "text-[#F59E0B] bg-[#F59E0B]/10";
      case "SOLD":
        return "text-[#F43F5E] bg-[#F43F5E]/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getMoonScoreColor = (score: number) => {
    if (score >= 90) return "text-[#10B981]";
    if (score >= 70) return "text-[#F59E0B]";
    return "text-[#F43F5E]";
  };

  const filteredListings = MOCK_LISTINGS.filter((listing) => {
    if (activeTab === "ALL") return true;
    return listing.status === activeTab;
  }).sort((a, b) => {
    if (sortBy === "PRICE") return b.askingPrice - a.askingPrice;
    if (sortBy === "USERS") return b.communitySize - a.communitySize;
    if (sortBy === "MOONSCORE") return b.moonScore - a.moonScore;
    return 0; // NEWEST would need a date field, keeping simple
  });

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} font-mono p-6 md:p-12`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wider">
            [ ACQUISITION MARKETPLACE ]
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 uppercase tracking-widest">
            Buy Projects. Not Just Tokens.
          </p>
        </div>

        {/* Controls */}
        <div className={`flex flex-col md:flex-row justify-between items-center p-4 ${borderClass} shadow-[4px_4px_0px_0px_#000] gap-4`}>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {["ALL", "LISTED", "IN NEGOTIATION", "SOLD"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 uppercase font-bold text-sm transition-all ${
                  activeTab === tab
                    ? "bg-[#6366F1] text-white shadow-[2px_2px_0px_0px_#000]"
                    : `hover:bg-gray-200 dark:hover:bg-gray-800 ${textClass}`
                }`}
              >
                [{tab}]
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={20} className={textClass} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`p-2 uppercase font-bold text-sm bg-transparent ${borderClass} cursor-pointer focus:outline-none`}
            >
              <option value="PRICE">PRICE</option>
              <option value="USERS">USERS</option>
              <option value="MOONSCORE">MOONSCORE</option>
              <option value="NEWEST">NEWEST</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`${cardBgClass} ${borderClass} p-6 flex flex-col gap-6 shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold uppercase truncate">
                    {listing.name}
                  </h2>
                  <p className="text-[#6366F1] font-bold text-lg">
                    {listing.ticker}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 text-xs font-bold uppercase ${getStatusColor(
                    listing.status
                  )} ${borderClass}`}
                >
                  {listing.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`p-3 ${borderClass} flex flex-col items-center justify-center`}>
                  <span className="text-gray-500 text-xs mb-1">COMMUNITY</span>
                  <span className="font-bold">{listing.communitySize.toLocaleString()}</span>
                </div>
                <div className={`p-3 ${borderClass} flex flex-col items-center justify-center`}>
                  <span className="text-gray-500 text-xs mb-1">MOONSCORE</span>
                  <span className={`font-bold text-lg ${getMoonScoreColor(listing.moonScore)}`}>
                    {listing.moonScore}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-sm">Asking Price</span>
                  <span className="font-bold text-xl">{listing.askingPrice} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-sm">AI Valuation</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{listing.aiValuation} SOL</span>
                    {listing.aiValuation > listing.askingPrice ? (
                      <TrendingUp className="text-[#10B981]" size={16} />
                    ) : (
                      <TrendingDown className="text-[#F43F5E]" size={16} />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-gray-500 text-xs uppercase block">Assets Included</span>
                <div className="flex gap-4 justify-center">
                  <Code size={20} className={listing.assets.code ? "text-[#0EA5E9]" : "text-gray-400 opacity-30"} />
                  <Globe size={20} className={listing.assets.domain ? "text-[#0EA5E9]" : "text-gray-400 opacity-30"} />
                  <AtSign size={20} className={listing.assets.socials ? "text-[#0EA5E9]" : "text-gray-400 opacity-30"} />
                  <Wallet size={20} className={listing.assets.treasury ? "text-[#0EA5E9]" : "text-gray-400 opacity-30"} />
                </div>
              </div>

              <Link
                href={`/marketplace/${listing.id}`}
                className={`mt-auto w-full py-3 flex items-center justify-center gap-2 font-bold uppercase transition-colors ${
                  listing.status === "SOLD"
                    ? "bg-gray-500 text-white cursor-not-allowed"
                    : "bg-[#0EA5E9] hover:bg-[#0284c7] text-white shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                } ${borderClass}`}
                onClick={(e) => listing.status === "SOLD" && e.preventDefault()}
              >
                {listing.status === "SOLD" ? "SOLD OUT" : "VIEW LISTING"}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
