"use client";

import { useState, useEffect } from "react";
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
  FileDown, 
  Activity,
  QrCode,
  X,
  Camera,
  Menu,
  TrendingUp,
  AlertTriangle,
  Zap,
  Building,
  MapPin,
  Coins,
  Eye,
  Edit,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
    <div className="flex bg-background h-screen overflow-hidden relative">
      {/* Navigation Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onScanClick={handleScanSimulation} 
      />

      {/* Main Dashboard Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto h-full w-full animate-in fade-in duration-300">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-border-peach/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-background border border-border-peach hover:text-primary flex lg:hidden items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground leading-tight">
                Selamat Datang, <span className="text-primary">{currentUser ? currentUser.name : "Pengguna"}</span>
              </h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">
                Pantau dan kelola seluruh aset yayasan Anda secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 group">
              <Search className="w-4 h-4 text-foreground/45 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Cari aset..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <button className="w-10 h-10 rounded-2xl bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-primary hover:bg-primary-light/30 transition-all relative flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Stats Overview Grid (Combined for better spacing) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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


        {/* Visual Analytics & Charts Section (Matching Charts Widgets) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Distribution chart per Unit (AssetsChart.php - Bar chart style) */}
          <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-foreground font-serif">Distribusi Aset per Unit</h3>
              <p className="text-[11px] text-foreground/50 font-medium mb-4">Jumlah kepemilikan aset aktif per unit yayasan</p>
            </div>
            
            {/* Custom SVG Bar Chart */}
            <div className="h-48 flex items-end gap-3 px-2 pt-4 border-b border-border-peach/50 pb-2">
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">450</span>
                <div className="w-full bg-primary rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "75%" }} />
                <span className="text-[9px] font-bold text-foreground/50 truncate max-w-full">Pusat</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">380</span>
                <div className="w-full bg-secondary rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "63%" }} />
                <span className="text-[9px] font-bold text-foreground/50 truncate max-w-full">SD</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">260</span>
                <div className="w-full bg-amber-400 rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "43%" }} />
                <span className="text-[9px] font-bold text-foreground/50 truncate max-w-full">SMP</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">150</span>
                <div className="w-full bg-rose-400 rounded-t-xl transition-all duration-500 group-hover:brightness-95" style={{ height: "25%" }} />
                <span className="text-[9px] font-bold text-foreground/50 truncate max-w-full">SMA</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-foreground/45 font-bold uppercase tracking-wider mt-4">
              <Building className="w-3.5 h-3.5" />
              <span>Total 4 Unit Aktif</span>
            </div>
          </div>

          {/* Condition doughnut chart (AssetConditionChart.php) */}
          <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-foreground font-serif">Kondisi Aset</h3>
              <p className="text-[11px] text-foreground/50 font-medium">Kondisi fisik aset non-mutasi</p>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FFF2EC" strokeWidth="4.5" />
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="none" 
                  stroke="#3CCF8E" // Green for Bagus
                  strokeWidth="4.5" 
                  strokeDasharray="88 12" 
                  strokeDashoffset="25" 
                  strokeLinecap="round" 
                />
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="none" 
                  stroke="#ef4444" // Red for Rusak
                  strokeWidth="4.5" 
                  strokeDasharray="12 88" 
                  strokeDashoffset="37" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-foreground">{stats.goodPercent}%</span>
                <span className="text-[9px] font-bold text-foreground/40 uppercase">Bagus</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="text-foreground/75 font-bold">Bagus</span>
                </div>
                <span className="font-extrabold text-foreground">{stats.goodAssets} Unit</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-foreground/75 font-bold">Rusak</span>
                </div>
                <span className="font-extrabold text-foreground">{stats.damagedAssets} Unit</span>
              </div>
            </div>
          </div>

          {/* Status distribution chart (AssetStatusChart.php) */}
          <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-foreground font-serif">Status Aset</h3>
              <p className="text-[11px] text-foreground/50 font-medium">Status operasional inventaris</p>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FFF2EC" strokeWidth="4.5" />
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="none" 
                  stroke="#3CCF8E" // Aktif (Green)
                  strokeWidth="4.5" 
                  strokeDasharray="81 19" 
                  strokeDashoffset="25" 
                  strokeLinecap="round" 
                />
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="none" 
                  stroke="#f59e0b" // Diperbaiki (Orange)
                  strokeWidth="4.5" 
                  strokeDasharray="10 90" 
                  strokeDashoffset="44" 
                  strokeLinecap="round" 
                />
                <circle 
                  cx="18" cy="18" r="15.915" 
                  fill="none" 
                  stroke="#ef4444" // Tidak aktif (Red)
                  strokeWidth="4.5" 
                  strokeDasharray="9 91" 
                  strokeDashoffset="54" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-foreground">{stats.activePercent}%</span>
                <span className="text-[9px] font-bold text-foreground/40 uppercase">Aktif</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="text-foreground/75 font-bold">Aktif</span>
                </div>
                <span className="font-extrabold text-foreground">1,010 Unit</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-foreground/75 font-bold">Diperbaiki</span>
                </div>
                <span className="font-extrabold text-foreground">125 Unit</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-foreground/75 font-bold">Tidak Aktif</span>
                </div>
                <span className="font-extrabold text-foreground">105 Unit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Widgets Tables Row (Matching DamagedAssetsWidget & RecentTransfersWidget) */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Transfer Aset Terbaru (RecentTransfersWidget.php) */}
          <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-foreground font-serif">Transfer Aset Terbaru</h3>
                <p className="text-[11px] text-foreground/50 font-medium">Mutasi unit & pemindahan ruangan terupdate</p>
              </div>
              <GitCompare className="w-5 h-5 text-primary" />
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-primary-light/30 border-b border-border-peach">
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">No. Transfer</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Asal Unit</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Ke Lokasi</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Jumlah Aset</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-peach/30">
                  {recentTransfers.map((trsf) => (
                    <tr key={trsf.id} className="hover:bg-primary-light/5 transition-colors">
                      <td className="p-3 text-xs font-bold text-primary">{trsf.transfer_number}</td>
                      <td className="p-3 text-xs font-semibold text-foreground/80">{trsf.unit}</td>
                      <td className="p-3 text-xs font-semibold text-foreground/80 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {trsf.toLocation}
                      </td>
                      <td className="p-3 text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 text-[10px] font-bold">
                          {trsf.assetsCount} Aset
                        </span>
                      </td>
                      <td className="p-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          trsf.status === "completed" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : trsf.status === "approved"
                            ? "bg-sky-100 text-sky-800"
                            : trsf.status === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {trsf.status === "completed" ? "Selesai" : trsf.status === "approved" ? "Disetujui" : trsf.status === "rejected" ? "Ditolak" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aset Rusak - Perlu Perhatian (DamagedAssetsWidget.php) */}
          <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-foreground font-serif">Aset Rusak - Perlu Perhatian</h3>
                <p className="text-[11px] text-foreground/50 font-medium">List inventaris rusak yang butuh penanganan</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-primary-light/30 border-b border-border-peach">
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Nama Aset</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">No. Aset</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Unit</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Lokasi</th>
                    <th className="p-3 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-peach/30">
                  {damagedAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-primary-light/5 transition-colors">
                      <td className="p-3 text-xs">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground">{asset.name}</span>
                          <span className="text-[9px] text-foreground/45 font-bold">{asset.brand}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-bold text-primary">{asset.entries_number}</td>
                      <td className="p-3 text-xs font-semibold text-foreground/75">{asset.unit}</td>
                      <td className="p-3 text-xs font-semibold text-foreground/75">{asset.location}</td>
                      <td className="p-3 text-xs font-extrabold text-foreground">
                        Rp {asset.price.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Quick Actions & Audit Activities Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Actions Card */}
          <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card flex flex-col gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground font-serif">Aksi Cepat</h3>
              <p className="text-[11px] text-foreground/50 font-medium">Lakukan pengisian data dalam satu klik</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <a href="/assets" className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border-peach rounded-2xl gap-2 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white border border-border-peach text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-center">Registrasi Aset</span>
              </a>

              <a href="/transfers" className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border-peach rounded-2xl gap-2 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white border border-border-peach text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <GitCompare className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-center">Ajukan Mutasi</span>
              </a>

              <a href="/dispositions" className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border-peach rounded-2xl gap-2 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white border border-border-peach text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-center">Disposisi Aset</span>
              </a>

              <button 
                onClick={handleScanSimulation}
                className="flex flex-col items-center justify-center p-4 bg-primary-light/40 hover:bg-primary-light text-primary border border-border-peach rounded-2xl gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-border-peach text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-center">Pindai QR</span>
              </button>
            </div>
          </div>

          {/* Audit trail / Activity Feed */}
          <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-foreground font-serif">Aktivitas Terkini</h3>
                <p className="text-[11px] text-foreground/50 font-medium">Audit logs operasi database terbaru</p>
              </div>
              <span className="p-2 bg-primary-light rounded-xl text-primary flex-shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </span>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-4 p-3.5 bg-background border border-border-peach/50 hover:border-primary/30 rounded-2xl transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-primary uppercase tracking-wider">Aset dibuat</span>
                    <span className="text-[10px] text-foreground/45 font-bold">2 menit yang lalu</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                    Adi Sumardi membuat data aset: <span className="font-mono text-[11px] bg-primary-light/40 px-1 py-0.5 rounded text-primary">Laptop ASUS ExpertBook B1 | AST-2026-0001 | BRG-001 | -</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-3.5 bg-background border border-border-peach/50 hover:border-primary/30 rounded-2xl transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Mutasi diubah</span>
                    <span className="text-[10px] text-foreground/45 font-bold">1 jam yang lalu</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                    Budi Utomo merubah mutasi transfer: <span className="font-mono text-[11px] bg-primary-light/40 px-1 py-0.5 rounded text-primary">Mutasi Laptop SD ke SMP | TRF-2026-0002 | - | 1</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* QR Code Scanner Simulation Modal Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-foreground font-serif">Scan QR Code Aset</h3>
              <p className="text-xs text-foreground/50 font-medium mt-1">
                Dekatkan barcode atau QR Code ke kamera laptop Anda
              </p>
            </div>

            {/* Camera Viewfinder Screen Simulation */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center border-2 border-primary">
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
                <div className="flex flex-col items-center justify-center p-8 text-center text-white gap-4 bg-emerald-950/80 w-full h-full animate-in fade-in duration-300">
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
            <div className="flex gap-3">
              <button 
                onClick={() => setIsScanning(false)}
                className="flex-1 py-3 bg-background hover:bg-primary-light/40 border border-border-peach text-foreground/70 hover:text-primary rounded-xl font-bold text-xs transition-colors"
              >
                Tutup
              </button>
              {scanResult && (
                <a
                  href={`/assets`}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs text-center transition-colors shadow-md shadow-primary/10"
                >
                  Buka Detail Aset
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
