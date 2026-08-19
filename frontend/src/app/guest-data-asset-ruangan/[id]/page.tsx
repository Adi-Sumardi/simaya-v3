"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import RoomQrSticker from "@/components/common/RoomQrSticker";
import { 
  MapPin, 
  Building, 
  Boxes, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft,
  Eye,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function GuestRoomAssetsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const locationId = resolvedParams.id;

  const [location, setLocation] = useState<any | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    good: 0,
    damaged: 0
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoomData() {
      try {
        setLoading(true);
        let res;
        try {
          res = await api.get(`/public/locations/${locationId}`);
        } catch {
          const [locData, assetsData] = await Promise.all([
            api.get(`/locations/${locationId}`).catch(() => null),
            api.get(`/assets?location_id=${locationId}&per_page=9999`)
          ]);
          res = {
            location: locData,
            assets: assetsData.data || [],
            total_assets: assetsData.data?.length || 0,
            good_count: assetsData.data?.filter((a: any) => a.condition === "bagus").length || 0,
            damaged_count: assetsData.data?.filter((a: any) => a.condition === "rusak").length || 0
          };
        }

        if (res && res.location) {
          setLocation(res.location);
          setAssets(res.assets || []);
          setStats({
            total: res.total_assets || res.assets?.length || 0,
            good: res.good_count || 0,
            damaged: res.damaged_count || 0
          });
        } else {
          setError("Data ruangan atau lokasi tidak ditemukan.");
        }
      } catch (err: any) {
        console.error("Failed to load room assets", err);
        setError("Gagal memuat data inventaris ruangan.");
      } finally {
        setLoading(false);
      }
    }
    loadRoomData();
  }, [locationId]);

  const filteredAssets = assets.filter((asset) => {
    const matchSearch = 
      !searchQuery.trim() ||
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(asset.entries_number).includes(searchQuery);

    const matchCond = filterCondition === "all" || asset.condition === filterCondition;
    return matchSearch && matchCond;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">Memuat data inventaris ruangan...</span>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full p-8 rounded-3xl text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-serif text-foreground">Lokasi Tidak Ditemukan</h2>
            <p className="text-xs text-muted-foreground mt-1">{error || "Barcode ruangan tidak terdaftar di sistem SIMAYA."}</p>
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 bg-white p-0.5 border border-border shrink-0">
              <img src="/images/yapi.png" alt="Logo YAPI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-extrabold font-serif tracking-tight text-foreground leading-tight">
                SIMA<span className="text-primary">YA</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Daftar Inventaris Ruangan
              </p>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] font-bold gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Terverifikasi SIMAYA</span>
          </Badge>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 w-full flex flex-col gap-6 my-2 print:p-0 print:m-0 print:max-w-none print:w-full print:items-center print:justify-center">
        {/* Room Header Hero - Hidden in print */}
        <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card print:hidden">
          <div className="p-5 sm:p-8 flex flex-col sm:flex-row gap-6 items-start justify-between">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="text-xs font-bold px-3 py-1 bg-primary">
                  {location.unit?.name || "Unit Yayasan"}
                </Badge>
                {location.floor && (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase bg-muted/40">
                    Lantai: {location.floor}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-muted-foreground">
                  Kode: #{location.number}
                </Badge>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-foreground mt-1 flex items-center gap-2.5 break-words">
                <MapPin className="w-7 h-7 text-emerald-500 shrink-0" />
                <span>{location.name}</span>
              </h2>

              <p className="text-xs text-muted-foreground font-semibold">
                Daftar seluruh barang & peralatan inventaris yang terdaftar di ruangan ini.
              </p>
            </div>

            <Button 
              onClick={() => window.print()}
              variant="outline"
              className="rounded-2xl gap-2 h-11 px-5 text-xs font-bold shrink-0 w-full sm:w-auto print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Label Stiker Pintu</span>
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 border-t border-border bg-muted/20 divide-x divide-border text-center">
            <div className="p-3 sm:p-4 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Aset</span>
              <span className="text-xl sm:text-2xl font-black text-foreground mt-0.5">{stats.total}</span>
            </div>
            <div className="p-3 sm:p-4 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase text-emerald-600">Kondisi Bagus</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{stats.good}</span>
            </div>
            <div className="p-3 sm:p-4 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase text-rose-600">Kondisi Rusak</span>
              <span className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">{stats.damaged}</span>
            </div>
          </div>
        </Card>

        {/* Room Door Printable QR Label Box - ONLY element shown when printing */}
        <Card className="rounded-3xl p-5 sm:p-6 bg-card border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-transparent">
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto text-center sm:text-left print:w-full print:justify-center">
            <div className="print:m-0 print:p-0">
              <RoomQrSticker 
                location={location}
                size="large"
                className="shadow-sm print:border-2 print:border-black"
              />
            </div>

            <div className="flex flex-col gap-1 max-w-md print:hidden">
              <span className="text-xs font-bold text-foreground font-serif">Label QR Pintu Ruangan</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stiker label ini dapat dicetak dan ditempel pada pintu ruangan untuk memudahkan inventarisasi via pemindaian kamera HP.
              </p>
            </div>
          </div>

          <Button onClick={() => window.print()} className="rounded-2xl text-xs font-bold gap-2 shrink-0 w-full sm:w-auto print:hidden">
            <Printer className="w-4 h-4" />
            <span>Cetak Stiker Pintu</span>
          </Button>
        </Card>

        {/* Filter and Search Bar */}
        <Card className="rounded-3xl shadow-sm print:hidden">
          <CardContent className="p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <Input 
                type="text" 
                placeholder="Cari aset di ruangan ini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 rounded-2xl text-xs bg-muted/30 w-full"
              />
            </div>

            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="flex h-11 rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full sm:w-48"
            >
              <option value="all">Semua Kondisi</option>
              <option value="bagus">Kondisi Bagus</option>
              <option value="rusak">Kondisi Rusak</option>
            </select>
          </CardContent>
        </Card>

        {/* Asset Table - Hidden during print */}
        <Card className="rounded-3xl shadow-sm overflow-hidden print:hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Aset</TableHead>
                    <TableHead>Merk / Brand</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center print:hidden">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs font-semibold">
                        Tidak ada aset ditemukan di ruangan ini sesuai kriteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset, idx) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col min-w-[140px]">
                            <span className="font-extrabold text-foreground break-words">{asset.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground font-bold">
                              #{asset.entries_number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground/80">{asset.brand || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold bg-muted/40 whitespace-nowrap">
                            {asset.category?.name || "Umum"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={asset.condition === "bagus" ? "success" : "destructive"} 
                            className="text-[10px] font-bold uppercase"
                          >
                            {asset.condition === "bagus" ? "Bagus" : "Rusak"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase">
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center print:hidden">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-primary">
                            <Link href={`/guest-detail-asset/${asset.id}`} title="Buka Detail Aset">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground bg-card print:hidden">
        <p>&copy; {new Date().getFullYear()} Yayasan Asrama Pelajar Islam (YAPI) &bull; SIMAYA Asset Management System</p>
      </footer>
    </div>
  );
}
