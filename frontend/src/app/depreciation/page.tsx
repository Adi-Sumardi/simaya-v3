"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  TrendingDown, 
  Search, 
  Filter, 
  Menu, 
  Download, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Building,
  Loader2,
  Calendar,
  Layers,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function DepreciationReportPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDepreciationStatus, setFilterDepreciationStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Metadata
  const [units, setUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Primary Data
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_assets: 0,
    total_price: 0,
    total_accumulated_depreciation: 0,
    total_book_value: 0,
    status_counts: {
      fully_depreciated: 0,
      depreciating: 0,
      not_depreciating: 0,
      no_data: 0
    }
  });

  // Load Metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [unitsData, catData] = await Promise.all([
          api.get("/units/all"),
          api.get("/categories/all")
        ]);
        setUnits(unitsData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error("Failed to fetch depreciation meta", err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch Stats Summary
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const params = new URLSearchParams();
      if (filterUnit !== "all") params.set("unit_id", filterUnit);
      if (filterCategory !== "all") params.set("category_id", filterCategory);

      const res = await api.get(`/assets/depreciation-stats?${params.toString()}`);
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error("Failed to fetch depreciation stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Paginated Table Data
  const fetchDepreciationAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("per_page", perPage.toString());

      if (filterUnit !== "all") params.set("unit_id", filterUnit);
      if (filterCategory !== "all") params.set("category_id", filterCategory);
      if (filterDepreciationStatus !== "all") params.set("depreciation_status", filterDepreciationStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await api.get(`/assets?${params.toString()}`);
      setAssets(res.data || []);
      setTotalItems(res.meta?.total || res.total || 0);
      setTotalPages(res.meta?.last_page || res.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch depreciation assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filterUnit, filterCategory]);

  useEffect(() => {
    fetchDepreciationAssets();
  }, [currentPage, perPage, filterUnit, filterCategory, filterDepreciationStatus, searchQuery]);

  const handleExport = () => {
    toast.info("Laporan penyusutan aset sedang diekspor ke format Excel (.xlsx)...");
  };

  const getStatusBadge = (status: string, percent: number | null) => {
    switch (status) {
      case "fully_depreciated":
        return <Badge variant="destructive" className="text-[10px] font-bold">Habis Susut (100%)</Badge>;
      case "depreciating":
        return <Badge variant="warning" className="text-[10px] font-bold">Menyusut ({percent?.toFixed(1) || 0}%)</Badge>;
      case "not_depreciating":
        return <Badge variant="outline" className="text-[10px] font-bold bg-muted/40">Tidak Menyusut (0%)</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] font-bold">Data Kurang</Badge>;
    }
  };

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen w-full">
        {/* Header */}
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
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Laporan Penyusutan Aset</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Kalkulasi penyusutan garis lurus (straight-line depreciation) dan nilai buku aset yayasan.
                </p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={handleExport}
            className="rounded-2xl gap-2 h-11 px-5 text-xs font-bold shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </Button>
        </header>

        {/* KPI Stats Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-3xl shadow-sm border-border">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Harga Perolehan</span>
                <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">
                Rp {stats.total_price.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Dari {stats.total_assets.toLocaleString("id-ID")} total aset
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-border">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-amber-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Akumulasi Penyusutan</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-serif text-amber-600">
                Rp {stats.total_accumulated_depreciation.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">
                {stats.status_counts.depreciating} aset masih menyusut
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-border">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-emerald-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Nilai Buku Saat Ini</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-serif text-emerald-600">
                Rp {stats.total_book_value.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Nilai aktiva bersih buku yayasan
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-border">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-rose-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">Aset Habis Susut</span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-serif text-rose-600">
                {stats.status_counts.fully_depreciated.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Nilai buku sudah Rp 0
              </span>
            </CardContent>
          </Card>
        </section>

        {/* Filter Bar */}
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <Input 
                type="text"
                placeholder="Cari nama aset, nomor urut..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 h-11 rounded-2xl text-xs bg-muted/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
              <select
                value={filterUnit}
                onChange={(e) => { setFilterUnit(e.target.value); setCurrentPage(1); }}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Unit Kerja</option>
                {units.map(u => (
                  <option key={u.id} value={u.id.toString()}>{u.name}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id.toString()}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterDepreciationStatus}
                onChange={(e) => { setFilterDepreciationStatus(e.target.value); setCurrentPage(1); }}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Status Susut</option>
                <option value="depreciating">Masih Menyusut</option>
                <option value="fully_depreciated">Sudah Habis Susut</option>
                <option value="not_depreciating">Tidak Menyusut (0%)</option>
                <option value="no_data">Data Kurang</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Depreciation Table */}
        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-semibold">Memuat kalkulasi penyusutan aset...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Aset</TableHead>
                        <TableHead>Unit & Lokasi</TableHead>
                        <TableHead>Tgl Perolehan</TableHead>
                        <TableHead>Harga Beli</TableHead>
                        <TableHead>Akumulasi Susut</TableHead>
                        <TableHead>Nilai Buku Saat Ini</TableHead>
                        <TableHead className="text-center">Status Susut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="flex flex-col min-w-[140px]">
                              <span className="font-extrabold text-foreground break-words">{asset.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground font-bold">
                                #{asset.entries_number} &bull; {asset.brand || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col min-w-[120px]">
                              <span className="font-bold text-foreground">{asset.unit?.name || "—"}</span>
                              <span className="text-[10px] text-muted-foreground font-medium">{asset.location?.name || "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            {asset.aquisition_date ? new Date(asset.aquisition_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            }) : "—"}
                          </TableCell>
                          <TableCell className="font-bold text-foreground whitespace-nowrap">
                            Rp {asset.price?.toLocaleString("id-ID") || 0}
                          </TableCell>
                          <TableCell className="font-bold text-amber-600 whitespace-nowrap">
                            Rp {(asset.accumulated_depreciation || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="font-extrabold text-emerald-600 text-sm whitespace-nowrap">
                            Rp {(asset.book_value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                            {getStatusBadge(asset.depreciation_status, asset.depreciation_percent)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {assets.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-12 text-center text-xs font-semibold text-muted-foreground">
                            Tidak ada data penyusutan aset ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
