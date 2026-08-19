"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import AssetQrSticker from "@/components/common/AssetQrSticker";
import { 
  Boxes, 
  MapPin, 
  Building, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Printer, 
  ArrowLeft,
  ShieldCheck,
  TrendingDown,
  ExternalLink,
  Layers,
  Wrench,
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GuestAssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assetId = resolvedParams.id;

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAsset() {
      try {
        setLoading(true);
        let res;
        try {
          res = await api.get(`/public/assets/${assetId}`);
        } catch {
          res = await api.get(`/assets/${assetId}`);
        }
        setAsset(res);
      } catch (err: any) {
        console.error("Failed to load public asset detail", err);
        setError("Aset tidak ditemukan atau barcode tidak valid.");
      } finally {
        setLoading(false);
      }
    }
    loadAsset();
  }, [assetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">Memuat data verifikasi aset...</span>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full p-8 rounded-3xl text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-serif text-foreground">Data Aset Tidak Ditemukan</h2>
            <p className="text-xs text-muted-foreground mt-1">{error || "Barcode atau nomor ID aset tidak terdaftar di sistem SIMAYA."}</p>
          </div>
          <Button asChild className="rounded-2xl w-full mt-2">
            <Link href="/">Kembali ke SIMAYA</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Public Header */}
      <nav className="bg-card border-b border-border py-4 px-4 sm:px-6 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 bg-white p-0.5 border border-border shrink-0">
              <img src="/images/yapi.png" alt="Logo YAPI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-extrabold font-serif tracking-tight text-foreground leading-tight">
                SIMA<span className="text-primary">YA</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Verifikasi Publik Aset Yayasan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Terverifikasi SIMAYA</span>
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 w-full flex flex-col gap-6 my-2 print:p-0 print:m-0">
        {/* Top Hero Banner - Hidden during print */}
        <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card print:hidden">
          <div className="p-5 sm:p-8 flex flex-col sm:flex-row gap-6 items-start justify-between">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={asset.condition === "bagus" ? "success" : "destructive"} className="text-[10px] font-extrabold uppercase">
                  Kondisi: {asset.condition === "bagus" ? "Bagus" : "Rusak"}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold uppercase bg-muted/50">
                  Status: {asset.status}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold uppercase bg-muted/50">
                  {asset.portability === "portable" ? "Portable" : "Fixtures"}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold font-serif text-foreground mt-1 break-words">
                {asset.name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold flex-wrap">
                <span>Merk: <strong className="text-foreground">{asset.brand || "—"}</strong></span>
                <span>&bull;</span>
                <span>No. Urut: <strong className="text-primary font-mono font-bold">#{asset.entries_number}</strong></span>
              </div>
            </div>

            {/* Print Label Action */}
            <Button 
              onClick={() => window.print()}
              variant="outline"
              className="rounded-2xl gap-2 h-11 px-5 text-xs font-bold shrink-0 w-full sm:w-auto print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Barcode QR</span>
            </Button>
          </div>

          {/* Full Code Strip */}
          <div className="bg-primary-light border-t border-primary/20 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Format Kode Inventaris Resmi:
            </span>
            <span className="font-mono text-xs sm:text-sm font-black text-primary break-all">
              {asset.full_code || `${asset.unit?.number || 'UNT'}/${asset.aktiva?.code || 'AKT'}/${asset.location?.number || 'LOC'}/${asset.tool?.code_name || 'BRG'}/${asset.category?.code || 'CAT'}/${asset.entries_number}`}
            </span>
          </div>
        </Card>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:m-0 print:p-0">
          
          {/* Left Column: QR Sticker Box & Room Link */}
          <div className="flex flex-col gap-4 print:m-0 print:p-0 print:items-center">
            
            {/* Printable QR Sticker Card */}
            <Card className="rounded-3xl p-5 flex flex-col items-center justify-center gap-4 text-center print:border-none print:shadow-none print:p-0 print:m-0 print:bg-transparent">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground print:hidden">
                Label Barcode QR Fisik
              </span>

              <div className="flex justify-center w-full print:m-0 print:p-0">
                <AssetQrSticker 
                  asset={asset}
                  size="compact"
                  className="shadow-sm print:shadow-none"
                />
              </div>

              {/* View Room Assets quick button - with word wrap */}
              {asset.location && (
                <Button asChild variant="outline" className="rounded-2xl text-xs font-bold w-full h-auto py-2.5 px-3 mt-1 border-emerald-500/30 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-400 print:hidden">
                  <Link href={`/guest-data-asset-ruangan/${asset.location.id}`} className="flex items-center justify-center gap-2 text-center w-full">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="break-words leading-tight">Daftar Aset: {asset.location.name}</span>
                  </Link>
                </Button>
              )}
            </Card>
          </div>

          {/* Right 2 Columns: Full Specifications & Depreciation - Hidden in Print */}
          <div className="lg:col-span-2 flex flex-col gap-4 print:hidden">
            
            {/* Lokasi & Master Specs */}
            <Card className="rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold font-serif text-foreground uppercase tracking-wider">
                Lokasi & Klasifikasi Aset
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Unit Kerja</span>
                  </span>
                  <span className="text-xs font-extrabold text-foreground mt-1 break-words">{asset.unit?.name || "—"}</span>
                </div>

                <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Ruangan / Lokasi</span>
                  </span>
                  <span className="text-xs font-extrabold text-foreground mt-1 break-words">{asset.location?.name || "—"}</span>
                </div>

                <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Kategori</span>
                  </span>
                  <span className="text-xs font-extrabold text-foreground mt-1 break-words">{asset.category?.name || "—"}</span>
                </div>

                <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Jenis Alat / Barang</span>
                  </span>
                  <span className="text-xs font-extrabold text-foreground mt-1 break-words">{asset.tool?.name || "—"}</span>
                </div>

                <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Aktiva Tetap</span>
                  </span>
                  <span className="text-xs font-extrabold text-foreground mt-1 break-words">{asset.aktiva?.name || "—"}</span>
                </div>

                <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Tahun Pengadaan</span>
                  </span>
                  <span className="text-xs font-extrabold text-foreground mt-1 break-words">{asset.year?.year || "—"}</span>
                </div>
              </div>
            </Card>

            {/* Informasi Perolehan & Penyusutan */}
            <Card className="rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-extrabold font-serif text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-primary shrink-0" />
                  <span>Nilai Perolehan & Penyusutan</span>
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {asset.effective_depreciation_rate || 10}% / Tahun
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Harga Perolehan</span>
                  <span className="text-sm font-extrabold text-foreground mt-1 break-words">
                    Rp {asset.price ? Number(asset.price).toLocaleString("id-ID") : "—"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Akumulasi Susut</span>
                  <span className="text-sm font-extrabold text-amber-600 mt-1 break-words">
                    Rp {(asset.accumulated_depreciation || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Nilai Buku Saat Ini</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-1 break-words">
                    Rp {(asset.book_value !== undefined ? asset.book_value : asset.price)?.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground font-semibold">Sumber / Pemilik: </span>
                  <strong className="text-foreground">{asset.aquisition || "YAPI"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Tanggal Perolehan: </span>
                  <strong className="text-foreground">
                    {asset.aquisition_date ? new Date(asset.aquisition_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </strong>
                </div>
              </div>

              {asset.description && (
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border text-xs leading-relaxed text-foreground/80 break-words">
                  <strong className="text-foreground block mb-1">Catatan Spesifikasi:</strong>
                  {asset.description}
                </div>
              )}
            </Card>

          </div>

        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground bg-card print:hidden">
        <p>&copy; {new Date().getFullYear()} Yayasan Asrama Pelajar Islam (YAPI) &bull; SIMAYA Asset Management System</p>
      </footer>
    </div>
  );
}
