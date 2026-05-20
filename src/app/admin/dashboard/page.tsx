"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  FileText,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  AlertCircle,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
type LeadStatus = "NEW" | "CONTACTED" | "PENDING" | "CONVERTED";

type RecentLead = {
  id: string;
  fullName: string;
  serviceInterest: string | null;
  status: LeadStatus;
  submissionDate: string;
  email: string;
  phoneNumber: string | null;
};

type DashboardStats = {
  totalLeads: number;
  leadsTrend: string;
  totalReferrals: number;
  referralsTrend: string;
  totalTestimonials: number;
  testimonialsTrend: string;
  pendingLeads: number;
  pendingTrend: string;
};

type DashboardData = {
  stats: DashboardStats;
  recentLeads: RecentLead[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW:       { label: "New",       className: "bg-blue-100 text-blue-700" },
  CONTACTED: { label: "Contacted", className: "bg-green-100 text-green-700" },
  PENDING:   { label: "Pending",   className: "bg-amber-100 text-amber-700" },
  CONVERTED: { label: "Converted", className: "bg-primary/10 text-primary" },
};

function formatLeadDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d))     return `Today, ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy");
}

function TrendBadge({ trend }: { trend: string }) {
  const isPositive = trend.startsWith("+");
  const isNeutral  = trend === "0%";
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold mt-1 ${
      isNeutral  ? "text-gray-400" :
      isPositive ? "text-emerald-600" : "text-red-500"
    }`}>
      {isNeutral  ? <Minus size={12} /> :
       isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {trend} from last month
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 animate-pulse">
      <div className="p-3 rounded-xl bg-gray-200 w-12 h-12" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-7 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
      <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const stats = data?.stats;
  const recentLeads = data?.recentLeads ?? [];

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads ?? 0,
      trend: stats?.leadsTrend ?? "0%",
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/leads",
    },
    {
      title: "Referrals",
      value: stats?.totalReferrals ?? 0,
      trend: stats?.referralsTrend ?? "0%",
      icon: ClipboardList,
      color: "bg-primary",
      href: "/admin/referrals",
    },
    {
      title: "Testimonials",
      value: stats?.totalTestimonials ?? 0,
      trend: stats?.testimonialsTrend ?? "0%",
      icon: Star,
      color: "bg-purple-500",
      href: "/admin/testimonials",
    },
    {
      title: "New This Month",
      value: stats?.pendingLeads ?? 0,
      trend: stats?.pendingTrend ?? "0%",
      icon: ArrowUpRight,
      color: "bg-amber-500",
      href: "/admin/leads",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, here is what's happening today.</p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          title="Refresh data"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-primary/40 hover:text-primary transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="ml-auto text-xs font-bold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
              <Link
                key={stat.title}
                href={stat.href}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className={`p-3 rounded-xl text-white ${stat.color} group-hover:scale-105 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-dark mt-0.5 tabular-nums">
                    {stat.value.toLocaleString()}
                  </h3>
                  <TrendBadge trend={stat.trend} />
                </div>
              </Link>
            ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-dark font-serif text-lg">Recent Leads</h2>
            <Link
              href="/admin/leads"
              className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
            >
              View All <ExternalLink size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Service</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={32} className="text-gray-300" />
                        <p>No leads yet. They'll appear here once submitted.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-dark">{lead.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{lead.email}</p>
                      </td>
                      <td className="p-4 text-gray-600">
                        {lead.serviceInterest || <span className="text-gray-300 italic">—</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[lead.status].className}`}>
                          {statusConfig[lead.status].label}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatLeadDate(lead.submissionDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="font-bold text-dark font-serif text-lg mb-5">Quick Actions</h2>
          <div className="space-y-3 flex-1">
            {[
              {
                label: "View All Leads",
                desc: "Manage & follow up contact leads",
                icon: Users,
                href: "/admin/leads",
                color: "text-blue-500",
              },
              {
                label: "Review Testimonials",
                desc: "Approve or manage client reviews",
                icon: MessageSquare,
                href: "/admin/testimonials",
                color: "text-purple-500",
              },
              {
                label: "View Referrals",
                desc: "Track patient referral submissions",
                icon: ClipboardList,
                href: "/admin/referrals",
                color: "text-primary",
              },
              {
                label: "Site Settings",
                desc: "Maintenance mode, GTM & contacts",
                icon: FileText,
                href: "/admin/settings",
                color: "text-amber-500",
              },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors ${action.color}`}>
                  <action.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm group-hover:text-primary transition-colors truncate">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{action.desc}</p>
                </div>
                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          {/* Live data badge */}
          {!loading && !error && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live data · Updated just now
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
