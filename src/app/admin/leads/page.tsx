"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Trash2, Mail, Phone, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

type Lead = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  message: string;
  serviceInterest: string | null;
  status: "NEW" | "CONTACTED" | "PENDING" | "CONVERTED";
  submissionDate: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeads();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      fetchLeads();
    } catch (error) {
      console.error("Failed to delete lead");
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-700";
      case "CONTACTED": return "bg-amber-100 text-amber-700";
      case "PENDING": return "bg-purple-100 text-purple-700";
      case "CONVERTED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Contact Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all incoming website inquiries and form submissions.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors">
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative sm:w-48">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="PENDING">Pending</option>
              <option value="CONVERTED">Converted</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium whitespace-nowrap">Contact Info</th>
                <th className="p-4 font-medium">Service Interest</th>
                <th className="p-4 font-medium">Message Preview</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium whitespace-nowrap">Submitted On</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-dark">{lead.fullName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {lead.email}
                      </div>
                      {lead.phoneNumber && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {lead.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{lead.serviceInterest || "-"}</td>
                    <td className="p-4 text-gray-600 max-w-[200px] truncate" title={lead.message}>
                      {lead.message}
                    </td>
                    <td className="p-4">
                      <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${getStatusColor(lead.status)}`}
                      >
                        <option value="NEW" className="bg-white text-dark">NEW</option>
                        <option value="CONTACTED" className="bg-white text-dark">CONTACTED</option>
                        <option value="PENDING" className="bg-white text-dark">PENDING</option>
                        <option value="CONVERTED" className="bg-white text-dark">CONVERTED</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {format(new Date(lead.submissionDate), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Lead"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
