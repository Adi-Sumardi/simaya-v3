"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Settings, Save, Shield, Database, Bell, Menu } from "lucide-react";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto max-h-screen w-full">
        
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-border-peach/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-background border border-border-peach hover:text-primary flex lg:hidden items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Pengaturan Sistem</h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">Konfigurasi preferensi aplikasi, integrasi API, dan hak akses.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors w-full sm:w-auto justify-center">
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </header>

        <section className="bg-white border border-border-peach rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-8">
          {/* General Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4.5 h-4.5" />
              <span>Pengaturan Umum</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground/70">Nama Aplikasi</label>
                <input 
                  type="text" 
                  defaultValue="SIMAYA - Sistem Informasi Manajemen Aset"
                  className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground/70">Default Unit Kerja</label>
                <select className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all">
                  <option>Kantor Pusat Yayasan</option>
                  <option>Unit SDM</option>
                  <option>Unit Humas</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-border-peach/50" />

          {/* Database Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4.5 h-4.5" />
              <span>Integrasi & API Backend</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground/70">Endpoint URL Backend (Laravel)</label>
                <input 
                  type="url" 
                  defaultValue="http://localhost:8000/api"
                  className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground/70">API Key Authorization</label>
                <input 
                  type="password" 
                  defaultValue="••••••••••••••••••••••••••••"
                  className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
