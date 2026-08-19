"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import AssetQrSticker from "@/components/common/AssetQrSticker";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  QrCode, 
  Printer, 
  Search, 
  Menu, 
  CheckSquare, 
  Square, 
  Loader2,
  PlusCircle,
  Check,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PER_PAGE = 60; // 60 stiker per load untuk performa optimal

export default function QrCodePrintPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Metadata
  const [units, setUnits] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Asset list, Pagination & Selection
  const [assets, setAssets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [labelSize, setLabelSize] = useState<"compact" | "standard">("compact");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [u, l, c] = await Promise.all([
          api.get("/units/all"),
          api.get("/locations/all"),
          api.get("/categories/all")
        ]);
        setUnits(u || []);
        setLocations(l || []);
        setCategories(c || []);
      } catch (err) {
        console.error("Failed to load QR print metadata", err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch Assets (Initial or Filter change)
  const fetchQrAssets = useCallback(async (targetPage: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.set("page", targetPage.toString());
      params.set("per_page", PER_PAGE.toString());
      if (filterUnit !== "all") params.set("unit_id", filterUnit);
      if (filterLocation !== "all") params.set("location_id", filterLocation);
      if (filterCategory !== "all") params.set("category_id", filterCategory);
      if (filterCondition !== "all") params.set("condition", filterCondition);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await api.get(`/assets?${params.toString()}`);
      const newItems = res.data || [];
      const totalCount = res.total || 0;
      const lastPage = res.last_page || 1;

      setTotal(totalCount);
      setPage(targetPage);
      setHasMore(targetPage < lastPage);

      if (append) {
        setAssets((prev) => {
          const combined = [...prev, ...newItems];
          // Auto select newly loaded items as well
          setSelectedIds((prevSelected) => [
            ...prevSelected,
            ...newItems.map((a: any) => a.id)
          ]);
          return combined;
        });
      } else {
        setAssets(newItems);
        // Auto select items on initial load
        setSelectedIds(newItems.map((a: any) => a.id));
      }
    } catch (err) {
      console.error("Failed to fetch assets for QR print", err);
      toast.error("Gagal memuat daftar aset untuk QR Code");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterUnit, filterLocation, filterCategory, filterCondition, debouncedSearch, toast]);

  // Trigger initial fetch when filters change
  useEffect(() => {
    fetchQrAssets(1, false);
  }, [fetchQrAssets]);

  // Load More Handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchQrAssets(page + 1, true);
    }
  };

  const handleToggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const printableAssets = useMemo(() => {
    return assets.filter((a) => selectedIds.includes(a.id));
  }, [assets, selectedIds]);

  const handlePrint = () => {
    if (printableAssets.length === 0) {
      toast.error("Pilih minimal satu aset untuk dicetak");
      return;
    }
    window.print();
  };

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      {/* Sidebar - hidden when printing */}
      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full min-h-screen pb-16 print:p-0 print:m-0 print:overflow-visible print:max-h-none print:w-full">
        {/* Header - Screen only */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm print:hidden">
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
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Cetak Label QR Code</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Format stiker label QR Code barcode inventaris siap cetak kertas stiker & A4.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border">
              <Button
                variant={labelSize === "compact" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLabelSize("compact")}
                className="text-[11px] font-bold h-8 rounded-xl px-3"
              >
                Kompak (3.4x2cm)
              </Button>
              <Button
                variant={labelSize === "standard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLabelSize("standard")}
                className="text-[11px] font-bold h-8 rounded-xl px-3"
              >
                Standar
              </Button>
            </div>

            <Button 
              variant="outline"
              onClick={handleSelectAll}
              disabled={assets.length === 0}
              className="rounded-2xl h-11 px-4 text-xs font-bold"
            >
              {selectedIds.length === assets.length && assets.length > 0 ? (
                <>
                  <Square className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Batal Pilih Semua</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-2 text-primary" />
                  <span>Pilih Semua yang Tampil ({assets.length})</span>
                </>
              )}
            </Button>

            <Button 
              onClick={handlePrint}
              disabled={printableAssets.length === 0}
              className="rounded-2xl gap-2 h-11 px-6 text-xs font-extrabold shadow-md shadow-primary/25"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak ({printableAssets.length} Stiker)</span>
            </Button>
          </div>
        </header>

        {/* Filter Controls - Screen only */}
        <Card className="rounded-3xl shadow-sm print:hidden">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <Input 
                  type="text"
                  placeholder="Cari nama aset, nomor urut, merk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-2xl text-xs bg-muted/30 w-full"
                />
              </div>

              <select
                value={filterUnit}
                onChange={(e) => { setFilterUnit(e.target.value); setFilterLocation("all"); }}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Unit Kerja</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id.toString()}>{u.name}</option>
                ))}
              </select>

              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Ruangan / Lokasi</option>
                {locations
                  .filter((l) => filterUnit === "all" || String(l.unit_id) === filterUnit)
                  .map((l) => (
                    <option key={l.id} value={l.id.toString()}>{l.name}</option>
                  ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Selection info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border text-xs">
              <span className="text-muted-foreground font-semibold">
                Menampilkan <strong className="text-foreground">{assets.length}</strong> dari total <strong className="text-foreground">{total.toLocaleString("id-ID")}</strong> aset &bull; Terpilih untuk dicetak: <strong className="text-primary font-bold">{printableAssets.length}</strong> label
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Klik kartu label di bawah untuk memilih / membatalkan cetak
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Printable QR Sticker Grid Container */}
        <div className="w-full flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 print:hidden">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Memuat data barcode QR Code aset...</p>
            </div>
          ) : assets.length === 0 ? (
            <Card className="rounded-3xl p-12 text-center text-muted-foreground print:hidden">
              <p className="text-xs font-semibold">Tidak ada aset yang sesuai dengan filter pencarian.</p>
            </Card>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 p-4 bg-muted/20 border border-border rounded-3xl print:bg-white print:border-none print:p-0 print:gap-1.5 print:m-0 print:w-full">
                {assets.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelectRow(item.id)}
                      className={`
                        cursor-pointer transition-all duration-150 select-none relative
                        print:cursor-default print:border-none print:shadow-none no-break
                        ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-[1.01]" : "opacity-35 grayscale hover:opacity-70 print:hidden"}
                      `}
                    >
                      <AssetQrSticker 
                        asset={item} 
                        size={labelSize}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Load More Button Container */}
              <div className="flex flex-col items-center justify-center gap-2 py-4 print:hidden">
                {hasMore ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-2xl h-12 px-8 font-bold border-primary/30 hover:bg-primary/10 hover:border-primary text-foreground gap-2.5 shadow-sm transition-all"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span>Memuat {PER_PAGE} Aset Tambahan...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-primary" />
                        <span>
                          Muat Lebih Banyak (+{Math.min(PER_PAGE, total - assets.length)} Aset)
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-1">
                          ({assets.length} dari {total.toLocaleString("id-ID")})
                        </span>
                      </>
                    )}
                  </Button>
                ) : (
                  total > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 px-5 py-2.5 rounded-2xl border border-border/50">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Semua data aset telah dimuat (Total: {total.toLocaleString("id-ID")} aset)</span>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
