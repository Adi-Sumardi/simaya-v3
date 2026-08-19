"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import { api } from "@/lib/api";
import { 
  Boxes, 
  CheckCircle2, 
  GitCompare, 
  Trash2, 
  Search, 
  Bell, 
  Plus, 
  Activity,
  QrCode,
  X,
  Camera,
  Menu,
  AlertTriangle,
  Zap,
  Building,
  MapPin,
  Loader2,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    goodAssets: 0,
    damagedAssets: 0,
    activeAssets: 0,
    pendingTransfers: 0,
    totalUnits: 4,
    totalLocations: 5,
    goodPercent: 0,
    activePercent: 0
  });

  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);
  const [damagedAssets, setDamagedAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        const statsData = await api.get("/assets/stats");
        const transfersData = await api.get("/transfers?per_page=5");
        const damagedData = await api.get("/assets?condition=rusak&per_page=5");

        const total = statsData.total_assets || 0;
        const good = statsData.conditions?.bagus || 0;
        const active = statsData.statuses?.active || 0;

        setStats({
          totalAssets: total,
          totalValue: statsData.total_value || 0,
          goodAssets: good,
          damagedAssets: statsData.conditions?.rusak || 0,
          activeAssets: active,
          pendingTransfers: statsData.statuses?.repaired || 0,
          totalUnits: 4,
          totalLocations: 5,
          goodPercent: total > 0 ? Math.round((good / total) * 100) : 0,
          activePercent: total > 0 ? Math.round((active / total) * 100) : 0
        });

        if (transfersData && transfersData.data) {
          setRecentTransfers(transfersData.data.map((t: any) => ({
            id: t.id,
            transfer_number: t.transfer_number,
            unit: t.from_unit?.name || "N/A",
            toLocation: t.to_location?.name || "N/A",
            assetsCount: t.items?.length || 0,
            status: t.status,
            time: new Date(t.requested_at || t.created_at).toLocaleDateString("id-ID")
          })));
        }

        if (damagedData && damagedData.data) {
          setDamagedAssets(damagedData.data.map((d: any) => ({
            id: d.id,
            name: d.name,
            brand: d.brand || "N/A",
            entries_number: d.entries_number,
            unit: d.unit?.name || "N/A",
            location: d.location?.name || "N/A",
            price: d.price || 0,
            time: new Date(d.created_at).toLocaleDateString("id-ID")
          })));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleScanSimulation = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanResult("https://simaya.yapi.web.id/guest-detail-asset/105");
    }, 2500);
  };

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      {/* Navigation Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onScanClick={handleScanSimulation} 
      />

      {/* Main Dashboard Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full min-h-screen pb-16">
        
        {/* Header Section */}
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
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground leading-tight">
                Selamat Datang, <span className="text-primary">{mounted && currentUser ? currentUser.name : "Pengguna"}</span>
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {mounted && currentUser?.unit ? `Unit Kerja: ${currentUser.unit.name} • ${currentUser.unit.number || 'Unit'}` : "Pantau dan kelola seluruh aset yayasan Anda secara real-time."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <Input 
                type="text" 
                placeholder="Cari aset..."
                className="pl-9 bg-card rounded-2xl text-xs h-10"
              />
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-2xl shrink-0 relative"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>

        {/* Stats Overview Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard 
            title="Total & Nilai Aset"
            value={`${stats.totalAssets.toLocaleString()} Aset`}
            subtext={`Nilai Perolehan: Rp ${stats.totalValue.toLocaleString("id-ID")}`}
            icon={Boxes}
            trend={{ value: `${stats.totalUnits} Unit | ${stats.totalLocations} Lokasi`, type: "info" }}
          />
          <StatCard 
            title="Kondisi Kelayakan"
            value={`${stats.goodAssets.toLocaleString()} Bagus`}
            subtext={`Aset Rusak: ${stats.damagedAssets.toLocaleString()} Unit`}
            icon={CheckCircle2}
            trend={{ value: `${stats.goodPercent}% Layak Pakai`, type: "positive" }}
          />
          <StatCard 
            title="Status & Mutasi"
            value={`${stats.activeAssets.toLocaleString()} Aktif`}
            subtext={`Transfer Pending: ${stats.pendingTransfers} Permohonan`}
            icon={Zap}
            trend={{ value: stats.pendingTransfers > 0 ? `${stats.pendingTransfers} Pending` : "Semua Selesai", type: stats.pendingTransfers > 0 ? "negative" : "positive" }}
          />
        </section>

        {/* Visual Analytics & Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Distribution chart per Unit */}
          <Card className="rounded-3xl flex flex-col justify-between">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-extrabold font-serif">Distribusi Aset per Unit</CardTitle>
              <CardDescription className="text-xs">Jumlah kepemilikan aset aktif per unit yayasan</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 pt-0 flex flex-col justify-between flex-1">
              {/* Custom SVG Bar Chart */}
              <div className="h-44 flex items-end gap-3 px-2 pt-4 border-b border-border pb-2 mt-2">
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">450</span>
                  <div className="w-full bg-primary rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "75%" }} />
                  <span className="text-[9px] font-bold text-muted-foreground truncate max-w-full">Pusat</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">380</span>
                  <div className="w-full bg-secondary rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "63%" }} />
                  <span className="text-[9px] font-bold text-muted-foreground truncate max-w-full">SD</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">260</span>
                  <div className="w-full bg-amber-400 rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "43%" }} />
                  <span className="text-[9px] font-bold text-muted-foreground truncate max-w-full">SMP</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">150</span>
                  <div className="w-full bg-rose-400 rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "25%" }} />
                  <span className="text-[9px] font-bold text-muted-foreground truncate max-w-full">SMA</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-4">
                <Building className="w-3.5 h-3.5" />
                <span>Total 4 Unit Aktif</span>
              </div>
            </CardContent>
          </Card>

          {/* Condition doughnut chart */}
          <Card className="rounded-3xl flex flex-col justify-between">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-extrabold font-serif">Kondisi Aset</CardTitle>
              <CardDescription className="text-xs">Kondisi fisik aset non-mutasi</CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 flex flex-col justify-between flex-1">
              <div className="relative flex items-center justify-center my-3">
                <svg className="w-32 h-32" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-muted" strokeWidth="4.5" />
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#3CCF8E" 
                    strokeWidth="4.5" 
                    strokeDasharray="88 12" 
                    strokeDashoffset="25" 
                    strokeLinecap="round" 
                  />
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#EF4444" 
                    strokeWidth="4.5" 
                    strokeDasharray="12 88" 
                    strokeDashoffset="37" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-foreground">{stats.goodPercent}%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Bagus</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                    <span className="text-foreground/80 font-bold">Bagus</span>
                  </div>
                  <span className="font-extrabold text-foreground">{stats.goodAssets} Unit</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
                    <span className="text-foreground/80 font-bold">Rusak</span>
                  </div>
                  <span className="font-extrabold text-foreground">{stats.damagedAssets} Unit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status distribution chart */}
          <Card className="rounded-3xl flex flex-col justify-between">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-extrabold font-serif">Status Aset</CardTitle>
              <CardDescription className="text-xs">Status operasional inventaris</CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 flex flex-col justify-between flex-1">
              <div className="relative flex items-center justify-center my-3">
                <svg className="w-32 h-32" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-muted" strokeWidth="4.5" />
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#3CCF8E" 
                    strokeWidth="4.5" 
                    strokeDasharray="81 19" 
                    strokeDashoffset="25" 
                    strokeLinecap="round" 
                  />
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="4.5" 
                    strokeDasharray="10 90" 
                    strokeDashoffset="44" 
                    strokeLinecap="round" 
                  />
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#EF4444" 
                    strokeWidth="4.5" 
                    strokeDasharray="9 91" 
                    strokeDashoffset="54" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-foreground">{stats.activePercent}%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Aktif</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                    <span className="text-foreground/80 font-bold">Aktif</span>
                  </div>
                  <span className="font-extrabold text-foreground">{stats.activeAssets} Unit</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-foreground/80 font-bold">Diperbaiki</span>
                  </div>
                  <span className="font-extrabold text-foreground">125 Unit</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
                    <span className="text-foreground/80 font-bold">Tidak Aktif</span>
                  </div>
                  <span className="font-extrabold text-foreground">105 Unit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dashboard Tables Row */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          
          {/* Transfer Aset Terbaru */}
          <Card className="rounded-3xl flex flex-col gap-3">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold font-serif">Transfer Aset Terbaru</CardTitle>
                <CardDescription className="text-xs">Mutasi unit & pemindahan ruangan terupdate</CardDescription>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary border border-primary/20 flex items-center justify-center">
                <GitCompare className="w-4 h-4" />
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Transfer</TableHead>
                    <TableHead>Asal Unit</TableHead>
                    <TableHead>Ke Lokasi</TableHead>
                    <TableHead>Jumlah Aset</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        Belum ada data transfer aset terbaru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransfers.map((trsf) => (
                      <TableRow key={trsf.id}>
                        <TableCell className="font-bold text-primary">{trsf.transfer_number}</TableCell>
                        <TableCell className="font-semibold text-foreground/80">{trsf.unit}</TableCell>
                        <TableCell className="font-semibold text-foreground/80 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{trsf.toLocation}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="info" className="text-[10px] font-bold">
                            {trsf.assetsCount} Aset
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trsf.status === "completed" 
                                ? "success" 
                                : trsf.status === "approved"
                                ? "info"
                                : trsf.status === "rejected"
                                ? "destructive"
                                : "warning"
                            }
                            className="text-[10px] font-bold uppercase"
                          >
                            {trsf.status === "completed" ? "Selesai" : trsf.status === "approved" ? "Disetujui" : trsf.status === "rejected" ? "Ditolak" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Aset Rusak - Perlu Perhatian */}
          <Card className="rounded-3xl flex flex-col gap-3">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold font-serif">Aset Rusak - Perlu Perhatian</CardTitle>
                <CardDescription className="text-xs">List inventaris rusak yang butuh penanganan</CardDescription>
              </div>
              <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Aset</TableHead>
                    <TableHead>No. Aset</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {damagedAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        Tidak ada aset berkondisi rusak saat ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    damagedAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-foreground">{asset.name}</span>
                            <span className="text-[10px] text-muted-foreground font-bold">{asset.brand}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary">#{asset.entries_number}</TableCell>
                        <TableCell className="font-semibold text-foreground/80">{asset.unit}</TableCell>
                        <TableCell className="font-semibold text-foreground/80">{asset.location}</TableCell>
                        <TableCell className="font-extrabold text-foreground">
                          Rp {asset.price.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions & Audit Activities Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Quick Actions Card */}
          <Card className="rounded-3xl flex flex-col gap-3">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-extrabold font-serif">Aksi Cepat</CardTitle>
              <CardDescription className="text-xs">Lakukan pengisian data dalam satu klik</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Link href="/assets" className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border rounded-2xl gap-2 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-center">Registrasi Aset</span>
                </Link>

                <Link href="/transfers" className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border rounded-2xl gap-2 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                    <GitCompare className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-center">Ajukan Mutasi</span>
                </Link>

                <Link href="/dispositions" className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border rounded-2xl gap-2 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-center">Disposisi Aset</span>
                </Link>

                <button 
                  onClick={handleScanSimulation}
                  className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border rounded-2xl gap-2 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-card border border-border text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-center">Pindai QR</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Audit trail / Activity Feed */}
          <Card className="rounded-3xl lg:col-span-2 flex flex-col gap-3">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold font-serif">Aktivitas Terkini</CardTitle>
                <CardDescription className="text-xs">Audit logs operasi database terbaru</CardDescription>
              </div>
              <div className="p-2 bg-primary-light text-primary border border-primary/20 rounded-xl shrink-0">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 flex flex-col gap-3 mt-1">
              <div className="flex gap-4 p-3.5 bg-muted/40 border border-border rounded-2xl transition-colors hover:border-primary/40">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge variant="primaryLight" className="text-[10px] font-black uppercase">
                      Aset dibuat
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold">2 menit yang lalu</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/85 leading-relaxed mt-1">
                    Adi Sumardi membuat data aset: <span className="font-mono text-[11px] bg-card border border-border px-1.5 py-0.5 rounded-md text-primary font-bold">Laptop ASUS ExpertBook B1 | AST-2026-0001</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-3.5 bg-muted/40 border border-border rounded-2xl transition-colors hover:border-primary/40">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Badge variant="warning" className="text-[10px] font-black uppercase">
                      Mutasi diubah
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold">1 jam yang lalu</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/85 leading-relaxed mt-1">
                    Budi Utomo merubah mutasi transfer: <span className="font-mono text-[11px] bg-card border border-border px-1.5 py-0.5 rounded-md text-primary font-bold">Mutasi Laptop SD ke SMP | TRF-2026-0002</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* QR Code Scanner Dialog */}
      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="max-w-md p-6 rounded-3xl">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-lg font-extrabold font-serif">Scan QR Code Aset</DialogTitle>
            <DialogDescription className="text-xs">
              Dekatkan barcode atau QR Code ke kamera laptop Anda
            </DialogDescription>
          </DialogHeader>

          {/* Camera Viewfinder Screen Simulation */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center border-2 border-primary my-2">
            {!scanResult ? (
              <>
                <div className="absolute w-48 h-48 border-2 border-dashed border-primary/60 rounded-xl animate-pulse" />
                <div className="absolute left-0 w-full h-0.5 bg-primary animate-bounce shadow-md shadow-primary/80" style={{ animationDuration: '2s' }} />
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <Camera className="w-12 h-12 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Mencari QR Code...</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white gap-3 bg-emerald-950/90 w-full h-full animate-in fade-in duration-300">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">QR Code Terdeteksi</span>
                  <span className="text-base font-extrabold mt-1 font-serif">Proyektor Epson EB-X41</span>
                  <span className="text-[10px] text-white/50 break-all mt-2">{scanResult}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 mt-2">
            <Button 
              variant="outline"
              onClick={() => setIsScanning(false)}
              className="flex-1 rounded-xl"
            >
              Tutup
            </Button>
            {scanResult && (
              <Button
                asChild
                className="flex-1 rounded-xl"
              >
                <Link href="/assets">Buka Detail Aset</Link>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
