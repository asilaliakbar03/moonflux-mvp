"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ToastProvider";
import { useMoonWallet } from "@/components/WalletProvider";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Brain,
  History,
  Info
} from "lucide-react";

// Reuse mock data for detail view
const MOCK_DB: Record<string, any> = {
  "1": {
    id: "1",
    name: "DogeDoge",
    ticker: "$DDOGE",
    description: "The premier double-doge meta token. We have built a strong community of meme enthusiasts and are looking to hand over the reins to a capable team who can take this to a $100M market cap. The custom contract includes anti-bot measures and reflection mechanisms.",
    communitySize: 12500,
    activeUsers: 3400,
    twitterFollowers: 25000,
    discordMembers: 18000,
    treasuryBalance: 25.5,
    askingPrice: 500,
    aiValuation: 450,
    aiReasoning: "Valuation based on robust social engagement, but slightly inflated asking price relative to recent memecoin acquisition trends. The treasury balance of 25.5 SOL adds a solid baseline value.",
    moonScore: 85,
    status: "LISTED",
    assets: { code: true, domain: true, socials: true, treasury: true },
    bids: [
      { id: "b1", amount: 400, wallet: "7Xk...3pz", time: "2 hours ago" },
      { id: "b2", amount: 350, wallet: "9Yj...1ax", time: "5 hours ago" },
    ]
  },
  "2": {
    id: "2",
    name: "CatCoinX",
    ticker: "$CCX",
    description: "A fast-growing cat token with real utility in the upcoming CatVerse game. Selling the project to focus on other ventures. Needs strong marketing to push past the current plateau.",
    communitySize: 8200,
    activeUsers: 1200,
    twitterFollowers: 12000,
    discordMembers: 4500,
    treasuryBalance: 0,
    askingPrice: 120,
    aiValuation: 150,
    aiReasoning: "Strong active user ratio. The lack of a treasury is a downside, but the code architecture and domain hold intrinsic value exceeding the asking price. Good bargain.",
    moonScore: 92,
    status: "IN NEGOTIATION",
    assets: { code: true, domain: true, socials: true, treasury: false },
    bids: [
      { id: "b3", amount: 110, wallet: "4Aw...9bq", time: "1 day ago" },
      { id: "b4", amount: 115, wallet: "2Zq...4px", time: "12 hours ago" },
    ]
  }
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const { address, connected } = useMoonWallet();
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = (params?.id as string) || '1';
  // Fallback to first item if ID not in mock DB
  const listing = MOCK_DB[id] || MOCK_DB["1"];

  const borderClass = `border-2 ${
    isDark ? "border-[rgba(255,255,255,0.15)]" : "border-black"
  }`;
  const textClass = isDark ? "text-white" : "text-black";
  const bgClass = isDark ? "bg-[#050510]" : "bg-white";
  const panelBgClass = isDark ? "bg-[#0a0a1a]" : "bg-gray-50";

  const handlePlaceBid = async () => {
    if (!connected) {
      showToast("Please connect your wallet first", "error");
      return;
    }
    if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
      showToast("Please enter a valid bid amount", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          bidderWallet: address,
          amountSol: Number(bidAmount)
        })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully placed bid of ${bidAmount} SOL`, "success");
        setBidAmount("");
      } else {
        showToast("Failed to place bid", "error");
      }
    } catch (e) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const AssetRow = ({ name, included }: { name: string; included: boolean }) => (
    <div className={`flex justify-between items-center p-3 ${borderClass} bg-transparent`}>
      <span className="uppercase font-bold text-sm">{name}</span>
      {included ? (
        <CheckCircle2 className="text-[#10B981]" size={20} />
      ) : (
        <XCircle className="text-[#F43F5E]" size={20} />
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} font-mono p-4 md:p-12`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <Link 
          href="/marketplace" 
          className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity uppercase font-bold text-sm"
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>

        {/* Header Section */}
        <div className={`p-8 ${panelBgClass} ${borderClass} shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                {listing.name}
              </h1>
              <span className={`px-4 py-1 text-sm font-bold uppercase ${borderClass} ${
                listing.status === "LISTED" ? "bg-[#10B981]/20 text-[#10B981]" :
                listing.status === "IN NEGOTIATION" ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
                "bg-[#F43F5E]/20 text-[#F43F5E]"
              }`}>
                {listing.status}
              </span>
            </div>
            <p className="text-2xl text-[#6366F1] font-bold">{listing.ticker}</p>
          </div>
          
          <div className={`p-4 ${borderClass} bg-black text-white text-center min-w-[200px]`}>
            <p className="text-sm text-gray-400 mb-1 uppercase">Asking Price</p>
            <p className="text-3xl font-black text-[#F59E0B]">{listing.askingPrice} SOL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left, 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className={`p-6 ${panelBgClass} ${borderClass} shadow-[4px_4px_0px_0px_#000]`}>
              <h3 className="text-xl font-bold uppercase mb-4 border-b-2 border-current pb-2 flex items-center gap-2">
                <Info size={20} /> Project Overview
              </h3>
              <p className="leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Holders", val: listing.communitySize },
                { label: "Active", val: listing.activeUsers },
                { label: "Twitter", val: listing.twitterFollowers },
                { label: "Discord", val: listing.discordMembers },
              ].map((m, i) => (
                <div key={i} className={`p-4 ${panelBgClass} ${borderClass} shadow-[4px_4px_0px_0px_#000] text-center`}>
                  <p className="text-xs text-gray-500 uppercase mb-2">{m.label}</p>
                  <p className="text-xl font-bold">{m.val.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* AI Valuation */}
            <div className={`p-6 bg-[#6366F1]/10 ${borderClass} border-[#6366F1] shadow-[4px_4px_0px_0px_#6366F1]`}>
              <h3 className="text-xl font-bold uppercase mb-4 text-[#6366F1] flex items-center gap-2">
                <Brain size={24} /> AI Valuation Report
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className={`p-4 ${bgClass} ${borderClass} min-w-[150px] text-center`}>
                  <p className="text-sm text-gray-500 uppercase mb-1">Estimated Value</p>
                  <p className="text-2xl font-black">{listing.aiValuation} SOL</p>
                </div>
                <p className="flex-1 text-sm leading-relaxed">{listing.aiReasoning}</p>
              </div>
            </div>
          </div>

          {/* Sidebar (Right, 1 col) */}
          <div className="space-y-8">
            {/* Bidding Area */}
            <div className={`p-6 ${panelBgClass} ${borderClass} shadow-[4px_4px_0px_0px_#000] space-y-4`}>
              <h3 className="text-xl font-bold uppercase border-b-2 border-current pb-2">
                Place Bid
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase">Amount (SOL)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full p-4 bg-transparent ${borderClass} font-bold text-xl outline-none focus:border-[#F59E0B] transition-colors`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">SOL</span>
                </div>
              </div>

              <button
                onClick={handlePlaceBid}
                disabled={isSubmitting || listing.status === "SOLD"}
                className={`w-full py-4 mt-2 font-black text-xl uppercase tracking-wider text-black transition-all ${
                  listing.status === "SOLD"
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#F59E0B] hover:bg-[#d97706] shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]"
                } ${borderClass}`}
              >
                {isSubmitting ? "Processing..." : "Place Bid"}
              </button>
            </div>

            {/* Assets Checklist */}
            <div className={`p-6 ${panelBgClass} ${borderClass} shadow-[4px_4px_0px_0px_#000] space-y-4`}>
              <h3 className="text-xl font-bold uppercase border-b-2 border-current pb-2">
                Assets Included
              </h3>
              <div className="space-y-2">
                <AssetRow name="Smart Contract Code" included={listing.assets.code} />
                <AssetRow name="Web Domains" included={listing.assets.domain} />
                <AssetRow name="Social Accounts" included={listing.assets.socials} />
                <AssetRow name={`Treasury (${listing.treasuryBalance} SOL)`} included={listing.assets.treasury} />
              </div>
            </div>

            {/* Bid History */}
            <div className={`p-6 ${panelBgClass} ${borderClass} shadow-[4px_4px_0px_0px_#000] space-y-4`}>
              <h3 className="text-xl font-bold uppercase border-b-2 border-current pb-2 flex items-center gap-2">
                <History size={20} /> Recent Bids
              </h3>
              <div className="space-y-3">
                {listing.bids.map((bid: any) => (
                  <div key={bid.id} className={`flex justify-between items-center p-3 ${borderClass} bg-transparent`}>
                    <div>
                      <p className="font-bold">{bid.amount} SOL</p>
                      <p className="text-xs text-gray-500">{bid.wallet}</p>
                    </div>
                    <span className="text-xs uppercase bg-black text-white px-2 py-1">{bid.time}</span>
                  </div>
                ))}
                {listing.bids.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No bids yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
