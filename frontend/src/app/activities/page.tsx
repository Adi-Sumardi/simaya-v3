"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Activity as ActivityIcon, Search, Menu, Clock, FileJson, User, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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
    if (!properties) return "—";
    if (typeof properties === "string") return properties;
    try {
      if (properties.attributes) {
        return Object.entries(properties.attributes)
          .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`)
          .join(" | ");
      }
      return JSON.stringify(properties);
    } catch (e) {
      return "—";
    }
  };

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full min-h-screen pb-16">
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-2xl shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <ActivityIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Log Aktivitas Sistem</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Audit trail seluruh operasi database, penambahan, perubahan, dan penghapusan data.</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchActivities}
            className="rounded-2xl gap-2 h-11 px-4 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Perbarui Log</span>
          </Button>
        </header>

        {/* Filter and Search */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari deskripsi, model, user, atau detail properti..."
                value={searchQuery}
                onChange={(e) => { 
                  setSearchQuery(e.target.value); 
                  setCurrentPage(1); 
                }}
                className="pl-9 h-11 rounded-xl text-xs bg-muted/30"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Filter Model:</Label>
              <select
                value={modelFilter}
                onChange={(e) => { 
                  setModelFilter(e.target.value); 
                  setCurrentPage(1); 
                }}
                className="flex h-10 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full md:w-auto"
              >
                {uniqueModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-semibold">Memuat log aktivitas...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Model / Modul</TableHead>
                      <TableHead>Aktivitas</TableHead>
                      <TableHead>User Pelaksana</TableHead>
                      <TableHead>Detail Properti</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((act) => (
                      <TableRow key={act.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold gap-1 bg-muted/40 font-mono">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>
                              {act.created_at ? new Date(act.created_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : "—"}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="primaryLight" className="text-[10px] font-bold gap-1 font-mono">
                            <FileJson className="w-3 h-3" />
                            <span>{act.log_name}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              act.description === "created" 
                                ? "success" 
                                : act.description === "deleted"
                                ? "destructive"
                                : act.description === "approved"
                                ? "info"
                                : "secondary"
                            }
                            className="text-[10px] font-bold uppercase"
                          >
                            {act.description}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-extrabold text-foreground">
                          <span className="flex items-center gap-1.5 text-xs">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {act.causer?.name || "System"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-muted-foreground font-mono break-all max-w-sm">
                          {formatProperties(act.properties)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredActivities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-12 text-center text-xs font-semibold text-muted-foreground">
                          Tidak ada log aktivitas ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
