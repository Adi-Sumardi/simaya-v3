"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Activity as ActivityIcon, Search, Menu, Clock, FileJson, User, RefreshCw, Loader2 } from "lucide-react";

export default function ActivitiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [activities, setActivities] = useState<any[]>([]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const url = `/activities?page=${currentPage}&per_page=${perPage}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const res = await api.get(url);
      setActivities(res.data || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.last_page || 0);
    } catch (err: any) {
      console.error("Failed to fetch activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [currentPage, perPage, searchQuery]);

  const uniqueModels = useMemo(() => {
    const list = activities.map(a => a.log_name).filter(Boolean);
    return ["Semua", ...Array.from(new Set(list))];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (modelFilter === "Semua") return activities;
    return activities.filter(a => a.log_name === modelFilter);
  }, [activities, modelFilter]);

  const formatProperties = (properties: any) => {
    if (!properties) return "-";
    if (typeof properties === "string") return properties;
    try {
      if (properties.attributes) {
        return Object.entries(properties.attributes)
          .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`)
          .join(" | ");
      }
      return JSON.stringify(properties);
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="flex bg-background h-screen overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto h-full w-full">
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-border-peach/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-background border border-border-peach hover:text-primary flex lg:hidden items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-inner">
                <ActivityIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Log Aktivitas Sistem</h2>
                <p className="text-xs text-foreground/50 font-medium mt-1">Audit trail seluruh operasi database, penambahan, pengubahan, dan penghapusan data.</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchActivities}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-border-peach hover:border-primary text-foreground hover:text-primary rounded-2xl font-bold text-xs shadow-sm transition-all w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4 animate-hover" />
            <span>Perbarui Log</span>
          </button>
        </header>

        {/* Filter and Search */}
        <section className="bg-white border border-border-peach rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-foreground/45 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Cari deskripsi, model, user, atau detail properti..."
              value={searchQuery}
              onChange={(e) => { 
                setSearchQuery(e.target.value); 
                setCurrentPage(1); 
              }}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-bold text-foreground/60 whitespace-nowrap">Filter Model:</label>
            <select
              value={modelFilter}
              onChange={(e) => { 
                setModelFilter(e.target.value); 
                setCurrentPage(1); 
              }}
              className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold focus:outline-none text-foreground w-full md:w-auto"
            >
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Data Table */}
        <section className="bg-white border border-border-peach rounded-3xl overflow-hidden shadow-card relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-foreground/60 font-semibold">Memuat log aktivitas...</p>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-primary-light/40 border-b border-border-peach">
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Waktu</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Model / Modul</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Aktivitas</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">User Pelaksana</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Detail Properti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-peach/50">
                    {filteredActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-primary-light/10 transition-colors">
                        <td className="p-5 text-xs">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1.5 w-fit">
                            <Clock className="w-3 h-3" />
                            {act.created_at ? new Date(act.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }) : "-"}
                          </span>
                        </td>
                        <td className="p-5 text-xs">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1.5 w-fit">
                            <FileJson className="w-3 h-3" />
                            {act.log_name}
                          </span>
                        </td>
                        <td className="p-5 text-xs">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold capitalize ${
                            act.description === "created" 
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                              : act.description === "deleted"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : act.description === "approved"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}>
                            {act.description}
                          </span>
                        </td>
                        <td className="p-5 text-xs font-extrabold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-foreground/45" />
                            {act.causer?.name || "System"}
                          </span>
                        </td>
                        <td className="p-5 text-xs font-semibold text-foreground/70 font-mono break-all max-w-sm">
                          {formatProperties(act.properties)}
                        </td>
                      </tr>
                    ))}
                    {filteredActivities.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs font-semibold text-foreground/40">
                          Tidak ada log aktivitas ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                perPage={perPage}
                onPageChange={setCurrentPage}
                onPerPageChange={setPerPage}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
