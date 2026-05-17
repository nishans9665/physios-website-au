import React from "react";
import { Users, Calendar, MessageSquare, ArrowUpRight, FileText } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Leads", value: "24", icon: Users, color: "bg-blue-500", trend: "+12%" },
    { title: "Appointments", value: "12", icon: Calendar, color: "bg-primary", trend: "+5%" },
    { title: "Testimonials", value: "48", icon: MessageSquare, color: "bg-purple-500", trend: "+2%" },
    { title: "Pending Actions", value: "3", icon: ArrowUpRight, color: "bg-amber-500", trend: "-1%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, here is what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className={`p-3 rounded-xl text-white ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-dark mt-1">{stat.value}</h3>
              <p className={`text-xs mt-1 font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-gray-400'}`}>
                {stat.trend} from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-dark font-serif text-lg">Recent Leads</h2>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {/* Mock Data for now */}
                {[
                  { name: "John Doe", service: "Sports Physiotherapy", status: "New", date: "Today, 10:30 AM" },
                  { name: "Sarah Smith", service: "Post-Surgery Rehab", status: "Contacted", date: "Yesterday" },
                  { name: "Mike Johnson", service: "General Physio", status: "Pending", date: "Oct 24, 2026" },
                ].map((lead, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-dark">{lead.name}</td>
                    <td className="p-4 text-gray-600">{lead.service}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                        lead.status === 'Contacted' ? 'bg-green-100 text-green-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-dark font-serif text-lg mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left">
              <span className="font-medium text-dark group-hover:text-primary transition-colors">Add New Service</span>
              <FileText size={18} className="text-gray-400 group-hover:text-primary" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left">
              <span className="font-medium text-dark group-hover:text-primary transition-colors">Review Testimonials</span>
              <MessageSquare size={18} className="text-gray-400 group-hover:text-primary" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left">
              <span className="font-medium text-dark group-hover:text-primary transition-colors">View Calendar</span>
              <Calendar size={18} className="text-gray-400 group-hover:text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
