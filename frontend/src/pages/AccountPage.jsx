import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoomCreditsCard from "@/components/LoomCreditsCard";

const TIMELINE_STEPS = ["Confirmed", "Packed", "Dispatched", "Out for Delivery", "Delivered"];

function getStepIndex(status) {
  if (status === "delivered") return 4;
  if (status === "out_for_delivery") return 3;
  if (status === "shipped") return 2;
  if (status === "packed") return 1;
  return 0;
}

function OrderTimeline(props) {
  const status = props.status;

  if (status === "cancelled") {
    return <div className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] mt-4">Order Cancelled</div>;
  }

  const activeIndex = getStepIndex(status);

  return (
    <div className="mt-5">
      {TIMELINE_STEPS.map(function (label, i) {
        const isDone = i <= activeIndex;
        const isLast = i === TIMELINE_STEPS.length - 1;
        const dotClass = isDone
          ? "w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#C9A96E]"
          : "w-2.5 h-2.5 rounded-full flex-shrink-0 bg-transparent border border-[#8A8FA8]/50";
        const lineClass = isDone && i < activeIndex
          ? "w-px flex-1 min-h-[22px] bg-[#C9A96E]"
          : "w-px flex-1 min-h-[22px] bg-[#8A8FA8]/30";
        const textClass = isDone ? "pb-5 text-[13px] text-[#F5F0E8]" : "pb-5 text-[13px] text-[#8A8FA8]";

        return (
          <div key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={dotClass}></div>
              {isLast ? null : <div className={lineClass}></div>}
            </div>
            <div className={textClass}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loom, setLoom] = useState(null);

  useEffect(() => {
    if (user) {
      api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
      api.get("/loom-credits/me").then((r) => setLoom(r.data)).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return <div className="pt-40 text-center text-[#8A8FA8] tracking-[0.3em] uppercase text-sm">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div data-testid="account-page" className="page-fade pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Your House</div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">
          Welcome,
