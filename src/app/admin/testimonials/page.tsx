"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  Star, 
  Quote, 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Tag,
  ImageIcon,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Testimonial = {
  id: string;
  clientName: string;
  review: string;
  rating: number;
  profileImage: string | null;
  location: string | null;
  service: string | null;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  createdAt: string;
};

const popularServices = [
  "Aged Care Physio",
  "NDIS Physiotherapy",
  "Strength & Balance",
  "Mobile Physio",
  "Telehealth",
  "Sports Physiotherapy",
  "Post-Surgery Rehab",
  "General Physio"
];

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modals / Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form values
  const [clientName, setClientName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "DRAFT">("ACTIVE");
  
  // Notification banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchTestimonials();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch active login session", error);
    }
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials?admin=true");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      } else {
        showNotification("error", "Failed to fetch testimonials from database.");
      }
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
      showNotification("error", "Server error while loading testimonials.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB) and type
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image file exceeds 5MB limit.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfileImage(data.fileUrl);
          setImagePreview(data.fileUrl);
          showNotification("success", "Profile picture uploaded successfully!");
        } else {
          showNotification("error", data.error || "Failed to upload image.");
        }
      } else {
        showNotification("error", "Error uploading image file.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      showNotification("error", "Network failure during image upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditClick = (t: Testimonial) => {
    setEditingId(t.id);
    setClientName(t.clientName);
    setReview(t.review);
    setRating(t.rating);
    setLocation(t.location || "");
    setService(t.service || "");
    setProfileImage(t.profileImage || "");
    setImagePreview(t.profileImage);
    setStatus(t.status);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !review) {
      showNotification("error", "Please provide a client name and a review.");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/testimonials/${editingId}` : "/api/testimonials";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          review,
          rating,
          location: location || null,
          service: service || null,
          profileImage: profileImage || null,
          status,
        }),
      });

      if (res.ok) {
        showNotification("success", isEdit ? "Testimonial updated successfully!" : "Testimonial created successfully!");
        resetForm();
        setIsAddModalOpen(false);
        fetchTestimonials();
      } else {
        const data = await res.json();
        showNotification("error", data.error || "Failed to save testimonial.");
      }
    } catch (error) {
      console.error("Save testimonial error:", error);
      showNotification("error", "Network error. Failed to save testimonial.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification("success", "Testimonial deleted successfully.");
        fetchTestimonials();
      } else {
        const data = await res.json();
        showNotification("error", data.error || "Failed to delete testimonial.");
      }
    } catch (error) {
      console.error("Delete testimonial error:", error);
      showNotification("error", "Network error. Failed to delete testimonial.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setClientName("");
    setReview("");
    setRating(5);
    setLocation("");
    setService("");
    setProfileImage("");
    setImagePreview(null);
    setStatus("ACTIVE");
  };

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.clientName.toLowerCase().includes(search.toLowerCase()) || 
                          t.review.toLowerCase().includes(search.toLowerCase()) ||
                          (t.location && t.location.toLowerCase().includes(search.toLowerCase())) ||
                          (t.service && t.service.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700";
      case "INACTIVE": return "bg-gray-100 text-gray-600";
      case "DRAFT": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
              notification.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-rose-600 shrink-0" size={20} />
            )}
            <p className="text-sm font-semibold leading-relaxed">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Client Testimonials</h1>
          <p className="text-gray-500 text-sm mt-1">Manage verified patient testimonials, ratings, and display statuses.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-primary/95 transition-all duration-200 flex items-center gap-2 self-start cursor-pointer border-none outline-none"
        >
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      {/* Main Panel Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, review keyword, service, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative sm:w-48">
            <select
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Loading Grid/Table */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Fetching testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="py-20 text-center text-gray-400 border border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
            <Quote className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="font-semibold text-gray-600">No testimonials matches found.</p>
            <p className="text-xs text-gray-400 mt-1">Try refining your search terms or add a new testimonial.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/10 transition-all duration-300 relative group"
              >
                {/* Actions tray - visible always on mobile, hover-activated overlay on desktop */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-xs border border-gray-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10">
                  <button
                    onClick={() => handleEditClick(t)}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg border-none outline-none cursor-pointer transition-colors"
                    title="Edit Testimonial"
                  >
                    <Edit size={15} />
                  </button>
                  {currentUser?.role !== "STAFF_MANAGER" && (
                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border-none outline-none cursor-pointer transition-colors"
                      title="Delete Testimonial"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Content Area */}
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 text-sm italic leading-relaxed mb-6">
                    "{t.review}"
                  </p>
                </div>

                {/* Patient Profile info */}
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center gap-3">
                    {t.profileImage ? (
                      <img 
                        src={t.profileImage} 
                        alt={t.clientName} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                        {t.clientName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-dark text-sm truncate">{t.clientName}</h4>
                      
                      {/* Sub-details (Service & Location) */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                        {t.location && (
                          <span className="flex items-center gap-0.5 shrink-0">
                            <MapPin size={10} /> {t.location}
                          </span>
                        )}
                        {t.location && t.service && <span className="text-gray-300">•</span>}
                        {t.service && (
                          <span className="flex items-center gap-0.5 shrink-0 font-medium text-primary">
                            <Tag size={10} /> {t.service}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mt-4 text-xs">
                    <span className="text-gray-400">
                      {format(new Date(t.createdAt), "MMM dd, yyyy")}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => {
              resetForm();
              setIsAddModalOpen(false);
            }} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-primary p-6 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-serif text-white">{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h2>
                  <p className="text-white/80 text-xs mt-1">{editingId ? "Modify patient review and display properties." : "Publish verified reviews to build credibility and trust."}</p>
                </div>
                <button 
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(false);
                  }}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer border-none outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="flex flex-col overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                  {/* Row 1: Patient Name & Rating */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Patient Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Smith" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Star Rating (1-5) *</label>
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-0.5 hover:scale-110 transition-transform cursor-pointer border-none bg-transparent outline-none"
                          >
                            <Star 
                              size={22} 
                              className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Location & Service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Patient Location</label>
                      <input 
                        type="text" 
                        placeholder="Brisbane North" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Service Received</label>
                      <select 
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                      >
                        <option value="">Select Service (Optional)</option>
                        {popularServices.map((srv) => (
                          <option key={srv} value={srv}>{srv}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Profile Picture Upload Section */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Patient Profile Picture</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      {imagePreview ? (
                        <div className="relative shrink-0 w-14 h-14">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImage("");
                              setImagePreview(null);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full flex items-center justify-center border-none shadow-sm cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0 border border-gray-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="relative flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer w-fit transition-colors">
                          <Upload size={14} className="text-gray-400" />
                          <span>{uploadingImage ? "Uploading..." : "Upload Profile Image"}</span>
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg" 
                            onChange={handleImageUpload} 
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-gray-400 mt-1">JPG, PNG under 5MB. Standard resolution is best.</p>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Review Comment *</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Share patient's positive experience..." 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm resize-none"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                  </div>

                  {/* Status selection */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Publication Status</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="ACTIVE">ACTIVE (Visible on Frontend)</option>
                      <option value="DRAFT">DRAFT (Unpublished)</option>
                      <option value="INACTIVE">INACTIVE (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                  <button 
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsAddModalOpen(false);
                    }}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700 rounded-xl text-sm transition-colors cursor-pointer border-none outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-6 py-2.5 bg-primary text-white hover:bg-primary/95 font-semibold rounded-xl text-sm shadow-md transition-colors flex items-center gap-1.5 cursor-pointer border-none outline-none disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editingId ? "Update Testimonial" : "Save Testimonial"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
