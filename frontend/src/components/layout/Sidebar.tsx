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
  Activity
} from "lucide-react";

interface SidebarProps {
  onScanClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ onScanClick, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const toast = useToast();

  useEffect(() => {
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

  const menuGroups = [
    {
      title: "Menu Utama",
      items: [
        { name: "Ringkasan", href: "/", icon: LayoutDashboard },
      ]
    },
    {
      title: "Manajemen Aset",
      items: [
        { name: "Daftar Aset", href: "/assets", icon: Boxes },
        { name: "Transfer Aset", href: "/transfers", icon: GitCompare },
        { name: "Disposisi Aset", href: "/dispositions", icon: Trash2 },
      ]
    },
    {
      title: "Master Data",
      items: [
        { name: "Lokasi", href: "/locations", icon: MapPin },
        { name: "Unit Kerja", href: "/units", icon: Building },
        { name: "Kategori", href: "/categories", icon: Tag },
        { name: "Alat / Barang", href: "/tools", icon: Wrench },
        { name: "Tahun Pengadaan", href: "/years", icon: Calendar },
        { name: "Klasifikasi Aktiva", href: "/aktiva", icon: FileText },
        { name: "Kelola User", href: "/users", icon: Users },
      ]
    },
    {
      title: "Log Sistem",
      items: [
        { name: "Log Aktivitas", href: "/activities", icon: Activity },
      ]
    }
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      <aside className={`
        w-72 bg-white border-r border-border-peach flex flex-col justify-between h-screen p-6 z-50
        fixed top-0 left-0 transition-transform duration-300 transform lg:translate-x-0 lg:sticky
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col gap-6 h-[85%]">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 transform hover:rotate-6 transition-transform">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground font-serif">
                  SIMA<span className="text-primary">YA</span>
                </h1>
                <p className="text-[10px] text-foreground/50 tracking-wider font-semibold uppercase">
                  Asset Management
                </p>
              </div>
            </div>
            
            {onClose && (
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-background border border-border-peach text-foreground/60 hover:text-primary flex lg:hidden items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scan QR Quick Action */}
          <button 
            onClick={() => {
              if (onScanClick) onScanClick();
              handleLinkClick();
            }}
            className="flex items-center justify-center gap-3 w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-semibold text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform active:scale-98 group flex-shrink-0"
          >
            <QrCode className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Scan QR Code</span>
          </button>

          {/* Navigation Menu - Scrollable Area */}
          <nav className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 custom-sidebar-nav">
            {menuGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-foreground/35 uppercase tracking-wider px-3 mb-1.5">
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
                          ? "bg-primary-light text-primary shadow-sm shadow-primary/5"
                          : "text-foreground/75 hover:text-primary hover:bg-primary-light/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-primary" : "text-foreground/45 group-hover:text-primary"
                      }`} />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1 h-4 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Profile & Settings */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <hr className="border-border-peach/70" />
          
          {/* Settings Link */}
          <Link
            href="/settings"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
              pathname === "/settings"
                ? "bg-primary-light text-primary"
                : "text-foreground/75 hover:text-primary hover:bg-primary-light/40"
            }`}
          >
            <Settings className="w-4 h-4 text-foreground/45 group-hover:text-primary group-hover:rotate-45 transition-transform" />
            <span>Pengaturan</span>
          </Link>

          {/* User Card */}
          <div className="p-2.5 bg-primary-light/25 border border-border-peach/70 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-border-peach flex items-center justify-center font-bold text-xs text-primary font-serif">
                {user ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-foreground leading-tight">{user ? user.name : "Pengguna"}</span>
                <span className="text-[9px] text-foreground/45 font-semibold capitalize">{user ? user.role : "Operator"}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-7 h-7 rounded-lg bg-white border border-border-peach/70 hover:border-primary/50 text-foreground/50 hover:text-primary flex items-center justify-center transition-colors shadow-sm cursor-pointer"
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
