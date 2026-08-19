"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  LayoutDashboard, 
  Boxes, 
  MapPin, 
  GitCompare, 
  Trash2, 
  Settings, 
  LogOut,
  QrCode,
  X,
  Building,
  Tag,
  Wrench,
  Calendar,
  FileText,
  Users,
  Activity,
  FileSpreadsheet,
  TrendingDown,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onScanClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ onScanClick, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const handleLogout = () => {
    toast.confirm("Apakah Anda yakin ingin keluar dari aplikasi?", async () => {
      try {
        await api.post("/logout");
      } catch (e) {
        console.error("Logout request failed", e);
      } finally {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
      }
    });
  };

  const isSuperAdmin = !user || user?.role === "super_admin" || user?.role === "admin" || !user?.unit_id;

  const menuGroups = [
    {
      title: "Menu Utama",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
      ]
    },
    {
      title: "Manajemen Aset",
      items: [
        { name: "Daftar Aset", href: "/assets", icon: Boxes },
        { name: "Cetak Label QR", href: "/qrcode", icon: QrCode },
        { name: "Transfer Aset", href: "/transfers", icon: GitCompare },
        { name: "Disposisi Aset", href: "/dispositions", icon: Trash2 },
        { name: "Laporan Penyusutan", href: "/depreciation", icon: TrendingDown },
        { name: "Laporan Kerusakan", href: "/reports", icon: AlertTriangle },
      ]
    },
    {
      title: "Master Data",
      items: [
        { name: "Lokasi / Ruangan", href: "/locations", icon: MapPin },
        ...(isSuperAdmin ? [{ name: "Unit Kerja", href: "/units", icon: Building }] : []),
        { name: "Kategori", href: "/categories", icon: Tag },
        { name: "Alat / Barang", href: "/tools", icon: Wrench },
        { name: "Tahun Pengadaan", href: "/years", icon: Calendar },
        ...(isSuperAdmin ? [{ name: "Klasifikasi Aktiva", href: "/aktiva", icon: FileText }] : []),
        ...(isSuperAdmin ? [{ name: "Kelola User", href: "/users", icon: Users }] : []),
      ]
    },
    ...(isSuperAdmin ? [{
      title: "Log Sistem",
      items: [
        { name: "Log Aktivitas", href: "/activities", icon: Activity },
      ]
    }] : [])
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] lg:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      <aside className={`
        w-72 max-w-[85vw] bg-card border-r border-border flex flex-col justify-between p-5
        fixed inset-y-0 left-0 z-[999] h-[100dvh] transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:translate-x-0 lg:max-w-none
        ${isOpen ? "translate-x-0 shadow-2xl shadow-black/40" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col gap-5 flex-1 min-h-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 transform hover:rotate-6 transition-transform overflow-hidden shrink-0 bg-white p-0.5 border border-border">
                <img src="/images/yapi.png" alt="Logo YAPI" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground font-serif">
                  SIMA<span className="text-primary">YA</span>
                </h1>
                <p className="text-[10px] text-muted-foreground tracking-wider font-semibold uppercase">
                  Asset Management
                </p>
              </div>
            </div>
            
            {onClose && (
              <button 
                type="button"
                onClick={onClose}
                aria-label="Tutup Menu"
                className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted border border-border text-muted-foreground hover:text-foreground flex lg:hidden items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scan QR Quick Action */}
          <Button 
            onClick={() => {
              if (onScanClick) onScanClick();
              handleLinkClick();
            }}
            className="w-full h-11 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-primary/20 text-xs font-bold group flex-shrink-0"
          >
            <QrCode className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Scan QR Code</span>
          </Button>

          {/* Navigation Menu - Scrollable Area */}
          <nav className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 custom-sidebar-nav">
            {menuGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider px-3 mb-1">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isActive
                          ? "bg-primary-light text-primary font-bold shadow-sm shadow-primary/5"
                          : "text-foreground/75 hover:text-primary hover:bg-muted/70"
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      }`} />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-4 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Profile & Settings */}
        <div className="flex flex-col gap-2.5 flex-shrink-0 pt-3 border-t border-border">
          {/* Settings Link */}
          <Link
            href="/settings"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
              pathname === "/settings"
                ? "bg-primary-light text-primary font-bold"
                : "text-foreground/75 hover:text-primary hover:bg-muted/70"
            }`}
          >
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:rotate-45 transition-transform" />
            <span>Pengaturan</span>
          </Link>

          {/* User Card */}
          <div className="p-2.5 bg-muted/40 border border-border rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary-light text-primary border border-primary/20 flex items-center justify-center font-bold text-xs font-serif shrink-0">
                {mounted && user ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-foreground truncate leading-tight">{mounted && user ? user.name : "Pengguna"}</span>
                <span className="text-[9px] text-muted-foreground font-semibold capitalize truncate">{mounted && user ? user.role : "Operator"}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-7 h-7 rounded-xl bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors shadow-sm cursor-pointer shrink-0"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
