"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import AssetQrSticker from "@/components/common/AssetQrSticker";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  QrCode, 
  Printer, 
  Search, 
  Filter, 
  Menu, 
  Building, 
  MapPin, 
  Tag, 
  CheckSquare, 
  Square, 
  Loader2,
  RefreshCw,
  Sliders,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QrCodePrintPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Metadata
  const [units, setUnits] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Asset list & selection
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [labelSize, setLabelSize] = useState<"compact" | "standard" | "large">("compact");

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

  // Fetch Assets for QR Print
  const fetchQrAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("per_page", "9999");
      if (filterUnit !== "all") params.set("unit_id", filterUnit);
      if (filterLocation !== "all") params.set("location_id", filterLocation);
      if (filterCategory !== "all") params.set("category_id", filterCategory);
      if (filterCondition !== "all") params.set("condition", filterCondition);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await api.get(`/assets?${params.toString()}`);
      const data = res.data || [];
      setAssets(data);
      // Auto select all when filtered
      setSelectedIds(data.map((a: any) => a.id));
    } catch (err) {
      console.error("Failed to fetch assets for QR print", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrAssets();
  }, [filterUnit, filterLocation, filterCategory, filterCondition, searchQuery]);

  const handleToggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map(a => a.id));
    }
  };

  const printableAssets = useMemo(() => {
    return assets.filter(a => selectedIds.includes(a.id));
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

      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen w-full print:p-0 print:m-0 print:overflow-visible print:max-h-none print:w-full">
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
              className="rounded-2xl h-11 px-4 text-xs font-bold"
            >
              {selectedIds.length === assets.length ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  <span>Batal Pilih Semua</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  <span>Pilih Semua ({assets.length})</span>
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
                {units.map(u => (
                  <option key={u.id} value={u.id.toString()}>{u.name}</option>
                ))}
              </select>

              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Ruangan / Lokasi</option>
                {locations.filter(l => filterUnit === "all" || String(l.unit_id) === filterUnit).map(l => (
                  <option key={l.id} value={l.id.toString()}>{l.name}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id.toString()}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Selection info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border text-xs">
              <span className="text-muted-foreground font-semibold">
                Menampilkan <strong className="text-foreground">{assets.length}</strong> aset &bull; Terpilih untuk dicetak: <strong className="text-primary font-bold">{printableAssets.length}</strong> label
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Klik kartu label di bawah untuk memilih / membatalkan cetak
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Printable QR Sticker Grid Container */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 print:hidden">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Menyiapkan barcode QR Code aset...</p>
            </div>
          ) : printableAssets.length === 0 ? (
            <Card className="rounded-3xl p-12 text-center text-muted-foreground print:hidden">
              <p className="text-xs font-semibold">Tidak ada aset terpilih untuk dicetak. Pilih filter atau centang aset di atas.</p>
            </Card>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
}
